import { GoogleGenAI } from '@google/genai';
import {
  hasSufficientMedicalKeywords,
  countMedicalKeywords,
} from '../utils/medicalKeywords.js';

// Shared AI client (re-used across validator calls)
let _ai = null;
const getAI = () => {
  if (!_ai) _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return _ai;
};

// ---------------------------------------------------------------------------
// Gate 1: Keyword check — free, ~0ms
// ---------------------------------------------------------------------------
export const passesKeywordCheck = (text) => {
  const { hits, count } = countMedicalKeywords(text);
  console.log(
    `[Validator] Keyword check: ${count} hit(s) — [${hits.slice(0, 5).join(', ')}${hits.length > 5 ? '…' : ''}]`
  );
  return hasSufficientMedicalKeywords(text);
};

// ---------------------------------------------------------------------------
// Gate 2: LLM validation — cheap (~0.5-1s), only called on keyword miss
// ---------------------------------------------------------------------------
export const passesLLMValidation = async (text) => {
  // Use only the first 300 words — headers contain the most signal
  const excerpt = text.split(/\s+/).slice(0, 300).join(' ');

  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-flash',
    contents:
      `Look at the following document excerpt. Is it any type of medical or health report? ` +
      `This includes: blood tests, CBC, haematology, pathology, radiology (X-Ray, MRI, CT scan, Ultrasound), ` +
      `cardiology, lab reports, histopathology, urine analysis, or any clinical document.\n` +
      `Reply with ONLY one word: YES or NO.\n\n---\n${excerpt}`,
    config: {
      temperature: 0,
      maxOutputTokens: 5,
    },
  });

  const reply = (response.text || '').trim().toUpperCase();
  console.log(`[Validator] LLM validation reply: "${reply}"`);
  return reply.includes('YES');
};

// ---------------------------------------------------------------------------
// Main export: hybrid validator — used by analysisService before AI analysis
// Throws a typed error (error.code = 'INVALID_REPORT_TYPE') if not a medical doc
// ---------------------------------------------------------------------------
export const validateMedicalReport = async (text) => {
  // Gate 1 — fast path (keyword check)
  if (passesKeywordCheck(text)) {
    console.log('[Validator] PASSED — keyword check');
    return;
  }

  // Gate 2 — LLM fallback
  console.log('[Validator] Keyword check failed. Running LLM validation…');
  let isValid = false;

  try {
    isValid = await passesLLMValidation(text);
  } catch (llmError) {
    // Fail-open: if the validator itself has an API error, don't block users
    console.error('[Validator] LLM validation call failed — allowing upload:', llmError.message);
    return;
  }

  if (!isValid) {
    const err = new Error(
      "The uploaded file doesn't appear to be a medical report. " +
      'Please upload a valid medical document such as a lab report, blood test, radiology report, or clinical report.'
    );
    err.code = 'INVALID_REPORT_TYPE';
    throw err;
  }

  console.log('[Validator] PASSED — LLM check');
};

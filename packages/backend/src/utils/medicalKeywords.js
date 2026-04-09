

export const MEDICAL_REPORT_KEYWORDS = [
  // --- Blood / CBC / Haematology ---
  'haemoglobin', 'hemoglobin', 'hematocrit', 'wbc', 'rbc',
  'platelet', 'lymphocyte', 'neutrophil', 'eosinophil', 'basophil', 'monocyte',
  'cbc', 'complete blood count', 'hb', 'mcv', 'mch', 'mchc', 'rdw',
  'haematology', 'hematology', 'blood count', 'differential count',

  // --- Biochemistry / Liver / Kidney / Lipid panels ---
  'creatinine', 'bilirubin', 'albumin', 'urea', 'glucose',
  'cholesterol', 'triglyceride', 'uric acid', 'sgpt', 'sgot',
  'alt', 'ast', 'alkaline phosphatase', 'ggt', 'ldl', 'hdl',
  'vldl', 'lipid profile', 'liver function', 'renal function',
  'kidney function', 'lft', 'kft', 'rft',

  // --- Endocrine / Metabolic / Vitamins ---
  'thyroid', 'tsh', 'thyroxine', 't3', 't4',
  'hba1c', 'insulin', 'ferritin', 'vitamin d', 'vitamin b12',
  'cortisol', 'testosterone', 'estrogen', 'progesterone',
  'fasting glucose', 'post prandial', 'prediabetes', 'diabetes',

  // --- Electrolytes / Minerals ---
  'sodium', 'potassium', 'calcium', 'phosphorus', 'magnesium', 'chloride',

  // --- Urology / Genito-urinary ---
  'urine', 'urinalysis', 'creatinine clearance', 'gfr', 'urine protein',
  'pus cells', 'epithelial cells', 'urine culture',

  // --- Cardiology ---
  'ecg', 'electrocardiogram', 'echocardiogram', 'troponin',
  'bnp', 'cardiac', 'ejection fraction', 'blood pressure',

  // --- Imaging / Radiology ---
  'x-ray', 'xray', 'ultrasound', 'mri', 'ct scan', 'sonography',
  'mammography', 'impression', 'findings', 'radiograph',

  // --- Pathology / Histology ---
  'pathology', 'histopathology', 'biopsy', 'cytology', 'smear',
  'culture', 'sensitivity', 'microscopy',

  // --- General medical report terminology ---
  'lab report', 'clinical laboratory', 'specimen', 'reference range',
  'normal range', 'patient name', 'sample collected', 'report date',
  'diagnosis', 'impression', 'physician', 'doctor',
];

export const KEYWORD_MATCH_THRESHOLD = 3;

/**
 * Counts how many medical keywords appear in the given text.
 * @param {string} text
 * @returns {{ hits: string[], count: number }}
 */
export const countMedicalKeywords = (text) => {
  const lower = text.toLowerCase();
  const hits = MEDICAL_REPORT_KEYWORDS.filter((kw) => lower.includes(kw));
  return { hits, count: hits.length };
};

/**
 * Returns true if the text contains enough medical keywords to be
 * considered a medical report without any LLM call.
 * @param {string} text
 * @returns {boolean}
 */
export const hasSufficientMedicalKeywords = (text) => {
  const { count } = countMedicalKeywords(text);
  return count >= KEYWORD_MATCH_THRESHOLD;
};

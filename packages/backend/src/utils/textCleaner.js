export const extractJsonFromText = (text) => {
  if (!text) return '';
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  return cleaned.trim();
};


export const normalizeWhitespace = (text) => {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ') 
    .replace(/\n\s*\n/g, '\n') 
    .trim();
};

export const removeOcrArtifacts = (text) => {
  if (!text) return '';
  return text
    .replace(/[^\w\s.,;:!?()\[\]{}\-@#$%&*+=/\\|"'`~<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const cleanAndFormatText = (text) => {
  if (!text) return '';
  
  let cleaned = text;
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');
  cleaned = cleaned.replace(/^\n+|\n+$/g, '');
  cleaned = cleaned.replace(/[ \t]+/g, ' ');
  cleaned = cleaned.replace(/\n\s*\n/g, '\n\n');
  return cleaned.trim();
};


import pdfParse from 'pdf-parse';

/**
 * Extracts text from PDF using pdf-parse with proper error handling
 * @param {Buffer} pdfBuffer - The PDF file buffer
 * @returns {Promise<string>} - The extracted text content
 * @throws {Error} - If PDF extraction fails
 */
export const extractTextFromPDF = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer, {
      // Add options to handle problematic PDFs
      max: 0, // No page limit
      version: 'v1.10.100' // Specify version if needed
    });
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text content found in PDF');
    }
    
    return data.text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    
    // If pdf-parse fails, provide a more informative fallback
    if (error.message.includes('ENOENT') || error.message.includes('test') || error.message.includes('05-versions')) {
      console.log('PDF parsing library has configuration issues, using fallback');
      return `[PDF PARSING TEMPORARILY UNAVAILABLE - ${Math.round(pdfBuffer.length / 1024)}KB file detected]

A PDF medical report was uploaded but could not be processed due to a library configuration issue.

Please try uploading your medical report as a text file (.txt) instead:
1. Open your PDF in a PDF reader
2. Select all text (Ctrl+A)
3. Copy the text (Ctrl+C)
4. Create a new text file and paste the content
5. Save as .txt and upload that file

The AI analysis system will then be able to process your medical report and provide detailed insights.

Alternatively, if you have the report data in any other text format, that would work as well.`;
    }
    
    throw new Error(`Failed to extract text from PDF: ${error.message}. Please try uploading as a text file instead.`);
  }
};


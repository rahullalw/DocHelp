import { processReport } from '../../services/analysisService.js';

/**
 * Controller to handle the medical report analysis request.
 * It acts as a bridge between the API route and the business logic (service).
 */
export const analyzeReport = async (req, res) => {
  try {
    // 1. Basic Validation: Check if a file was uploaded.
    // The 'file' object is added to the request by the multer middleware.
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please provide a report.' });
    }

    // 2. Delegate to the Service Layer
    // We pass the file buffer to the service for processing.
    // The service layer contains the core logic and is decoupled from Express.
    const analysis = await processReport(req.file);

    // 3. Send a successful response
    return res.status(200).json({ 
      message: 'Analysis successful',
      analysis: analysis 
    });

  } catch (error) {
    // 4. Error Handling
    // Log the error for debugging and send a generic server error message.
    console.error('Error in analysisController:', error.message);
    return res.status(500).json({ message: error.message || 'An internal server error occurred.' });
  }
};

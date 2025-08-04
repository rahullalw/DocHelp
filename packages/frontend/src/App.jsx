import React, { useState, useCallback } from 'react';

// Main application component
export default function App() {
  // State management for the component
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('Select a file to begin.');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Handles file selection from the input
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus(`File selected: ${selectedFile.name}`);
      setAnalysisResult(null); // Reset previous results
    }
  };

  // Handles the form submission to upload and analyze the file
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setStatus('Uploading and analyzing... please wait.');
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('report', file);

    try {
      // The backend URL is proxied via vite.config.js in a real scenario
      // For this MVP, we use the direct URL
      const response = await fetch('http://localhost:3001/api/v1/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Catches HTTP errors like 500 or 400
        throw new Error(data.message || 'An error occurred during analysis.');
      }

      // On success
      setAnalysisResult(data.analysis);
      setStatus('Analysis complete.');

    } catch (error) {
      // Catches network errors or errors thrown from the response check
      console.error('Upload error:', error);
      setStatus(`Error: ${error.message}`);
      setAnalysisResult(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
        setFile(droppedFile);
        setStatus(`File selected: ${droppedFile.name}`);
        setAnalysisResult(null);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">Medical Report Analyzer</h1>
          <p className="text-slate-600 mt-2">Upload a medical report (e.g., PDF, TXT) to get an AI-powered analysis.</p>
        </header>

        <main className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <div 
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors duration-200 ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.txt,.md"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <p className="text-slate-500">{file ? file.name : 'Drag & drop a file here, or click to select'}</p>
              </label>
            </div>

            <div className="mt-6 text-center">
              <button
                type="submit"
                disabled={!file || isUploading}
                className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isUploading ? 'Analyzing...' : 'Analyze Report'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <h2 className="font-semibold text-slate-700">Status</h2>
            <p className="text-slate-600 text-sm mt-1 p-3 bg-slate-100 rounded-md">{status}</p>
          </div>

          {analysisResult && (
            <div className="mt-6">
              <h2 className="font-semibold text-slate-700">Analysis Results</h2>
              <div className="mt-2 p-4 bg-gray-50 rounded-md border border-gray-200 text-sm">
                <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(analysisResult, null, 2)}</pre>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

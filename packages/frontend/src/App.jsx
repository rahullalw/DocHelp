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
    <div className="min-h-screen w-full relative">
      {/* Radial Gradient Background from Bottom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #6366f1 100%)",
        }}
      />
      {/* Your Content/Components */}
      <div className="relative z-10 min-h-screen flex items-center justify-center font-sans p-4">
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
              <h2 className="font-semibold text-slate-700 mb-4">Analysis Results</h2>
              
              {/* Patient Summary */}
              {analysisResult.patient_summary && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Report Summary</h3>
                  <p><strong>Type:</strong> {analysisResult.patient_summary.report_type}</p>
                  <p><strong>Overall Status:</strong> {analysisResult.patient_summary.overall_health_status}</p>
                  {analysisResult.patient_summary.key_parameters_analyzed && (
                    <p><strong>Parameters Analyzed:</strong> {analysisResult.patient_summary.key_parameters_analyzed.join(', ')}</p>
                  )}
                </div>
              )}

              {/* Abnormal Findings */}
              {analysisResult.abnormal_findings && analysisResult.abnormal_findings.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-800 mb-3">⚠️ Abnormal Findings</h3>
                  {analysisResult.abnormal_findings.map((finding, index) => (
                    <div key={index} className="mb-3 p-3 bg-white rounded border-l-4 border-red-400">
                      <p><strong>{finding.parameter}</strong> - <span className={`px-2 py-1 rounded text-sm ${finding.severity === 'High' ? 'bg-red-100 text-red-800' : finding.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{finding.severity}</span></p>
                      <p><strong>Value:</strong> {finding.value} (Normal: {finding.normal_range})</p>
                      <p className="text-sm text-gray-600 mt-1">{finding.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Health Concerns */}
              {analysisResult.health_concerns && analysisResult.health_concerns.length > 0 && (
                <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-3">🔍 Health Concerns</h3>
                  {analysisResult.health_concerns.map((concern, index) => (
                    <div key={index} className="mb-3 p-3 bg-white rounded border-l-4 border-orange-400">
                      <p><strong>{concern.concern}</strong> - <span className={`px-2 py-1 rounded text-sm ${concern.risk_level === 'High' ? 'bg-red-100 text-red-800' : concern.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{concern.risk_level} Risk</span></p>
                      <p className="text-sm text-gray-600 mt-1">{concern.description}</p>
                      {concern.potential_complications && (
                        <p className="text-sm text-gray-500 mt-1"><strong>Potential complications:</strong> {concern.potential_complications}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-3">💡 Recommendations</h3>
                  {analysisResult.recommendations.map((rec, index) => (
                    <div key={index} className="mb-3 p-3 bg-white rounded border-l-4 border-green-400">
                      <p><strong>{rec.category}</strong> - <span className={`px-2 py-1 rounded text-sm ${rec.priority === 'High' ? 'bg-red-100 text-red-800' : rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{rec.priority} Priority</span></p>
                      <p className="text-sm mt-1">{rec.recommendation}</p>
                      {rec.timeframe && (
                        <p className="text-sm text-gray-500 mt-1"><strong>Timeframe:</strong> {rec.timeframe}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Follow-up Care */}
              {analysisResult.follow_up_care && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-3">📅 Follow-up Care</h3>
                  <div className="space-y-2">
                    {analysisResult.follow_up_care.next_appointment && (
                      <p><strong>Next Appointment:</strong> {analysisResult.follow_up_care.next_appointment}</p>
                    )}
                    {analysisResult.follow_up_care.tests_needed && analysisResult.follow_up_care.tests_needed.length > 0 && (
                      <p><strong>Additional Tests:</strong> {analysisResult.follow_up_care.tests_needed.join(', ')}</p>
                    )}
                    {analysisResult.follow_up_care.specialists_to_consult && analysisResult.follow_up_care.specialists_to_consult.length > 0 && (
                      <p><strong>Specialist Consultations:</strong> {analysisResult.follow_up_care.specialists_to_consult.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Confidence Score */}
              {analysisResult.confidence_score && (
                <div className="p-3 bg-gray-50 rounded border text-center">
                  <p className="text-sm text-gray-600">Analysis Confidence: <strong>{Math.round(analysisResult.confidence_score * 100)}%</strong></p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <p className="text-yellow-800"><strong>⚠️ Medical Disclaimer:</strong> This analysis is for informational purposes only and should not replace professional medical advice. Always consult with qualified healthcare professionals for proper diagnosis and treatment.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </div>
  );
}

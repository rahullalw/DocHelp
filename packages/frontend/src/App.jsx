import React, { useState, useCallback, useRef, useEffect } from 'react';

const API_BASE = 'http://localhost:3001/api/v1';

// Icons as simple components
const UploadIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const HeartPulseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const LightbulbIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// Typing indicator component
const TypingIndicator = () => (
  <div className="chat-bubble assistant">
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
);

// Status badge component
const StatusBadge = ({ status, children }) => {
  const statusClass = status?.toLowerCase() || 'low';
  return (
    <span className={`status-badge ${statusClass}`}>
      {children || status}
    </span>
  );
};

export default function App() {
  // State management
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [persona, setPersona] = useState(null);
  const [error, setError] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // Refs
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // File handlers
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setAnalysisResult(null);
      setProjectId(null);
      setMessages([]);
    }
  };

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
      setError(null);
        setAnalysisResult(null);
      setProjectId(null);
      setMessages([]);
    }
  }, []);

  // Upload and analyze
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('report', file);

    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Analysis failed');
      }

      setAnalysisResult(data.analysis);
      setProjectId(data.projectId);
      setPersona(data.persona);
      
      // Add welcome message from doctor
      setMessages([{
        role: 'assistant',
        content: `Hello${data.persona?.name ? `, ${data.persona.name}` : ''}! I'm Dr. HealthGuide, and I've reviewed your ${data.persona?.reportType || 'medical report'}. I'm here to help you understand your results and answer any questions you might have. What would you like to know?`
      }]);
      setShowChat(true);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Send chat message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !projectId || isSending) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsSending(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, message: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I apologize, but I encountered an error: ${err.message}. Please try again.` 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  // Clear chat
  const clearChat = async () => {
    if (!projectId) return;
    
    try {
      await fetch(`${API_BASE}/chat/${projectId}`, { method: 'DELETE' });
      setMessages([{
        role: 'assistant',
        content: "I've cleared our conversation history. Feel free to ask me anything about your report!"
      }]);
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  };

  // Reset everything
  const resetAll = () => {
    setFile(null);
    setAnalysisResult(null);
    setProjectId(null);
    setPersona(null);
    setMessages([]);
    setError(null);
    setShowChat(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-sage-200/50 bg-white/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-mint-400 to-sage-500 rounded-xl flex items-center justify-center text-white shadow-md">
                <HeartPulseIcon />
              </div>
              <div>
                <h1 className="font-display text-xl font-semibold text-sage-800">DocHelp</h1>
                <p className="text-xs text-sage-500">AI Medical Report Analyzer</p>
              </div>
            </div>
            {analysisResult && (
              <button
                onClick={resetAll}
                className="flex items-center gap-2 px-4 py-2 text-sm text-sage-600 hover:text-sage-800 hover:bg-sage-100 rounded-lg transition-colors"
              >
                <RefreshIcon />
                New Analysis
              </button>
            )}
          </div>
        </div>
        </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysisResult ? (
          /* Upload Section */
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-sage-800 mb-3">
                Understand Your Health
              </h2>
              <p className="text-sage-600 text-lg">
                Upload your medical report and get an AI-powered analysis with personalized guidance
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit}>
            <div 
                  className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
            >
              <input
                    ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                    accept=".pdf,.txt"
                  />
                  
                  <div className="flex flex-col items-center gap-4">
                    <div className={`text-sage-400 transition-colors ${isDragOver ? 'text-mint-500' : ''}`}>
                      <UploadIcon />
                    </div>
                    
                    {file ? (
                      <div className="flex items-center gap-3 px-4 py-2 bg-sage-100 rounded-lg">
                        <FileIcon />
                        <span className="font-medium text-sage-700">{file.name}</span>
                        <span className="text-sm text-sage-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sage-600 font-medium">
                          Drop your medical report here
                        </p>
                        <p className="text-sm text-sage-400">
                          or click to browse • PDF, TXT supported
                        </p>
                      </>
                    )}
                  </div>
            </div>

                {error && (
                  <div className="mt-4 p-4 bg-coral-50 border border-coral-200 rounded-xl flex items-start gap-3">
                    <AlertTriangleIcon />
                    <p className="text-coral-700 text-sm">{error}</p>
                  </div>
                )}

              <button
                type="submit"
                disabled={!file || isUploading}
                  className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="spinner" />
                      Analyzing your report...
                    </>
                  ) : (
                    <>
                      <HeartPulseIcon />
                      Analyze Report
                    </>
                  )}
              </button>
              </form>

              <p className="mt-6 text-center text-xs text-sage-400">
                Your data is processed securely and not stored permanently
              </p>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              {[
                { icon: '🔍', title: 'Smart Analysis', desc: 'AI-powered report parsing' },
                { icon: '💬', title: 'Ask Questions', desc: 'Chat with Dr. HealthGuide' },
                { icon: '📋', title: 'Clear Insights', desc: 'Easy-to-understand results' },
              ].map((feature, i) => (
                <div 
                  key={i} 
                  className="glass-card rounded-xl p-4 text-center animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h3 className="font-medium text-sage-700">{feature.title}</h3>
                  <p className="text-sm text-sage-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Results Section */
          <div className="grid lg:grid-cols-5 gap-6 animate-fade-in">
            {/* Analysis Results - Left Panel */}
            <div className="lg:col-span-3 space-y-6">
              {/* Patient Summary */}
              {analysisResult.patient_summary && (
                <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center text-sage-600">
                      <FileIcon />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-sage-800">
                        Report Summary
                      </h3>
                      <p className="text-sm text-sage-500">
                        {analysisResult.patient_summary.report_type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {analysisResult.patient_summary.name && (
                      <div className="p-3 bg-sage-50 rounded-lg">
                        <p className="text-xs text-sage-500 mb-1">Patient</p>
                        <p className="font-medium text-sage-700">{analysisResult.patient_summary.name}</p>
                      </div>
                    )}
                    {analysisResult.patient_summary.age && (
                      <div className="p-3 bg-sage-50 rounded-lg">
                        <p className="text-xs text-sage-500 mb-1">Age</p>
                        <p className="font-medium text-sage-700">{analysisResult.patient_summary.age} years</p>
                      </div>
                    )}
                    {analysisResult.patient_summary.report_date && (
                      <div className="p-3 bg-sage-50 rounded-lg">
                        <p className="text-xs text-sage-500 mb-1">Report Date</p>
                        <p className="font-medium text-sage-700">{analysisResult.patient_summary.report_date}</p>
                      </div>
                    )}
                    <div className="p-3 bg-sage-50 rounded-lg sm:col-span-2">
                      <p className="text-xs text-sage-500 mb-1">Overall Status</p>
                      <p className="font-medium text-sage-700">{analysisResult.patient_summary.overall_health_status}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Abnormal Findings */}
              {analysisResult.abnormal_findings?.length > 0 && (
                <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-coral-100 rounded-xl flex items-center justify-center text-coral-600">
                      <AlertTriangleIcon />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-sage-800">
                      Abnormal Findings
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {analysisResult.abnormal_findings.map((finding, i) => (
                      <div key={i} className="finding-card abnormal">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-medium text-coral-800">{finding.parameter}</h4>
                          <StatusBadge status={finding.status === 'high' || finding.status === 'low' ? 'high' : 'moderate'}>
                            {finding.status}
                          </StatusBadge>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <p><span className="text-coral-600">Value:</span> {finding.value} {finding.unit}</p>
                          <p><span className="text-coral-600">Normal:</span> {finding.normal_range}</p>
                        </div>
                        {finding.clinical_significance && (
                          <p className="mt-2 text-sm text-coral-700/80">{finding.clinical_significance}</p>
                        )}
                    </div>
                  ))}
                  </div>
                </div>
              )}

              {/* Health Concerns */}
              {analysisResult.health_concerns?.length > 0 && (
                <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                      <AlertTriangleIcon />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-sage-800">
                      Health Concerns
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {analysisResult.health_concerns.map((concern, i) => (
                      <div key={i} className="finding-card concern">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-medium text-amber-800">{concern.concern}</h4>
                          <StatusBadge status={concern.severity}>{concern.severity}</StatusBadge>
                        </div>
                        {concern.related_findings?.length > 0 && (
                          <p className="text-sm text-amber-700/80">
                            Related: {concern.related_findings.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Normal Findings */}
              {analysisResult.normal_findings?.length > 0 && (
                <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-mint-100 rounded-xl flex items-center justify-center text-mint-600">
                      <CheckCircleIcon />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-sage-800">
                      Normal Findings
                    </h3>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-2">
                    {analysisResult.normal_findings.slice(0, 8).map((finding, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-mint-50 rounded-lg border border-mint-100">
                        <span className="text-sm text-mint-800">{finding.parameter}</span>
                        <span className="text-sm font-medium text-mint-700">{finding.value} {finding.unit}</span>
                    </div>
                  ))}
                  </div>
                  {analysisResult.normal_findings.length > 8 && (
                    <p className="text-sm text-sage-500 mt-3 text-center">
                      + {analysisResult.normal_findings.length - 8} more normal parameters
                    </p>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {analysisResult.recommendations?.length > 0 && (
                <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-cream-100 rounded-xl flex items-center justify-center text-cream-700">
                      <LightbulbIcon />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-sage-800">
                      Recommendations
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {analysisResult.recommendations.map((rec, i) => (
                      <div key={i} className="finding-card recommendation">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <span className="text-xs font-medium uppercase tracking-wide text-cream-700 bg-cream-200 px-2 py-1 rounded">
                            {rec.category}
                          </span>
                          <StatusBadge status={rec.priority}>{rec.priority}</StatusBadge>
                        </div>
                        <p className="text-sage-700">{rec.recommendation}</p>
                    </div>
                  ))}
                  </div>
                </div>
              )}

              {/* Follow-up Care */}
              {analysisResult.follow_up_care && (
                <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center text-sage-600">
                      <CalendarIcon />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-sage-800">
                      Follow-up Care
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {analysisResult.follow_up_care.suggested_tests?.length > 0 && (
                      <div className="p-3 bg-sage-50 rounded-lg">
                        <p className="text-xs text-sage-500 mb-2">Suggested Tests</p>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.follow_up_care.suggested_tests.map((test, i) => (
                            <span key={i} className="px-3 py-1 bg-white text-sm text-sage-700 rounded-full border border-sage-200">
                              {test}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {analysisResult.follow_up_care.specialist_referrals?.length > 0 && (
                      <div className="p-3 bg-sage-50 rounded-lg">
                        <p className="text-xs text-sage-500 mb-2">Specialist Referrals</p>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.follow_up_care.specialist_referrals.map((spec, i) => (
                            <span key={i} className="px-3 py-1 bg-white text-sm text-sage-700 rounded-full border border-sage-200">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {analysisResult.follow_up_care.timeline && (
                      <div className="p-3 bg-sage-50 rounded-lg">
                        <p className="text-xs text-sage-500 mb-1">Timeline</p>
                        <p className="text-sage-700">{analysisResult.follow_up_care.timeline}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fade-in-up">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Medical Disclaimer:</strong> This analysis is for informational purposes only 
                  and should not replace professional medical advice. Always consult with qualified 
                  healthcare professionals for proper diagnosis and treatment.
                </p>
              </div>
            </div>

            {/* Chat Panel - Right Side */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-2xl overflow-hidden sticky top-24 animate-slide-in-right">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-sage-600 to-sage-700 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <ChatBubbleIcon />
                      </div>
                      <div>
                        <h3 className="font-medium">Dr. HealthGuide</h3>
                        <p className="text-xs text-sage-200">AI Medical Advisor</p>
                      </div>
                    </div>
                    <button
                      onClick={clearChat}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Clear conversation"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-sage-50/50">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`chat-bubble ${msg.role} animate-fade-in-up`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                  
                  {isSending && <TypingIndicator />}
                  
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-sage-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask about your report..."
                      className="flex-1 px-4 py-3 bg-sage-50 border border-sage-200 rounded-xl text-sage-800 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent"
                      disabled={isSending}
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isSending}
                      className="px-4 py-3 bg-sage-700 text-white rounded-xl hover:bg-sage-800 disabled:bg-sage-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <SendIcon />
                    </button>
                  </div>
                  
                  {/* Quick Questions */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      'What should I do next?',
                      'Explain my results',
                      'Any dietary changes?',
                    ].map((q, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setInputMessage(q)}
                        className="px-3 py-1.5 text-xs text-sage-600 bg-sage-100 hover:bg-sage-200 rounded-full transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </form>
              </div>
              </div>
            </div>
          )}
        </main>

      {/* Footer */}
      <footer className="border-t border-sage-200/50 bg-white/40 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-sage-500">
            DocHelp — AI-powered medical report analysis. Not a substitute for professional medical advice.
          </p>
      </div>
      </footer>
    </div>
  );
}

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  SignInButton, 
  SignUpButton, 
  UserButton, 
  useUser, 
  useAuth,
  SignedIn,
  SignedOut
} from '@clerk/clerk-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ============================================================================
// ICONS
// ============================================================================

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

const FolderIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

// ============================================================================
// COMPONENTS
// ============================================================================

const TypingIndicator = () => (
  <div className="chat-bubble assistant">
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
);

const StatusBadge = ({ status, children }) => {
  const statusClass = status?.toLowerCase() || 'low';
  return (
    <span className={`status-badge ${statusClass}`}>
      {children || status}
    </span>
  );
};

const LimitsDisplay = ({ limits, isGuest }) => {
  if (!limits) return null;
  
  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="text-sage-500">
        Reports: <strong className="text-sage-700">
          {limits.projectsRemaining === 'unlimited' ? '∞' : `${limits.projectsRemaining}/${limits.maxProjects}`}
        </strong>
      </span>
      {isGuest && (
        <span className="text-amber-600 text-xs">
          Guest mode - Sign in for more
        </span>
      )}
    </div>
  );
};

const DeleteConfirmModal = ({ reportName, onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-sage-900/60 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up">
      <div className="w-12 h-12 bg-coral-100 rounded-full flex items-center justify-center text-coral-600 mb-4">
        <AlertTriangleIcon />
      </div>
      <h3 className="text-xl font-display font-semibold text-sage-800 mb-2">Delete Report?</h3>
      <p className="text-sage-600 mb-6">
        Are you sure you want to permanently delete <strong className="text-sage-800">"{reportName}"</strong>? This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-sage-600 bg-sage-100 hover:bg-sage-200 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-coral-600 hover:bg-coral-700 rounded-xl shadow-lg shadow-coral-200 transition-colors"
        >
          Delete Report
        </button>
      </div>
    </div>
  </div>
);

const ReportLoadingSkeleton = () => (
  <div className="grid lg:grid-cols-5 gap-6 p-4">
    <div className="lg:col-span-3 space-y-6">
      <div className="h-8 w-1/3 bg-sage-200 animate-pulse rounded-lg mb-6"></div>
      
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-sage-200 animate-pulse rounded-xl"></div>
          <div className="space-y-2">
            <div className="h-5 w-32 bg-sage-200 animate-pulse rounded"></div>
            <div className="h-4 w-24 bg-sage-100 animate-pulse rounded"></div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="h-16 bg-sage-100 animate-pulse rounded-lg"></div>
          <div className="h-16 bg-sage-100 animate-pulse rounded-lg"></div>
          <div className="h-16 bg-sage-100 animate-pulse rounded-lg sm:col-span-2"></div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 opacity-60">
        <div className="h-6 w-48 bg-sage-200 animate-pulse rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-24 bg-sage-100 animate-pulse rounded-lg"></div>
          <div className="h-24 bg-sage-100 animate-pulse rounded-lg"></div>
        </div>
      </div>
    </div>

    <div className="lg:col-span-2">
      <div className="glass-card rounded-2xl h-[500px] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-sage-200">
        <div className="w-16 h-16 bg-gradient-to-br from-mint-200 to-sage-200 rounded-full flex items-center justify-center animate-pulse mb-4">
          <div className="w-8 h-8 rounded-full bg-white/50"></div>
        </div>
        <h3 className="text-lg font-medium text-sage-600 mb-2">Fetching your report... ✨</h3>
        <p className="text-sm text-sage-400">Dr. HealthGuide is preparing your personalized insights.</p>
      </div>
    </div>
  </div>
);

// ============================================================================

// MAIN APP
// ============================================================================

const formatErrorMessage = (msg) => {
  if (!msg || typeof msg !== 'string') return msg || 'An unknown error occurred.';
  try {
    const match = msg.match(/({.*})/);
    if (match) {
      const parsed = JSON.parse(match[1]);
      if (parsed.error && parsed.error.message) {
         return msg.substring(0, match.index) + parsed.error.message;
      }
    }
  } catch (e) {
    // ignore parsing errors
  }
  return msg;
};

export default function App() {
  // Clerk hooks
  const { isLoaded: isClerkLoaded, isSignedIn, user: clerkUser } = useUser();
  const { getToken } = useAuth();

  // App state
  const [view, setView] = useState('home'); // 'home', 'upload', 'project', 'projects'
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  
  // User and project state
  const [userStatus, setUserStatus] = useState(null);
  const [guestSessionId, setGuestSessionId] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isProjectLoading, setIsProjectLoading] = useState(false);
  
  // Edit & Delete state
  const [editingReportId, setEditingReportId] = useState(null);
  const [editingData, setEditingData] = useState({ name: '', patientName: '', age: '', reportDate: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Refs
  const chatEndRef = useRef(null);
  
  // Handlers for validation
  const handleNameChange = (val, field) => {
    // Only allow alphanumeric, spaces, dashes, underscores, and dots. Max 50 chars.
    if (val.length <= 50 && /^[a-zA-Z0-9\s._\-]*$/.test(val)) {
      setEditingData(prev => ({ ...prev, [field]: val }));
    }
  };

  const handleAgeChange = (val) => {
    if (val === '') {
      setEditingData(prev => ({ ...prev, age: '' }));
      return;
    }
    const num = parseInt(val, 10);
    // age must be number and less than 150
    if (!isNaN(num) && num >= 0 && num < 150) {
      setEditingData(prev => ({ ...prev, age: num.toString() }));
    }
  };
  const fileInputRef = useRef(null);

  // ============================================================================
  // API HELPERS
  // ============================================================================

  const getHeaders = async () => {
    const headers = { 'Content-Type': 'application/json' };
    
    if (isSignedIn) {
      try {
        const token = await getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Failed to get token:', e);
      }
    } else if (guestSessionId) {
      headers['X-Guest-Session'] = guestSessionId;
    }
    
    return headers;
  };

  const getFormDataHeaders = async () => {
    const headers = {};
    
    if (isSignedIn) {
      try {
        const token = await getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Failed to get token:', e);
      }
    } else if (guestSessionId) {
      headers['X-Guest-Session'] = guestSessionId;
    }
    
    return headers;
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load user status on mount and when auth changes
  useEffect(() => {
    if (!isClerkLoaded) return;
    loadUserStatus();
  }, [isClerkLoaded, isSignedIn]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load guest session from localStorage
  useEffect(() => {
    const savedGuestSession = localStorage.getItem('dochelp_guest_session');
    if (savedGuestSession) {
      setGuestSessionId(savedGuestSession);
    }
  }, []);

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const loadUserStatus = async () => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE}/api/v1/user/status`, { headers });
      const data = await response.json();
      
      setUserStatus(data);
      setProjects(data.projects || []);
      
      // Save guest session if new one was created
      if (data.guestSessionId) {
        setGuestSessionId(data.guestSessionId);
        localStorage.setItem('dochelp_guest_session', data.guestSessionId);
      }
    } catch (err) {
      console.error('Failed to load user status:', err);
    }
  };

  const loadProject = async (projectId, preloadedData = null) => {
    try {
      setIsProjectLoading(true);
      setView('project');
      setCurrentProject(preloadedData || { id: projectId, name: 'Loading Report...' });
      
      const headers = await getHeaders();

      // Parallel fetch
      const [projectRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/user/projects/${projectId}`, { headers }),
        fetch(`${API_BASE}/api/v1/chat/initial/${projectId}`, { headers })
      ]);
      
      if (!projectRes.ok) {
        throw new Error('Failed to load project');
      }
      
      const projectData = await projectRes.json();
      const summaryData = await summaryRes.ok ? await summaryRes.json() : null;
      
      setCurrentProject(projectData.project);
      
      // If there's conversation history, use it
      if (projectData.project.conversationHistory?.length > 0) {
        setMessages(projectData.project.conversationHistory);
      } else if (summaryData) {
        setMessages([{ role: 'assistant', content: summaryData.summary }]);
      } else {
        setMessages([{
          role: 'assistant',
          content: `Hello${projectData.project.persona?.name ? `, ${projectData.project.persona.name}` : ''}! I'm Dr. HealthGuide. I've reviewed your ${projectData.project.persona?.reportType || 'medical report'}. What would you like to know about your results?`
        }]);
      }
    } catch (err) {
      setError(formatErrorMessage(err.message));
      setView('projects');
    } finally {
      setIsProjectLoading(false);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const headers = await getHeaders();
      await fetch(`${API_BASE}/api/v1/user/projects/${projectId}`, {
        method: 'DELETE',
        headers
      });
      
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setDeleteConfirmId(null);
      loadUserStatus();
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  const updateReport = async (projectId, updates) => {
    // Optimistic UI update
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          name: updates.name !== undefined ? updates.name : p.name,
          persona: {
            ...p.persona,
            name: updates.patientName !== undefined ? updates.patientName : p.persona?.name,
            age: updates.age !== undefined ? updates.age : p.persona?.age,
            reportDate: updates.reportDate !== undefined ? updates.reportDate : p.persona?.reportDate
          }
        };
      }
      return p;
    }));
    
    if (currentProject?.id === projectId) {
      setCurrentProject(prev => ({
        ...prev,
        name: updates.name !== undefined ? updates.name : prev.name,
        persona: {
          ...prev.persona,
          name: updates.patientName !== undefined ? updates.patientName : prev.persona?.name,
          age: updates.age !== undefined ? updates.age : prev.persona?.age,
          reportDate: updates.reportDate !== undefined ? updates.reportDate : prev.persona?.reportDate
        }
      }));
    }

    setEditingReportId(null);

    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE}/api/v1/user/projects/${projectId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update report');
    } catch (err) {
      console.error('Failed to update report:', err);
      setError(formatErrorMessage(err.message));
      // In a more robust implementation, we would revert the optimistic update here
    }
  };

  // ============================================================================
  // FILE HANDLERS
  // ============================================================================

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
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
    }
  }, []);

  // ============================================================================
  // UPLOAD & ANALYZE
  // ============================================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('report', file);

    try {
      const headers = await getFormDataHeaders();
      const response = await fetch(`${API_BASE}/api/v1/analyze`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Analysis failed');
      }

      // Save guest session if provided
      if (data.guestSessionId) {
        setGuestSessionId(data.guestSessionId);
        localStorage.setItem('dochelp_guest_session', data.guestSessionId);
      }

      // Set current project
      const newProject = {
        id: data.projectId,
        name: `${data.persona?.reportType || 'Medical Report'} - ${new Date().toLocaleDateString()}`,
        reportAnalysis: data.analysis,
        persona: data.persona,
        conversationHistory: [],
        chatCount: 0
      };
      setCurrentProject(newProject);
      
      // Get AI-generated initial summary
      setMessages([{ role: 'assistant', content: 'Analyzing your report...' }]);
      
      try {
        const headers = await getHeaders();
        const summaryResponse = await fetch(`${API_BASE}/api/v1/chat/initial/${data.projectId}`, { headers });
        const summaryData = await summaryResponse.json();
        
        if (summaryResponse.ok) {
          setMessages([{ role: 'assistant', content: summaryData.summary }]);
        } else {
          // Fallback
          setMessages([{
            role: 'assistant',
            content: `Hello${data.persona?.name ? `, ${data.persona.name}` : ''}! I'm Dr. HealthGuide, and I've reviewed your ${data.persona?.reportType || 'medical report'}. I'm here to help you understand your results and answer any questions. What would you like to know?`
          }]);
        }
      } catch (summaryErr) {
        console.error('Failed to load initial summary:', summaryErr);
        // Fallback
        setMessages([{
          role: 'assistant',
          content: `Hello${data.persona?.name ? `, ${data.persona.name}` : ''}! I'm Dr. HealthGuide, and I've reviewed your ${data.persona?.reportType || 'medical report'}. I'm here to help you understand your results and answer any questions. What would you like to know?`
        }]);
      }
      
      setFile(null);
      setView('project');
      loadUserStatus();

    } catch (err) {
      setError(formatErrorMessage(err.message));
    } finally {
      setIsUploading(false);
    }
  };

  // ============================================================================
  // CHAT
  // ============================================================================

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentProject?.id || isSending) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsSending(true);

    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE}/api/v1/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ projectId: currentProject.id, message: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      
      // Update chat count
      setCurrentProject(prev => ({ ...prev, chatCount: data.chatCount }));
      
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: err.message.includes('limit') 
          ? `${err.message}`
          : `I apologize, but I encountered an error: ${err.message}. Please try again.` 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const clearChat = async () => {
    if (!currentProject?.id) return;
    
    try {
      const headers = await getHeaders();
      await fetch(`${API_BASE}/api/v1/chat/${currentProject.id}`, { 
        method: 'DELETE',
        headers 
      });
      setMessages([{
        role: 'assistant',
        content: "I've cleared our conversation history. Feel free to ask me anything about your report!"
      }]);
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const isGuest = !isSignedIn;
  const limits = userStatus?.limits;

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-sage-200/50 bg-white/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => { setView('home'); setCurrentProject(null); }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-mint-400 to-sage-500 rounded-xl flex items-center justify-center text-white shadow-md">
                <HeartPulseIcon />
              </div>
              <div>
                <h1 className="font-display text-xl font-semibold text-sage-800">DocHelp</h1>
                <p className="text-xs text-sage-500">AI Medical Report Analyzer</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {limits && <LimitsDisplay limits={limits} isGuest={isGuest} />}
              
              {isClerkLoaded && (
                <>
                  <SignedIn>
                    <button
                      onClick={() => setView('projects')}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-sage-600 hover:text-sage-800 hover:bg-sage-100 rounded-lg transition-colors"
                    >
                      <FolderIcon />
                      My Reports
                    </button>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                  
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="px-4 py-2 text-sm text-sage-600 hover:text-sage-800 hover:bg-sage-100 rounded-lg transition-colors">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="px-4 py-2 text-sm bg-sage-700 text-white rounded-lg hover:bg-sage-800 transition-colors">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </SignedOut>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HOME VIEW */}
        {view === 'home' && (
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
              {/* Show existing reports for signed-in users */}
              {isSignedIn && projects.length > 0 && (
                <div className="mb-6 pb-6 border-b border-sage-200">
                  <h3 className="font-medium text-sage-700 mb-3">Your Recent Reports</h3>
                  <div className="space-y-2">
                    {projects.slice(0, 3).map(project => (
                      <button
                        key={project.id}
                        onClick={() => loadProject(project.id)}
                        className="w-full flex items-center justify-between p-3 bg-sage-50 hover:bg-sage-100 rounded-lg transition-colors text-left"
                      >
                        <div>
                          <p className="font-medium text-sage-700">{project.name}</p>
                          <p className="text-xs text-sage-500">{project.chatCount} messages</p>
                        </div>
                        <ArrowLeftIcon className="rotate-180" />
                      </button>
                    ))}
                  </div>
                  {projects.length > 3 && (
                    <button
                      onClick={() => setView('projects')}
                      className="mt-3 text-sm text-sage-600 hover:text-sage-800"
                    >
                      View all {projects.length} reports →
                    </button>
                  )}
                </div>
              )}

              {/* Upload Section */}
              <div className="text-center mb-4">
                <h3 className="font-medium text-sage-700">
                  {projects.length > 0 ? 'Analyze a New Report' : 'Get Started'}
                </h3>
              </div>

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
                    <div>
                      <p className="text-coral-700 text-sm">{error}</p>
                      {error.includes('Guest') && (
                        <SignInButton mode="modal">
                          <button className="mt-2 text-sm text-coral-800 underline hover:no-underline">
                            Sign in for more reports →
                          </button>
                        </SignInButton>
                      )}
                    </div>
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
                      {isGuest ? 'Analyze as Guest' : 'Analyze Report'}
                    </>
                  )}
                </button>
              </form>

              {isGuest && (
                <p className="mt-4 text-center text-sm text-sage-500">
                  Guest users: 1 report, 2 chat messages. 
                  <SignInButton mode="modal">
                    <button className="text-sage-700 underline hover:no-underline ml-1">
                      Sign in
                    </button>
                  </SignInButton>
                  {' '}for 5 reports & unlimited chat.
                </p>
              )}
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
        )}

        {/* PROJECTS VIEW */}
        {view === 'projects' && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView('home')}
                  className="p-2 hover:bg-sage-100 rounded-lg transition-colors"
                >
                  <ArrowLeftIcon />
                </button>
                <h2 className="font-display text-2xl font-semibold text-sage-800">
                  My Reports
                </h2>
              </div>
              
              {limits && limits.projectsRemaining !== 0 && (
                <button
                  onClick={() => setView('home')}
                  className="btn-primary flex items-center gap-2"
                >
                  <PlusIcon />
                  New Analysis
                </button>
              )}
            </div>

            {projects.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <FolderIcon className="w-16 h-16 text-sage-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-sage-700 mb-2">No reports yet</h3>
                <p className="text-sage-500 mb-6">Upload your first medical report to get started</p>
                <button
                  onClick={() => setView('home')}
                  className="btn-primary"
                >
                  Analyze a Report
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {projects.map(project => (
                  <div
                    key={project.id}
                    className="glass-card rounded-2xl p-5 hover:shadow-[0_4px_25px_-5px_rgba(20,184,166,0.15)] transition-all border-l-4 border-l-mint-400 shadow-sm shadow-mint-400/10 group relative"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 mb-1 w-full">
                          {editingReportId === project.id ? (
                            <div className="flex flex-col gap-3 w-full">
                              <div className="flex items-center gap-2">
                                <input
                                  autoFocus
                                  className="px-3 py-1 bg-white border border-sage-300 rounded-lg text-sage-800 font-display text-lg font-semibold w-full max-w-md focus:ring-2 focus:ring-mint-400 focus:outline-none"
                                  value={editingData.name}
                                  placeholder="Report Name (max 50 chars)"
                                  onChange={(e) => handleNameChange(e.target.value, 'name')}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') updateReport(project.id, editingData);
                                    if (e.key === 'Escape') setEditingReportId(null);
                                  }}
                                />
                                <button onClick={() => updateReport(project.id, editingData)} className="p-1 px-3 text-sm font-medium text-white bg-mint-500 hover:bg-mint-600 rounded shadow-sm transition-colors">Save</button>
                                <button onClick={() => setEditingReportId(null)} className="p-1 px-3 text-sm font-medium text-sage-600 bg-sage-100 hover:bg-sage-200 rounded transition-colors">Cancel</button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="flex flex-col">
                                  <label className="text-[10px] uppercase tracking-wider text-sage-400 font-bold mb-1">Patient</label>
                                  <input 
                                    className="px-2 py-1 bg-white border border-sage-300 rounded text-sm text-sage-700 outline-none focus:border-mint-400 focus:ring-1 focus:ring-mint-400"
                                    value={editingData.patientName}
                                    placeholder="Patient Name"
                                    onChange={(e) => handleNameChange(e.target.value, 'patientName')}
                                    onKeyDown={(e) => e.key === 'Enter' && updateReport(project.id, editingData)}
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <label className="text-[10px] uppercase tracking-wider text-sage-400 font-bold mb-1">Age</label>
                                  <input 
                                    type="number"
                                    className="px-2 py-1 bg-white border border-sage-300 rounded text-sm text-sage-700 outline-none focus:border-mint-400 focus:ring-1 focus:ring-mint-400"
                                    value={editingData.age}
                                    placeholder="Age (<150)"
                                    onChange={(e) => handleAgeChange(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && updateReport(project.id, editingData)}
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <label className="text-[10px] uppercase tracking-wider text-sage-400 font-bold mb-1">Report Date</label>
                                  <DatePicker
                                    className="px-2 py-1 bg-white border border-sage-300 rounded text-sm text-sage-700 outline-none focus:border-mint-400 focus:ring-1 focus:ring-mint-400 w-full"
                                    selected={editingData.reportDate && !isNaN(new Date(editingData.reportDate)) ? new Date(editingData.reportDate) : null}
                                    onChange={(date) => setEditingData(prev => ({ ...prev, reportDate: date ? date.toLocaleDateString() : '' }))}
                                    dateFormat="MM/dd/yyyy"
                                    placeholderText="Select date"
                                    isClearable
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 
                                className="text-lg font-display font-semibold text-sage-800 cursor-pointer hover:text-sage-600 transition-colors"
                                onClick={() => loadProject(project.id)}
                              >
                                {project.name}
                              </h3>
                              <button 
                                onClick={() => { 
                                  setEditingReportId(project.id); 
                                  setEditingData({
                                    name: project.name,
                                    patientName: project.persona?.name || '',
                                    age: project.persona?.age || '',
                                    reportDate: project.persona?.reportDate || ''
                                  }); 
                                }}
                                className="p-1 text-sage-300 hover:text-sage-600 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <EditIcon />
                              </button>
                            </>
                          )}
                        </div>
                        
                        {!editingReportId && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4 mt-3">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-sage-400 font-bold">Patient</span>
                              <span className="text-sm font-medium text-sage-700 truncate">
                                {project.persona?.name || 'Unknown'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-sage-400 font-bold">Age</span>
                              <span className="text-sm font-medium text-sage-700">
                                {project.persona?.age ? `${project.persona.age}${project.persona.age.toString().includes('yr') ? '' : ' yrs'}` : '—'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-sage-400 font-bold">Report Date</span>
                              <span className="text-sm font-medium text-sage-700">
                                {project.persona?.reportDate || '—'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-sage-400 font-bold">Uploaded</span>
                              <span className="text-sm font-medium text-sage-700">
                                {new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => loadProject(project.id)}
                          className="px-4 py-2 bg-sage-50 text-sage-700 font-medium rounded-xl hover:bg-sage-100 transition-colors flex items-center gap-2 border border-sage-100"
                        >
                          <FileIcon />
                          Details
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(project.id)}
                          className="p-2 text-sage-300 hover:text-coral-600 hover:bg-coral-50 rounded-xl transition-all"
                          title="Delete report"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {limits && (
              <p className="mt-6 text-center text-sm text-sage-500">
                {limits.projectsRemaining === 'unlimited' 
                  ? 'Unlimited reports available'
                  : `${limits.projectsRemaining} of ${limits.maxProjects} reports remaining`}
              </p>
            )}
            
            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
              <DeleteConfirmModal 
                reportName={projects.find(p => p.id === deleteConfirmId)?.name || 'this report'}
                onCancel={() => setDeleteConfirmId(null)}
                onConfirm={() => deleteProject(deleteConfirmId)}
              />
            )}
          </div>
        )}

        {/* PROJECT VIEW */}
        {view === 'project' && currentProject && (
          isProjectLoading && !currentProject.reportAnalysis ? (
            <div className="animate-fade-in">
              <ReportLoadingSkeleton />
            </div>
          ) : (
          <div className="grid lg:grid-cols-5 gap-6 animate-fade-in">
            {/* Analysis Results - Left Panel */}
            <div className="lg:col-span-3 space-y-6">
              {/* Back Button & Title */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setView('home'); setCurrentProject(null); }}
                  className="p-2 hover:bg-sage-100 rounded-lg transition-colors"
                >
                  <ArrowLeftIcon />
                </button>
                <div className="flex items-center gap-2 group w-full max-w-xl">
                  {editingReportId === currentProject.id ? (
                    <div className="flex flex-col gap-3 w-full animate-fade-in">
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          className="px-3 py-1 bg-white border border-sage-300 rounded-lg text-sage-800 font-display text-xl font-semibold focus:ring-2 focus:ring-mint-400 focus:border-transparent outline-none w-full"
                          value={editingData.name}
                          placeholder="Report Name (max 50 chars)"
                          onChange={(e) => handleNameChange(e.target.value, 'name')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') updateReport(currentProject.id, editingData);
                            if (e.key === 'Escape') setEditingReportId(null);
                          }}
                        />
                        <button onClick={() => updateReport(currentProject.id, editingData)} className="p-1 px-3 text-sm font-medium text-white bg-mint-500 hover:bg-mint-600 rounded shadow-sm transition-colors">Save</button>
                        <button onClick={() => setEditingReportId(null)} className="p-1 px-3 text-sm font-medium text-sage-600 bg-sage-100 hover:bg-sage-200 rounded transition-colors">Cancel</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex flex-col">
                          <label className="text-[10px] mx-1 uppercase tracking-wider text-sage-400 font-bold mb-1">Patient</label>
                          <input 
                            className="px-3 py-1.5 bg-white border border-sage-300 rounded-lg text-sm text-sage-700 outline-none focus:border-mint-400 focus:ring-1 focus:ring-mint-400"
                            value={editingData.patientName}
                            placeholder="Patient Name"
                            onChange={(e) => handleNameChange(e.target.value, 'patientName')}
                            onKeyDown={(e) => e.key === 'Enter' && updateReport(currentProject.id, editingData)}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[10px] mx-1 uppercase tracking-wider text-sage-400 font-bold mb-1">Age</label>
                          <input 
                            type="number"
                            className="px-3 py-1.5 bg-white border border-sage-300 rounded-lg text-sm text-sage-700 outline-none focus:border-mint-400 focus:ring-1 focus:ring-mint-400"
                            value={editingData.age}
                            placeholder="Age (<150)"
                            onChange={(e) => handleAgeChange(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && updateReport(currentProject.id, editingData)}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[10px] mx-1 uppercase tracking-wider text-sage-400 font-bold mb-1">Report Date</label>
                          <DatePicker
                            className="px-3 py-1.5 bg-white border border-sage-300 rounded-lg text-sm text-sage-700 outline-none focus:border-mint-400 focus:ring-1 focus:ring-mint-400 w-full"
                            selected={editingData.reportDate && !isNaN(new Date(editingData.reportDate)) ? new Date(editingData.reportDate) : null}
                            onChange={(date) => setEditingData(prev => ({ ...prev, reportDate: date ? date.toLocaleDateString() : '' }))}
                            dateFormat="MM/dd/yyyy"
                            placeholderText="Select date"
                            isClearable
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="font-display text-xl font-semibold text-sage-800">
                        {currentProject.name}
                      </h2>
                      <button 
                        onClick={() => { 
                          setEditingReportId(currentProject.id); 
                          setEditingData({
                            name: currentProject.name,
                            patientName: currentProject.persona?.name || '',
                            age: currentProject.persona?.age || '',
                            reportDate: currentProject.persona?.reportDate || ''
                          }); 
                        }}
                        className="p-1 text-sage-300 hover:text-sage-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Rename report"
                      >
                        <EditIcon />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Patient Summary */}
              {currentProject.reportAnalysis?.patient_summary && (
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
                        {currentProject.reportAnalysis.patient_summary.report_type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {currentProject.reportAnalysis.patient_summary.name && (
                      <div className="p-3 bg-sage-50 rounded-lg">
                        <p className="text-xs text-sage-500 mb-1">Patient</p>
                        <p className="font-medium text-sage-700">{currentProject.reportAnalysis.patient_summary.name}</p>
                      </div>
                    )}
                    {currentProject.reportAnalysis.patient_summary.age && (
                      <div className="p-3 bg-sage-50 rounded-lg">
                        <p className="text-xs text-sage-500 mb-1">Age</p>
                        <p className="font-medium text-sage-700">{currentProject.reportAnalysis.patient_summary.age} years</p>
                      </div>
                    )}
                    <div className="p-3 bg-sage-50 rounded-lg sm:col-span-2">
                      <p className="text-xs text-sage-500 mb-1">Overall Status</p>
                      <p className="font-medium text-sage-700">{currentProject.reportAnalysis.patient_summary.overall_health_status}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Abnormal Findings */}
              {currentProject.reportAnalysis?.abnormal_findings?.length > 0 && (
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
                    {currentProject.reportAnalysis.abnormal_findings.map((finding, i) => (
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
              {currentProject.reportAnalysis?.health_concerns?.length > 0 && (
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
                    {currentProject.reportAnalysis.health_concerns.map((concern, i) => (
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
              {currentProject.reportAnalysis?.normal_findings?.length > 0 && (
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
                    {currentProject.reportAnalysis.normal_findings.slice(0, 8).map((finding, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-mint-50 rounded-lg border border-mint-100">
                        <span className="text-sm text-mint-800">{finding.parameter}</span>
                        <span className="text-sm font-medium text-mint-700">{finding.value} {finding.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {currentProject.reportAnalysis?.recommendations?.length > 0 && (
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
                    {currentProject.reportAnalysis.recommendations.map((rec, i) => (
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
              {currentProject.reportAnalysis?.follow_up_care && (
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
                    {currentProject.reportAnalysis.follow_up_care.suggested_tests?.length > 0 && (
                      <div className="p-3 bg-sage-50 rounded-lg">
                        <p className="text-xs text-sage-500 mb-2">Suggested Tests</p>
                        <div className="flex flex-wrap gap-2">
                          {currentProject.reportAnalysis.follow_up_care.suggested_tests.map((test, i) => (
                            <span key={i} className="px-3 py-1 bg-white text-sm text-sage-700 rounded-full border border-sage-200">
                              {test}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {currentProject.reportAnalysis.follow_up_care.specialist_referrals?.length > 0 && (
                      <div className="p-3 bg-sage-50 rounded-lg">
                        <p className="text-xs text-sage-500 mb-2">Specialist Referrals</p>
                        <div className="flex flex-wrap gap-2">
                          {currentProject.reportAnalysis.follow_up_care.specialist_referrals.map((spec, i) => (
                            <span key={i} className="px-3 py-1 bg-white text-sm text-sage-700 rounded-full border border-sage-200">
                              {spec}
                            </span>
                          ))}
                        </div>
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
                        <p className="text-xs text-sage-200">
                          {isGuest 
                            ? `${2 - (currentProject.chatCount || 0)} messages left`
                            : 'AI Medical Advisor'}
                        </p>
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
                      placeholder={isGuest && currentProject.chatCount >= 2 
                        ? "Sign in for more messages..." 
                        : "Ask about your report..."}
                      className="flex-1 px-4 py-3 bg-sage-50 border border-sage-200 rounded-xl text-sage-800 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent disabled:bg-sage-100"
                      disabled={isSending || (isGuest && currentProject.chatCount >= 2)}
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isSending || (isGuest && currentProject.chatCount >= 2)}
                      className="px-4 py-3 bg-sage-700 text-white rounded-xl hover:bg-sage-800 disabled:bg-sage-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <SendIcon />
                    </button>
                  </div>
                  
                  {/* Quick Questions */}
                  {(!isGuest || currentProject.chatCount < 2) && (
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
                  )}

                  {/* Guest limit warning */}
                  {isGuest && currentProject.chatCount >= 2 && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                      <p className="text-xs text-amber-700">
                        You've reached the guest chat limit.{' '}
                        <SignInButton mode="modal">
                          <button className="underline hover:no-underline font-medium">
                            Sign in
                          </button>
                        </SignInButton>
                        {' '}for unlimited messages.
                      </p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
          )
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

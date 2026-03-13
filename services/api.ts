/**
 * Vijnana Lab — MongoDB API Client
 * 
 * This service handles all communication between the React frontend
 * and the Express + MongoDB backend server.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Generic Fetch Wrapper ───────────────────────────────────
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data;
};

// ─── User API ────────────────────────────────────────────────
export const userAPI = {
  /** Sync Firebase user to MongoDB (call after login/signup) */
  syncUser: (userData: {
    firebaseUID: string;
    name: string;
    email: string;
    role?: string;
    grade?: string;
    institution?: string;
  }) => apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  /** Get user profile from MongoDB */
  getProfile: (firebaseUID: string) => 
    apiFetch(`/users/${firebaseUID}`),

  /** Update user profile */
  updateProfile: (firebaseUID: string, updates: Record<string, any>) => 
    apiFetch(`/users/${firebaseUID}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  /** Get dashboard statistics */
  getStats: (firebaseUID: string) => 
    apiFetch(`/users/${firebaseUID}/stats`),
};

// ─── Lab Progress API ────────────────────────────────────────
export const labAPI = {
  /** Save or update lab progress */
  saveProgress: (progressData: {
    firebaseUID: string;
    subjectId: string;
    labId: string;
    status: 'not_started' | 'in_progress' | 'completed';
    score?: number;
    timeSpent?: number;
    quizAnswers?: number[];
    observations?: string;
  }) => apiFetch('/labs/progress', {
    method: 'POST',
    body: JSON.stringify(progressData),
  }),

  /** Get all lab progress for current user */
  getAllProgress: (firebaseUID: string) => 
    apiFetch(`/labs/progress/${firebaseUID}`),

  /** Get progress for a specific subject */
  getSubjectProgress: (firebaseUID: string, subjectId: string) => 
    apiFetch(`/labs/progress/${firebaseUID}/${subjectId}`),

  /** Get leaderboard */
  getLeaderboard: () => 
    apiFetch('/labs/leaderboard'),
};

// ─── Brainstorm API ──────────────────────────────────────────
export const brainstormAPI = {
  /** Save a generated blueprint project */
  saveProject: (projectData: {
    firebaseUID: string;
    title: string;
    subject: string;
    topic: string;
    level: string;
    goal: string;
    hypothesis: string;
    blueprint: {
      aim: string;
      apparatus: string[];
      procedure: string[];
      safety: string;
    };
  }) => apiFetch('/brainstorm', {
    method: 'POST',
    body: JSON.stringify(projectData),
  }),

  /** Get all brainstorm projects for a user */
  getProjects: (firebaseUID: string) => 
    apiFetch(`/brainstorm/${firebaseUID}`),

  /** Update a project */
  updateProject: (projectId: string, updates: Record<string, any>) => 
    apiFetch(`/brainstorm/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  /** Delete a project */
  deleteProject: (projectId: string) => 
    apiFetch(`/brainstorm/${projectId}`, {
      method: 'DELETE',
    }),
};

// ─── Feedback API ────────────────────────────────────────────
export const feedbackAPI = {
  /** Submit feedback */
  submit: (feedbackData: {
    firebaseUID?: string;
    name: string;
    email: string;
    message: string;
    type?: 'feedback' | 'bug' | 'suggestion' | 'contact';
  }) => apiFetch('/feedback', {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  }),

  /** Get all feedback (admin) */
  getAll: () => apiFetch('/feedback'),
};

// ─── Health Check ────────────────────────────────────────────
export const checkServerHealth = () => apiFetch('/health');

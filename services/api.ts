const API_BASE_URL = 'http://localhost:7070/api';

async function request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Server error');
    }
    
    if (response.status === 204) { // No Content
        return;
    }

    return response.json();
}

// Projects
export const getProjects = () => request('/projects');
export const createProject = (data: any) => request('/projects', { method: 'POST', body: JSON.stringify(data) });
export const updateProject = (id: string, data: any) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProject = (id: string) => request(`/projects/${id}`, { method: 'DELETE' });

// Members
export const getMembers = () => request('/members');
export const createMember = (data: any) => request('/members', { method: 'POST', body: JSON.stringify(data) });
export const updateMember = (id: string, data: any) => request(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMember = (id: string) => request(`/members/${id}`, { method: 'DELETE' });

// Assignments
export const getAssignments = () => request('/assignments');
export const createAssignment = (data: any) => request('/assignments', { method: 'POST', body: JSON.stringify(data) });
export const updateAssignment = (id: string, data: any) => request(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAssignment = (id: string) => request(`/assignments/${id}`, { method: 'DELETE' });

// Position Levels
export const getPositionLevels = () => request('/position-levels');

// Auth
export const login = (id: string, password: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ id, password }) });
export const forgotPassword = (id: string) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ id }) });
export const resetPassword = (token: string, password: string) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });

// js/api.js

// 🚀 FINAL PRODUCTION URL 🚀
// Uses your provided PythonAnywhere domain with the /api/ prefix
const API_BASE_URL = 'https://thesarcasticone69.pythonanywhere.com/api'; 

// --- Helper Functions ---

// Gets the Authorization header for secure requests
const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    let headers = { 'Content-Type': 'application/json' };
    if (token) {
        // Includes the Bearer token for JWT Authentication
        headers['Authorization'] = `Bearer ${token}`; 
    }
    return headers;
};

// Base wrapper for all Fetch calls
const fetchData = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Merge default and custom headers
    options.headers = { ...getAuthHeaders(), ...options.headers };

    const response = await fetch(url, options);
    
    // Handle error responses
    if (!response.ok) {
        let errorData = { message: response.statusText };
        try {
            errorData = await response.json();
        } catch (e) {
            // response body wasn't JSON
        }
        // Throw a structured error
        throw new Error(`API Error ${response.status}: ${JSON.stringify(errorData)}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }
    
    return response.json();
};

// --- Authentication Functions ---

export const loginUser = async (username, password) => {
    const options = {
        method: 'POST',
        body: JSON.stringify({ username, password }) 
    };
    // Endpoint: /api/token/
    const data = await fetchData('/token/', options);
    
    // Store tokens locally upon successful login
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);

    return data;
};

export const logoutUser = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

// --- Event Functions ---

export const fetchEvents = async () => {
    // Endpoint: /api/events/
    // Uses optional Auth header, works for public and authenticated users
    return fetchData('/events/');
};

export const createEvent = async (eventData) => {
    const options = {
        method: 'POST',
        body: JSON.stringify(eventData) 
    };
    // Endpoint: /api/events/
    // Requires Auth header (user must be logged in)
    return fetchData('/events/', options);
};
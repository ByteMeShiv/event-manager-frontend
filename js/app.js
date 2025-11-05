import { loginUser, logoutUser, fetchEvents, createEvent } from './api.js';

// DOM Elements
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const eventListContainer = document.getElementById('event-list');
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const createEventForm = document.getElementById('create-event-form');
const loginMessage = document.getElementById('login-message');


// --- State Check & UI Update ---

const checkAuthState = () => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
        // User is logged in
        loginContainer.classList.add('d-none');
        appContainer.classList.remove('d-none');
        logoutBtn.classList.remove('d-none');
        loginMessage.innerHTML = ''; // Clear login messages
        loadEvents();
    } else {
        // User is logged out
        loginContainer.classList.remove('d-none');
        appContainer.classList.add('d-none');
        logoutBtn.classList.add('d-none');
        eventListContainer.innerHTML = '<div class="alert alert-info">Please log in to see events and access features.</div>';
    }
};

// --- Data Loading & Rendering ---

const renderEvent = (event) => {
    // Renders one event card using Bootstrap's Card component
    const startTime = new Date(event.start_time).toLocaleString();
    const description = event.description ? event.description.substring(0, 100) + '...' : 'No description provided.';
    
    return `
        <div class="card shadow-sm mb-3">
            <div class="card-body">
                <h5 class="card-title">${event.title}</h5>
                <h6 class="card-subtitle mb-2 text-muted">Organized by: ${event.organizer}</h6>
                <p class="card-text">${description}</p>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item"><strong>When:</strong> ${startTime}</li>
                    <li class="list-group-item"><strong>Location:</strong> ${event.location || 'Not specified'}</li>
                    <li class="list-group-item"><strong>Attendees:</strong> ${event.rsvps_count}</li>
                </ul>
            </div>
        </div>
    `;
};

const loadEvents = async () => {
    eventListContainer.innerHTML = '<div class="alert alert-info">Loading events...</div>';
    try {
        const data = await fetchEvents();
        
        if (data.results && data.results.length > 0) {
            let html = data.results.map(renderEvent).join('');
            eventListContainer.innerHTML = html;
        } else {
            eventListContainer.innerHTML = '<div class="alert alert-secondary">No events found.</div>';
        }

    } catch (error) {
        console.error('Failed to load events:', error);
        eventListContainer.innerHTML = '<div class="alert alert-danger">Error loading events. Check console for details (CORS/Network error likely).</div>';
    }
};

// --- Event Handlers ---

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    // Use Bootstrap alerts for messages
    loginMessage.innerHTML = '<div class="alert alert-info">Logging in...</div>';

    try {
        await loginUser(username, password);
        // Success
        checkAuthState();
    } catch (error) {
        // Failure
        console.error('Login Failed:', error);
        loginMessage.innerHTML = '<div class="alert alert-danger">Login failed. Invalid credentials or API error.</div>';
    }
});

logoutBtn.addEventListener('click', () => {
    logoutUser();
    checkAuthState();
});

createEventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Serialize form data into an object matching the Django EventSerializer
    const eventData = {
        title: e.target.title.value,
        description: e.target.description.value,
        location: e.target.location.value,
        start_time: e.target.start_time.value,
        end_time: e.target.end_time.value || null, // Handle empty end time
        is_public: e.target.is_public.checked,
    };
    
    try {
        const newEvent = await createEvent(eventData);
        alert(`Event "${newEvent.title}" created successfully!`);
        e.target.reset(); // Clear form
        loadEvents(); // Reload list to show the new event
    } catch (error) {
        console.error('Event Creation Failed:', error);
        alert('Failed to create event. Check console. Are you logged in?');
    }
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', checkAuthState);
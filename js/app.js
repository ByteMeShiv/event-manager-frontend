// js/app.js
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
        loginContainer.style.display = 'none';
        appContainer.style.display = 'block';
        logoutBtn.style.display = 'inline';
        loginMessage.textContent = ''; 
        loadEvents();
    } else {
        loginContainer.style.display = 'block';
        appContainer.style.display = 'none';
        logoutBtn.style.display = 'none';
        eventListContainer.innerHTML = '<p>Please log in to see events and access features.</p>';
    }
};

// --- Data Loading & Rendering ---

const renderEvent = (event) => {
    // Renders one event card using data fields from the serializer
    return `
        <div class="event-card">
            <h3>${event.title}</h3>
            <p><strong>Organizer:</strong> ${event.organizer}</p>
            <p><strong>When:</strong> ${new Date(event.start_time).toLocaleString()}</p>
            <p><strong>Attendees:</strong> ${event.rsvps_count}</p>
            <p>${event.description.substring(0, 100)}...</p>
        </div>
    `;
};

const loadEvents = async () => {
    eventListContainer.innerHTML = '<p>Loading events...</p>';
    try {
        const data = await fetchEvents();
        
        if (data.results && data.results.length > 0) {
            let html = data.results.map(renderEvent).join('');
            eventListContainer.innerHTML = html;
        } else {
            eventListContainer.innerHTML = '<p>No events found.</p>';
        }

    } catch (error) {
        console.error('Failed to load events:', error);
        eventListContainer.innerHTML = '<p style="color: red;">Error loading events. Check console for details (CORS/Network error likely).</p>';
    }
};

// --- Event Handlers ---

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    loginMessage.textContent = 'Logging in...';

    try {
        await loginUser(username, password);
        // Success
        checkAuthState();
    } catch (error) {
        // Failure
        console.error('Login Failed:', error);
        loginMessage.textContent = 'Login failed. Invalid credentials or API error.';
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
        end_time: e.target.end_time.value,
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
// Default time zones to display
const defaultTimeZones = [
    { name: 'Local Time', timezone: 'local', emoji: '📍' },
    { name: 'New York', timezone: 'America/New_York', emoji: '🗽' },
    { name: 'Los Angeles', timezone: 'America/Los_Angeles', emoji: '🌅' },
    { name: 'London', timezone: 'Europe/London', emoji: '🇬🇧' },
    { name: 'Paris', timezone: 'Europe/Paris', emoji: '🗼' },
    { name: 'Dubai', timezone: 'Asia/Dubai', emoji: '🕌' },
    { name: 'Tokyo', timezone: 'Asia/Tokyo', emoji: '🗾' },
    { name: 'Sydney', timezone: 'Australia/Sydney', emoji: '🦘' },
    { name: 'Singapore', timezone: 'Asia/Singapore', emoji: '🏙️' },
    { name: 'Mumbai', timezone: 'Asia/Kolkata', emoji: '🇮🇳' },
    { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', emoji: '🏮' }
];

let currentTimeZones = [...defaultTimeZones];
let is24HourFormat = true;
const STORAGE_KEY = 'customTimeZones';
const FORMAT_KEY = 'timeFormat';

// Load saved settings
function loadSettings() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedFormat = localStorage.getItem(FORMAT_KEY);
    
    if (saved) {
        try {
            currentTimeZones = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading time zones:', e);
        }
    }
    
    if (savedFormat !== null) {
        is24HourFormat = JSON.parse(savedFormat);
    }
}

// Save settings
function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentTimeZones));
    localStorage.setItem(FORMAT_KEY, JSON.stringify(is24HourFormat));
}

// Format time based on timezone
function getTimeInZone(timezone) {
    let date;
    
    if (timezone === 'local') {
        date = new Date();
    } else {
        date = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
    }
    
    return date;
}

// Format time display
function formatTime(date, use24Hour) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    if (use24Hour) {
        return `${hours}:${minutes}:${seconds}`;
    } else {
        let displayHours = date.getHours() % 12;
        if (displayHours === 0) displayHours = 12;
        const period = date.getHours() >= 12 ? 'PM' : 'AM';
        return {
            time: `${String(displayHours).padStart(2, '0')}:${minutes}:${seconds}`,
            period: period
        };
    }
}

// Format date display
function formatDate(date) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Determine if it's day or night
function getDayNightStatus(date) {
    const hours = date.getHours();
    return hours >= 6 && hours < 18 ? 'day' : 'night';
}

// Create clock card HTML
function createClockCard(tz, index) {
    const date = getTimeInZone(tz.timezone);
    const timeInfo = formatTime(date, is24HourFormat);
    const time = typeof timeInfo === 'string' ? timeInfo : timeInfo.time;
    const period = typeof timeInfo === 'string' ? '' : timeInfo.period;
    const dateStr = formatDate(date);
    const dayNight = getDayNightStatus(date);
    
    const card = document.createElement('div');
    card.className = 'clock-card';
    card.id = `clock-${index}`;
    
    let removeButton = '';
    if (index !== 0) { // Don't allow removing local time
        removeButton = `<button class="remove-btn" onclick="removeTimezone(${index})" title="Remove timezone">×</button>`;
    }
    
    card.innerHTML = `
        <div class="clock-header">
            <div class="clock-location">
                <div class="clock-emoji">${tz.emoji}</div>
                <div class="clock-info">
                    <div class="clock-city">${tz.name}</div>
                    <div class="clock-timezone">${tz.timezone === 'local' ? 'Your Timezone' : tz.timezone}</div>
                </div>
            </div>
            ${removeButton}
        </div>
        <div class="clock-display">
            <div class="clock-time">${time}</div>
            <div class="clock-period">${period}</div>
            <div class="clock-date">${dateStr}</div>
            <div class="day-night-indicator ${dayNight}">${dayNight === 'day' ? '☀️ Day' : '🌙 Night'}</div>
        </div>
    `;
    
    return card;
}

// Render all clocks
function renderClocks() {
    const grid = document.getElementById('clocksGrid');
    grid.innerHTML = '';
    
    currentTimeZones.forEach((tz, index) => {
        const card = createClockCard(tz, index);
        grid.appendChild(card);
    });
}

// Update all clock displays
function updateClocks() {
    currentTimeZones.forEach((tz, index) => {
        const card = document.getElementById(`clock-${index}`);
        if (card) {
            const date = getTimeInZone(tz.timezone);
            const timeInfo = formatTime(date, is24HourFormat);
            const time = typeof timeInfo === 'string' ? timeInfo : timeInfo.time;
            const period = typeof timeInfo === 'string' ? '' : timeInfo.period;
            const dateStr = formatDate(date);
            const dayNight = getDayNightStatus(date);
            
            card.querySelector('.clock-time').textContent = time;
            card.querySelector('.clock-period').textContent = period;
            card.querySelector('.clock-date').textContent = dateStr;
            
            const indicator = card.querySelector('.day-night-indicator');
            indicator.className = `day-night-indicator ${dayNight}`;
            indicator.textContent = dayNight === 'day' ? '☀️ Day' : '🌙 Night';
        }
    });
}

// Toggle time format
function toggleFormat() {
    is24HourFormat = !is24HourFormat;
    saveSettings();
    updateClocks();
    
    const btn = document.getElementById('formatToggle');
    btn.querySelector('.format-icon').textContent = is24HourFormat ? '24h' : '12h';
}

// Remove timezone
function removeTimezone(index) {
    if (index === 0) return; // Prevent removing local time
    
    currentTimeZones.splice(index, 1);
    saveSettings();
    renderClocks();
}

// Show add timezone modal
function showAddTimezoneModal() {
    document.getElementById('timezoneModal').classList.remove('hidden');
}

// Hide add timezone modal
function hideAddTimezoneModal() {
    document.getElementById('timezoneModal').classList.add('hidden');
    document.getElementById('tzName').value = '';
    document.getElementById('tzTimezone').value = '';
    document.getElementById('tzEmoji').value = '';
}

// Add new timezone
function addNewTimezone() {
    const name = document.getElementById('tzName').value.trim();
    const timezone = document.getElementById('tzTimezone').value.trim();
    const emoji = document.getElementById('tzEmoji').value.trim() || '🌍';
    
    if (!name || !timezone) {
        alert('Please fill in all fields');
        return;
    }
    
    // Validate timezone
    try {
        getTimeInZone(timezone);
    } catch (e) {
        alert('Invalid timezone. Please use format like America/New_York');
        return;
    }
    
    currentTimeZones.push({ name, timezone, emoji });
    saveSettings();
    renderClocks();
    hideAddTimezoneModal();
}

// Initialize
function init() {
    loadSettings();
    renderClocks();
    
    // Update clocks every second
    setInterval(updateClocks, 1000);
    
    // Event listeners
    document.getElementById('formatToggle').addEventListener('click', toggleFormat);
    document.getElementById('addTimezone').addEventListener('click', showAddTimezoneModal);
    document.getElementById('cancelBtn').addEventListener('click', hideAddTimezoneModal);
    document.getElementById('addBtn').addEventListener('click', addNewTimezone);
    document.querySelector('.close-btn').addEventListener('click', hideAddTimezoneModal);
    
    // Close modal when clicking outside
    document.getElementById('timezoneModal').addEventListener('click', (e) => {
        if (e.target.id === 'timezoneModal') {
            hideAddTimezoneModal();
        }
    });
    
    // Enter key to add timezone
    document.getElementById('tzEmoji').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addNewTimezone();
        }
    });
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

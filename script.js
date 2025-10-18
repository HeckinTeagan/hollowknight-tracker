// --- CONFIGURATION ---
// Your Render URL for the live API
const API_BASE_URL = 'https://grub-tracker-api.onrender.com/api'; 
// ---------------------

// 🔑 ADDED: Element references for new UI components
const authContainer = document.getElementById('auth-container');
const checklistContainer = document.getElementById('checklist-container');
const messageArea = document.getElementById('message-area');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutButton = document.getElementById('logout-button');
const showSignupLink = document.getElementById('show-signup-link');
const showLoginLink = document.getElementById('show-login-link');
const grubCounter = document.getElementById('grub-counter'); 
const confirmPasswordField = document.getElementById('confirm-password'); 

// 🔑 NEW: References for guest elements
const guestButton = document.getElementById('guest-button');
const guestStatus = document.getElementById('guest-status');

// 🔑 NEW: State variable for Guest Mode
const GUEST_MODE_KEY = 'isGuest';
const GUEST_DATA_KEY = 'guestGrubData';
let isGuestMode = localStorage.getItem(GUEST_MODE_KEY) === 'true'; // Check initial state
// --- End New Element References ---


const grubsData = [
    // ... (Grub data is unchanged) ...
    { area: "Forgotten Crossroads (5 Grubs)", list: [
        "Grub 1: Defeat the Husk Guard.", "Grub 2: Found in the main cavern, relatively easy to reach.", "Grub 3: Found behind a breakable wall.", "Grub 4: Requires a Nail-bounce to reach.", "Grub 5: Requires the Mothwing Cloak (Dash) or a Nail-bounce."
    ]},
    { area: "Greenpath (4 Grubs)", list: ["Grub 6: Requires throwing a moss block off a ledge.", "Grub 7: Found in a straightforward platforming section.", "Grub 8: Defeat the Moss Knight.", "Grub 9: Found in a challenging platforming area."]},
    { area: "Fungal Wastes (2 Grubs)", list: ["Grub 10: Requires the Mothwing Cloak (Dash).", "Grub 11: Requires the Mantis Claw (Wall Jump)."]},
    { area: "City of Tears (5 Grubs)", list: ["Grub 12: Found in a hidden area accessible without special movement abilities.", "Grub 13: Defeat the Great Husk Sentry.", "Grub 14: Requires Desolate Dive / Descending Dark to break a floor.", "Grub 15: Found in a straightforward section of the city.", "Grub 16: Requires Mantis Claw and Monarch Wings (Double Jump), or a difficult Nail-bounce."]},
    { area: "Crystal Peak (7 Grubs)", list: ["Grub 17: Requires Mantis Claw and Crystal Heart (Super Dash).", "Grub 18: Requires Mothwing Cloak and Mantis Claw.", "Grub 19: Requires Mantis Claw and either Crystal Heart or Monarch Wings.", "Grub 20: Requires Mothwing Cloak and Monarch Wings, or a Nail-bounce.", "Grub 21: Requires Mothwing Cloak.", "Grub 22: Requires Mothwing Cloak and Mantis Claw.", "Grub 23: Requires Mothwing Cloak, Mantis Claw, and Desolate Dive / Descending Dark."]},
    { area: "Resting Grounds (1 Grub)", list: ["Grub 24: Requires Desolate Dive / Descending Dark to break a floor."]},
    { area: "Royal Waterways (3 Grubs)", list: ["Grub 25: Found in an accessible area near the main path.", "Grub 26: Requires Crystal Heart and Monarch Wings, or a difficult Nail-bounce.", "Grub 27: Requires Isma's Tear to swim across acid."]},
    { area: "Howling Cliffs (1 Grub)", list: ["Grub 28: Requires Mantis Claw."]},
    { area: "Kingdom's Edge (2 Grubs)", list: ["Grub 29: Requires Desolate Dive / Descending Dark to break a floor.", "Grub 30: Requires Mantis Claw."]},
    { area: "Fog Canyon (1 Grub)", list: ["Grub 31: Requires Crystal Heart."]},
    { area: "Queen's Gardens (3 Grubs)", list: ["Grub 32: Found near the main routes.", "Grub 33: Requires Mantis Claw, Crystal Heart, and Monarch Wings, or a difficult Nail-bounce.", "Grub 34: Requires Mantis Claw."]},
    { area: "Deepnest (5 Grubs)", list: ["Grub 35: Requires Mantis Claw and breaking a breakable wall.", "Grub 36: Requires Mantis Claw and Crystal Heart, or a difficult Nail-bounce.", "Grub 37: Requires breaking a breakable wall and either Monarch Wings or Crystal Heart.", "Grub 38: Requires Mothwing Cloak and Mantis Claw.", "Grub 39: Requires Mothwing Cloak and Mantis Claw."]},
    { area: "Ancient Basin (2 Grubs)", list: ["Grub 40: Requires Mothwing Cloak and Monarch Wings.", "Grub 41: Requires Desolate Dive / Descending Dark to break a floor."]},
    { area: "The Hive (2 Grubs)", list: ["Grub 42: Requires Desolate Dive / Descending Dark and Isma's Tear.", "Grub 43: Requires Crystal Heart and Monarch Wings, or a difficult Nail-bounce."]},
    { area: "Tower of Love (3 Grubs)", list: ["Grub 44: Found in the room after defeating The Collector. Requires the Love Key.", "Grub 45: Found in the room after defeating The Collector. Requires the Love Key.", "Grub 46: Found in the room after defeating The Collector. Requires the Love Key."]}
];
// ... (End Grub Data) ...

const container = document.getElementById('grub-list-container');
let grubIndex = 0; 


// 💡 NEW FUNCTION: Manages the HallowNet connection message state and animation
function showLoadingMessage(isLoading) {
    if (isLoading) {
        messageArea.textContent = 'Connecting to HallowNet...';
        // FIX: Show the element with 'block' and apply the animation class
        messageArea.style.display = 'block'; 
        messageArea.classList.add('connecting-pulse');
    } else {
        // FIX: Hide the element completely and remove the animation class
        messageArea.classList.remove('connecting-pulse');
        messageArea.style.display = 'none'; 
        messageArea.textContent = ''; // Clear content
    }
}


// 💡 NEW FUNCTION: Calculates and updates the rescued grub count
function updateGrubCounter() {
    const rescuedGrubs = document.querySelectorAll('input[id^="grub-"]:checked');
    const rescuedCount = rescuedGrubs.length;
    const totalGrubs = 46;

    if (grubCounter) {
        grubCounter.textContent = `Grubs Rescued: ${rescuedCount} / ${totalGrubs}`;
    }
}


// 🔑 ADDED: HELPER - Gets the JWT token from localStorage and formats the Authorization header
function getAuthHeaders(contentType = 'application/json') {
    const token = localStorage.getItem('jwtToken');
    const headers = {
        'Content-Type': contentType,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// 🔑 MODIFIED: HANDLER - Logout function to clear token, guest state, and show login
function handleLogout() {
    localStorage.removeItem('jwtToken');
    // 🔑 MODIFIED: Also remove guest state
    localStorage.removeItem(GUEST_MODE_KEY);
    isGuestMode = false;
    
    checkAuthAndRenderUI();
    messageArea.textContent = 'You have been logged out.';
    // FIX: Ensure message area is visible to show logout status
    messageArea.style.display = 'block'; 
}

// 🔑 NEW: HANDLER - Set guest mode and render UI
function handleGuestAccess() {
    isGuestMode = true;
    localStorage.setItem(GUEST_MODE_KEY, 'true');
    // 💡 As per the planned improvement, we don't clear local data here,
    // the user should retain their local progress until they explicitly log in/sign up.
    checkAuthAndRenderUI(); 
    messageArea.textContent = ''; // Clear any prior login/signup messages
}


// 🔑 ADDED: HANDLER - Toggles between login and signup forms
function toggleAuthForms(showLogin) {
    loginForm.style.display = showLogin ? 'block' : 'none';
    signupForm.style.display = showLogin ? 'none' : 'block';
    // FIX: Ensure message area is hidden when toggling forms
    messageArea.style.display = 'none'; 
    messageArea.textContent = ''; 
}

// 🔑 MODIFIED: CORE LOGIC - Checks for token/guest state and shows/hides UI
function checkAuthAndRenderUI() {
    const isAuthenticated = localStorage.getItem('jwtToken');
    
    // Re-check isGuestMode from localStorage if it hasn't been set in this session
    isGuestMode = localStorage.getItem(GUEST_MODE_KEY) === 'true';

    if (isAuthenticated || isGuestMode) {
        authContainer.style.display = 'none';
        checklistContainer.style.display = 'block';
        
        // 🔑 NEW: Show guest status only if in guest mode
        guestStatus.style.display = isGuestMode ? 'inline-block' : 'none';
        
        initChecklist(); // Proceed to load data for the user or guest
    } else {
        authContainer.style.display = 'block';
        checklistContainer.style.display = 'none';
        container.innerHTML = ''; // Clear checklist content if logged out
        toggleAuthForms(true); // Default to showing login form
    }
}

// 🔑 MODIFIED: HANDLER - Handles both login and signup form submissions with UX validation
async function handleAuth(event, endpoint) {
    event.preventDefault();
    
    // 🚀 START CHANGES: Get button reference
    const submitButton = event.submitter; 
    
    // 🔑 NEW: If a user logs in or signs up, disable guest mode
    localStorage.removeItem(GUEST_MODE_KEY);
    isGuestMode = false;
    
    const form = event.target;
    const username = form.elements[0].value; 
    const password = form.elements[1].value;
    const confirmPassword = endpoint === 'signup' ? form.elements[2].value : null;

    messageArea.textContent = '';

    // ✅ CLIENT-SIDE VALIDATION: Password Match for Signup
    if (endpoint === 'signup') {
        if (password.length < 6) {
            messageArea.textContent = 'Error: Password must be at least 6 characters long.';
            // FIX: Show the message, but do not apply the loading state
            messageArea.style.display = 'block'; 
            return; 
        }
        if (password !== confirmPassword) {
            messageArea.textContent = 'Error: Password and Confirm Password do not match!';
            // FIX: Show the message
            messageArea.style.display = 'block'; 
            return;
        }
    }
    // ------------------------------------------

    // 🚀 NEW: START LOADING STATE
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...'; 

    // 🚀 MODIFIED: Use new helper function to show message and start animation
    showLoadingMessage(true);

    try {
        const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('jwtToken', data.token);
            form.reset(); 
            // Hide the loading message before rendering the new UI
            showLoadingMessage(false);
            checkAuthAndRenderUI();
            // Message area cleared by checkAuthAndRenderUI when authContainer is hidden
        } else {
            messageArea.textContent = `Error: ${data.message}`;
            // FIX: Keep the error message visible
            messageArea.style.display = 'block'; 
        }
    } catch (error) {
        messageArea.textContent = 'Network error. Could not connect to the server.';
        // FIX: Keep the network error message visible
        messageArea.style.display = 'block'; 
    } finally {
        // 🚀 NEW: END LOADING STATE (Always runs, regardless of success/failure)
        submitButton.disabled = false;
        // Reset button text based on the endpoint
        submitButton.textContent = endpoint === 'login' ? 'Login' : 'Sign Up';

        // 🚀 MODIFIED: Only hide the loading pulse if the whole auth container is still visible 
        // and we succeeded, or we failed and want to stop the pulse
        if (authContainer.style.display !== 'none') {
             // Stop the animation pulse whether it succeeded or failed
             showLoadingMessage(false); 
        }
    }
    // 🚀 END CHANGES
}

// --- Step A: Function to update the server (POST) ---
// 🔄 MODIFIED: Handles updates to either the server (logged-in) or local storage (guest)
async function updateServer(grubId, isChecked) {
    
    if (isGuestMode) {
        // 🔑 GUEST MODE: Save to Local Storage instead of API
        let guestData = {};
        try {
            const storedData = localStorage.getItem(GUEST_DATA_KEY);
            guestData = storedData ? JSON.parse(storedData) : {};
        } catch (e) {
            console.error("Error parsing guest data from local storage:", e);
        }
        
        guestData[grubId] = isChecked;
        localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(guestData));
        return;
    }

    // 🔑 LOGGED-IN MODE: Continue with server update logic
    try {
        const response = await fetch(`${API_BASE_URL}/checklist`, { 
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ grubId, isChecked })
        });

        if (response.status === 401) {
            handleLogout(); 
            return;
        }

        if (!response.ok) {
            throw new Error(`Update failed: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error communicating with server.', error);
    }
}

// --- Step B: Function to build and render the checklist ---
function renderChecklist(checkedGrubsFromServer) {
    container.innerHTML = ''; 
    grubIndex = 0; 
    
    grubsData.forEach(areaData => {
        const areaDiv = document.createElement('div');
        areaDiv.className = 'grub-area';
        areaDiv.innerHTML = `<h3>${areaData.area}</h3>`;
        
        const ul = document.createElement('ul');
        
        areaData.list.forEach(grubDescription => {
            grubIndex++;
            const uniqueId = `grub-${grubIndex}`;
            
            const li = document.createElement('li');
            li.id = `li-${uniqueId}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = uniqueId;
            
            // Check if the current grub is marked as checked from the loaded data
            const isGrubChecked = checkedGrubsFromServer[uniqueId] === true;
            if (isGrubChecked) {
                checkbox.checked = true;
                li.classList.add('checked-item');
            }

            checkbox.addEventListener('change', (event) => {
                const isChecked = event.target.checked;
                li.classList.toggle('checked-item', isChecked);
                // 🔄 MODIFIED: updateServer now handles guest mode logic
                updateServer(uniqueId, isChecked);
                
                updateGrubCounter(); 
            });

            const label = document.createElement('label');
            label.htmlFor = uniqueId;
            label.className = 'grub-item-text';
            label.textContent = grubDescription;

            li.appendChild(checkbox);
            li.appendChild(label);
            ul.appendChild(li);
        });

        areaDiv.appendChild(ul);
        container.appendChild(areaDiv);
    });
    
    updateGrubCounter(); 
}

// --- Step C: Main function to fetch data and start rendering ---
// 🔄 MODIFIED: Now checks for guest mode and loads data from local storage if true
async function initChecklist() {

    // 🔑 NEW: Guest Mode data loading
    if (isGuestMode) {
        let checkedGrubs = {};
        try {
            const storedData = localStorage.getItem(GUEST_DATA_KEY);
            checkedGrubs = storedData ? JSON.parse(storedData) : {};
        } catch (e) {
            console.error("Could not parse guest grub data, starting fresh.", e);
        }
        renderChecklist(checkedGrubs);
        return;
    }

    // 🔑 LOGGED-IN MODE: Continue with server fetch logic
    try {
        const response = await fetch(`${API_BASE_URL}/checklist`, {
            headers: getAuthHeaders()
        });
        
        if (response.status === 401) {
            handleLogout(); 
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const checkedGrubsFromServer = await response.json();
        renderChecklist(checkedGrubsFromServer);

    } catch (error) {
        console.error('Initialization Error:', error);
        container.innerHTML = '<h2><span style="color: red;">[DATA ERROR]</span> Could not load checklist. Please check console for network details.</h2>';
    }
}

// 🔑 ADDED: EVENT LISTENERS and Initial Call

// Form submission listeners for login/signup
loginForm.addEventListener('submit', (e) => handleAuth(e, 'login'));
signupForm.addEventListener('submit', (e) => handleAuth(e, 'signup'));

// Link listeners to toggle between forms
showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthForms(false); // Show signup
});
showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthForms(true); // Show login
});

// Logout button listener
logoutButton.addEventListener('click', handleLogout);

// 🔑 NEW: Guest button listener
guestButton.addEventListener('click', handleGuestAccess);


// Run the authentication check when the page loads
checkAuthAndRenderUI();
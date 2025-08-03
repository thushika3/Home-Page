// auth.js - Complete working version

const API_BASE_URL = 'http://localhost:5000';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check login state on page load
    checkLoginState();
    
    // Setup logout functionality
    setupLogout();
    
    // Setup login form if exists
    if (document.getElementById('loginForm')) {
        setupLoginForm();
    }
    
    // Setup signup form if exists
    if (document.getElementById('signupForm')) {
        setupSignupForm();
    }
});

// Check and update login state
function checkLoginState() {
    const authToken = localStorage.getItem('authToken');
    const userProfile = document.getElementById('user-profile');
    const navLoginBtn = document.getElementById('navLoginBtn');
    
    if (authToken) {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                
                if (navLoginBtn) navLoginBtn.style.display = 'none';
                if (userProfile) {
                    userProfile.style.display = 'block';
                    const usernameDisplay = document.getElementById('username-display');
                    const profileAvatar = document.getElementById('profile-avatar');
                    
                    if (usernameDisplay && user.name) {
                        usernameDisplay.textContent = user.name.split(' ')[0] || 'Account';
                    }
                    
                    if (profileAvatar && user.name) {
                        createAvatar(user.name);
                    }
                }
            }
        } catch (error) {
            console.error('Error processing user data:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }
    } else {
        if (navLoginBtn) navLoginBtn.style.display = 'inline-block';
        if (userProfile) userProfile.style.display = 'none';
    }
}

// Create avatar from user initials
function createAvatar(name) {
    const avatar = document.getElementById('profile-avatar');
    if (!avatar || !name) return;
    
    const names = name.split(' ');
    let initials = names[0].charAt(0).toUpperCase();
    if (names.length > 1) {
        initials += names[names.length - 1].charAt(0).toUpperCase();
    }
    avatar.textContent = initials;
}

// Setup logout functionality
function setupLogout() {
    document.addEventListener('click', function(e) {
        // Handle logout button click
        if (e.target.closest('#logout-btn')) {
            e.preventDefault();
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }
        
        // Handle profile dropdown toggle
        if (e.target.closest('#profile-btn')) {
            e.preventDefault();
            const dropdown = document.getElementById('profile-dropdown');
            dropdown.classList.toggle('show');
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#profile-btn') && !e.target.closest('#profile-dropdown')) {
            const dropdown = document.getElementById('profile-dropdown');
            if (dropdown) dropdown.classList.remove('show');
        }
    });
}

// Login form setup
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const errorElement = document.getElementById('loginError');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        setButtonLoading(loginBtn, true, 'Login');
        errorElement.style.display = 'none';

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed. Please check your credentials.');
            }

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'index.html';
        } catch (error) {
            showFormError(errorElement, error.message);
        } finally {
            setButtonLoading(loginBtn, false, 'Login');
        }
    });

    // Password toggle
    document.getElementById('toggleLoginPassword').addEventListener('click', function() {
        const passwordInput = document.getElementById('loginPassword');
        togglePasswordVisibility(passwordInput, this.querySelector('i'));
    });
}

// Signup form setup
function setupSignupForm() {
    const signupForm = document.getElementById('signupForm');
    const signupBtn = document.getElementById('signupBtn');
    const errorElement = document.getElementById('signupError');

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        setButtonLoading(signupBtn, true, 'Continue');
        errorElement.style.display = 'none';

        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const phone = document.getElementById('signupPhone').value;
        const password = document.getElementById('signupPassword').value;

        try {
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed. Please try again.');
            }
            
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'index.html';
        } catch (error) {
            showFormError(errorElement, error.message);
        } finally {
            setButtonLoading(signupBtn, false, 'Continue');
        }
    });

    // Password toggle
    document.getElementById('toggleSignupPassword').addEventListener('click', function() {
        const passwordInput = document.getElementById('signupPassword');
        togglePasswordVisibility(passwordInput, this.querySelector('i'));
    });
}

// Helper functions
function togglePasswordVisibility(inputElement, iconElement) {
    if (inputElement.type === 'password') {
        inputElement.type = 'text';
        iconElement.classList.remove('fa-eye');
        iconElement.classList.add('fa-eye-slash');
    } else {
        inputElement.type = 'password';
        iconElement.classList.remove('fa-eye-slash');
        iconElement.classList.add('fa-eye');
    }
}

function showFormError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function setButtonLoading(button, isLoading, defaultText) {
    const btnText = button.querySelector('.btn-text');
    if (isLoading) {
        button.classList.add('btn-loading');
        button.disabled = true;
    } else {
        button.classList.remove('btn-loading');
        button.disabled = false;
        btnText.textContent = defaultText;
    }
}
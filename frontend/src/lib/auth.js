// Authentication utility functions

/**
 * Get the currently logged-in user's ID
 * @returns {string|null} The userid or null if not logged in
 */
export function getCurrentUserId() {
    return localStorage.getItem("userid");
}

/**
 * Get the currently logged-in user's username
 * @returns {string|null} The username or null if not logged in
 */
export function getCurrentUsername() {
    return localStorage.getItem("username");
}

/**
 * Get the currently logged-in user's email
 * @returns {string|null} The email or null if not logged in
 */
export function getCurrentUserEmail() {
    return localStorage.getItem("useremail");
}

/**
 * Check if user is logged in
 * @returns {boolean} True if logged in, false otherwise
 */
export function isLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true" && !!getCurrentUserId();
}

/**
 * Get all current user data
 * @returns {object|null} User object or null if not logged in
 */
export function getCurrentUser() {
    if (!isLoggedIn()) return null;
    
    return {
        userid: getCurrentUserId(),
        username: getCurrentUsername(),
        useremail: getCurrentUserEmail()
    };
}

/**
 * Log out the current user
 */
export function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userid");
    localStorage.removeItem("username");
    localStorage.removeItem("useremail");
}

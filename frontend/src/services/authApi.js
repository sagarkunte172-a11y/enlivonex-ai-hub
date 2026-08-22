/*
==================================
Authentication API
==================================
*/

/*
==================================
API BASE URL
==================================

The backend runs on port 5000.

Instead of depending on a fixed LAN IP from
.env, the frontend dynamically uses the
current browser hostname.

Examples:

localhost:3000
    ↓
localhost:5000/api

192.168.1.29:3000
    ↓
192.168.1.29:5000/api

This keeps localhost and LAN access working
without hardcoding the computer's IP.
==================================
*/

const API_BASE_URL =
    `${window.location.protocol}//${window.location.hostname}:5000/api`;


/*
==================================
AUTH REQUEST
==================================
*/

async function authRequest(path, body) {

    const response = await fetch(
        `${API_BASE_URL}${path}`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(body)
        }
    );


    /*
    ==================================
    RESPONSE PARSING
    ==================================
    */

    const data =
        await response
            .json()
            .catch(() => ({}));


    /*
    ==================================
    ERROR HANDLING
    ==================================
    */

    if (!response.ok) {

        throw new Error(
            data.message ||
            `Authentication request failed (${response.status})`
        );

    }


    /*
    ==================================
    SUCCESS
    ==================================
    */

    return data;

}


/*
==================================
STORE AUTH TOKEN
==================================
*/

export function storeAuthToken(
    token,
    user
) {

    if (!token) {
        return;
    }


    localStorage.setItem(
        "auth_token",
        token
    );


    /*
    Keep workspace authentication
    compatible with the same JWT.
    */

    localStorage.setItem(
        "workspace_token",
        token
    );


    if (user) {

        localStorage.setItem(
            "auth_user",
            JSON.stringify(user)
        );

    }

}


/*
==================================
CLEAR AUTH TOKEN
==================================
*/

export function clearAuthToken() {

    localStorage.removeItem(
        "auth_token"
    );

    localStorage.removeItem(
        "workspace_token"
    );

    localStorage.removeItem(
        "auth_user"
    );

}


/*
==================================
GET STORED USER
==================================
*/

export function getStoredUser() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "auth_user"
            ) || "null"
        );

    } catch (error) {

        console.error(
            "Failed to read stored authentication user:",
            error
        );

        return null;

    }

}


/*
==================================
GET STORED AUTH TOKEN
==================================
*/

export function getAuthToken() {

    return localStorage.getItem(
        "auth_token"
    );

}


/*
==================================
CHECK AUTHENTICATION
==================================
*/

export function isAuthenticated() {

    return Boolean(
        getAuthToken()
    );

}


/*
==================================
LOGIN
==================================
*/

export function loginUser(
    email,
    password
) {

    return authRequest(
        "/auth/login",
        {
            email,
            password
        }
    );

}


/*
==================================
REGISTER
==================================
*/

export function registerUser(
    username,
    email,
    password
) {

    return authRequest(
        "/auth/register",
        {
            username,
            email,
            password
        }
    );

}


/*
==================================
EXPORT API BASE URL
==================================
*/

export {
    API_BASE_URL
};
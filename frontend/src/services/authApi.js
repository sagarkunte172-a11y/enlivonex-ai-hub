const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    `${window.location.protocol}//${window.location.hostname}:5000/api`;

async function authRequest(path, body) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || `Authentication request failed (${response.status})`);
    }

    return data;
}

export function storeAuthToken(token, user) {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("workspace_token", token);

    if (user) {
        localStorage.setItem("auth_user", JSON.stringify(user));
    }
}

export function clearAuthToken() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("workspace_token");
    localStorage.removeItem("auth_user");
}

export function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
        return null;
    }
}

export function loginUser(email, password) {
    return authRequest("/auth/login", { email, password });
}

export function registerUser(username, email, password) {
    return authRequest("/auth/register", {
        username,
        email,
        password
    });
}

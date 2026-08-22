const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    `${window.location.protocol}//${window.location.hostname}:5000/api`;

function getToken() {
    return localStorage.getItem("workspace_token") ||
        localStorage.getItem("auth_token") ||
        "";
}

async function workspaceRequest(path, options = {}) {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {

        if (response.status === 401) {
            clearWorkspaceToken();
        }

        throw new Error(data.message || `Workspace request failed (${response.status})`);
    }

    return data;
}

export function saveWorkspaceToken(token) {
    localStorage.setItem("workspace_token", token.trim());
}

export function clearWorkspaceToken() {
    localStorage.removeItem("workspace_token");
    localStorage.removeItem("auth_token");
}

export function hasWorkspaceToken() {
    return Boolean(getToken());
}

export function createWorkspace(name, description) {
    return workspaceRequest("/workspaces", {
        method: "POST",
        body: JSON.stringify({ name, description })
    });
}

export function joinWorkspace(inviteCode, alias) {
    return workspaceRequest("/workspaces/join", {
        method: "POST",
        body: JSON.stringify({ inviteCode, alias })
    });
}

export function getWorkspaces() {
    return workspaceRequest("/workspaces/user");
}

export function getWorkspaceDetails(workspaceId) {
    return workspaceRequest(`/workspaces/${workspaceId}`);
}

export function createWorkspaceSession(workspaceId, title, projectId, category) {
    return workspaceRequest(`/workspaces/${workspaceId}/sessions`, {
        method: "POST",
        body: JSON.stringify({ title, projectId, category })
    });
}

export function getMyWorkspaceSessions(workspaceId) {
    return workspaceRequest(`/workspaces/${workspaceId}/sessions/me`);
}

export function getWorkspaceUsage(workspaceId) {
    return workspaceRequest(`/workspaces/${workspaceId}/usage`);
}

export function addWorkspaceMember(workspaceId, userId, alias, role) {
    return workspaceRequest(`/workspaces/${workspaceId}/members`, {
        method: "POST",
        body: JSON.stringify({ userId, alias, role })
    });
}

export function removeWorkspaceMember(workspaceId, userId) {
    return workspaceRequest(`/workspaces/${workspaceId}/members/${userId}`, {
        method: "DELETE"
    });
}

export function changeWorkspaceRole(workspaceId, userId, role) {
    return workspaceRequest(`/workspaces/${workspaceId}/members/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role })
    });
}

export function leaveWorkspace(workspaceId) {
    return workspaceRequest(`/workspaces/${workspaceId}/leave`, {
        method: "POST"
    });
}

export function getWorkspaceShares(workspaceId, resourceType) {
    const suffix = resourceType ? `?resourceType=${encodeURIComponent(resourceType)}` : "";
    return workspaceRequest(`/workspaces/${workspaceId}/shares${suffix}`);
}

export function revokeWorkspaceShare(workspaceId, shareId) {
    return workspaceRequest(`/workspaces/${workspaceId}/shares/${shareId}`, {
        method: "DELETE"
    });
}

export function shareWorkspaceSession(workspaceId, sessionId, sharedWith, permission = "view") {
    return workspaceRequest(`/workspaces/${workspaceId}/shares/session`, {
        method: "POST",
        body: JSON.stringify({ sessionId, sharedWith, permission })
    });
}

export function shareWorkspaceMessage(workspaceId, messageId, sharedWith, permission = "view") {
    return workspaceRequest(`/workspaces/${workspaceId}/shares/message`, {
        method: "POST",
        body: JSON.stringify({ messageId, sharedWith, permission })
    });
}

export function createProject(workspaceId, name, description) {
    return workspaceRequest(`/workspaces/${workspaceId}/projects`, {
        method: "POST",
        body: JSON.stringify({ name, description })
    });
}

export function getProjects(workspaceId) {
    return workspaceRequest(`/workspaces/${workspaceId}/projects`);
}

export function archiveProject(projectId) {
    return workspaceRequest(`/projects/${projectId}`, {
        method: "DELETE"
    });
}

export async function switchWorkspaceSession(sessionId) {
    return workspaceRequest("/session/switch", {
        method: "POST",
        body: JSON.stringify({ sessionId })
    });
}

export async function sendWorkspaceMessage(message, sessionId, model, onChunk, signal) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message, sessionId, model }),
        signal
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) clearWorkspaceToken();
        throw new Error(data.message || `Workspace chat failed (${response.status})`);
    }

    if (!response.body) {
        throw new Error("Workspace chat stream unavailable.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let answer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        if (onChunk) {
            onChunk(answer, {
                name: response.headers.get("X-Model-Name") || "Unknown",
                id: response.headers.get("X-Model-ID") || model,
                reason: response.headers.get("X-Model-Reason") || ""
            });
        }
    }

    return { success: true, answer };
}

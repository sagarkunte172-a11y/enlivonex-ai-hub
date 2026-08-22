import { useCallback, useEffect, useState } from "react";
import "./Workspace.css";

import {
    clearWorkspaceToken,
    createWorkspace,
    getWorkspaceDetails,
    getWorkspaces,
    hasWorkspaceToken,
    joinWorkspace,
    saveWorkspaceToken
} from "../services/workspaceApi";

function Workspace() {
    const [token, setToken] = useState("");
    const [workspaces, setWorkspaces] = useState([]);
    const [selected, setSelected] = useState(null);
    const [workspaceName, setWorkspaceName] = useState("");
    const [description, setDescription] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [alias, setAlias] = useState("");
    const [status, setStatus] = useState("");
    const [busy, setBusy] = useState(false);

    const selectWorkspace = useCallback(async (workspaceId) => {
        try {
            const data = await getWorkspaceDetails(workspaceId);
            setSelected(data);
        } catch (error) {
            setStatus(error.message);
        }
    }, []);

    const loadWorkspaces = useCallback(async () => {
        setBusy(true);
        setStatus("");

        try {
            const data = await getWorkspaces();
            setWorkspaces(data.workspaces || []);

            if (data.workspaces?.[0]?.workspace?._id) {
                await selectWorkspace(data.workspaces[0].workspace._id);
            }
        } catch (error) {
            setStatus(error.message);
        } finally {
            setBusy(false);
        }
    }, [selectWorkspace]);

    useEffect(() => {
        if (hasWorkspaceToken()) {
            loadWorkspaces();
        }
    }, [loadWorkspaces]);

    async function handleToken(event) {
        event.preventDefault();
        if (!token.trim()) return;

        saveWorkspaceToken(token);
        setStatus("Workspace identity saved. Loading workspaces...");
        await loadWorkspaces();
    }

    async function handleCreate(event) {
        event.preventDefault();
        if (!workspaceName.trim()) return;

        setBusy(true);
        try {
            await createWorkspace(workspaceName, description);
            setWorkspaceName("");
            setDescription("");
            setStatus("Workspace created successfully.");
            await loadWorkspaces();
        } catch (error) {
            setStatus(error.message);
        } finally {
            setBusy(false);
        }
    }

    async function handleJoin(event) {
        event.preventDefault();
        if (!inviteCode.trim()) return;

        setBusy(true);
        try {
            await joinWorkspace(inviteCode, alias);
            setInviteCode("");
            setAlias("");
            setStatus("You joined the workspace successfully.");
            await loadWorkspaces();
        } catch (error) {
            setStatus(error.message);
        } finally {
            setBusy(false);
        }
    }

    function handleSignOut() {
        clearWorkspaceToken();
        setWorkspaces([]);
        setSelected(null);
        setToken("");
        setStatus("Workspace identity removed from this browser.");
    }

    return (
        <div className="workspace-page">
            <aside className="workspace-rail">
                <div>
                    <div className="workspace-brand">
                        <span>🚀</span>
                        <div>
                            <strong>ENLIVONEX</strong>
                            <small>Team workspace</small>
                        </div>
                    </div>

                    <div className="workspace-rail-label">Workspace hub</div>
                    <nav className="workspace-nav" aria-label="Workspace navigation">
                        <button className="workspace-nav-item active" type="button">▦ Overview</button>
                        <button className="workspace-nav-item" type="button">◈ Shared chats</button>
                        <button className="workspace-nav-item" type="button">⌘ Projects</button>
                        <button className="workspace-nav-item" type="button">◎ Usage</button>
                    </nav>
                </div>

                <div className="workspace-rail-note">
                    <span className="workspace-live-dot" />
                    <div>
                        <strong>LAN ready</strong>
                        <small>Connected team space</small>
                    </div>
                </div>
            </aside>

            <main className="workspace-main">
                <header className="workspace-header">
                    <div>
                        <span className="workspace-kicker">COLLABORATION CONSOLE</span>
                        <h1>Workspace</h1>
                        <p>Bring your team&apos;s AI work into one focused place.</p>
                    </div>
                    {hasWorkspaceToken() && (
                        <button className="workspace-ghost-button" type="button" onClick={handleSignOut}>
                            Sign out workspace
                        </button>
                    )}
                </header>

                {!hasWorkspaceToken() && (
                    <section className="workspace-token-panel">
                        <div>
                            <span className="panel-mark">JWT</span>
                            <h2>Connect your workspace identity</h2>
                            <p>Use the token returned by the backend login endpoint to access team workspaces.</p>
                        </div>
                        <form onSubmit={handleToken} className="workspace-token-form">
                            <input
                                type="password"
                                value={token}
                                onChange={(event) => setToken(event.target.value)}
                                placeholder="Paste workspace JWT"
                                aria-label="Workspace JWT"
                            />
                            <button type="submit">Connect</button>
                        </form>
                    </section>
                )}

                <section className="workspace-grid">
                    <div className="workspace-content-column">
                        <div className="workspace-section-heading">
                            <div>
                                <span className="workspace-kicker">YOUR SPACES</span>
                                <h2>Choose a workspace</h2>
                            </div>
                            <span className="workspace-count">{workspaces.length} active</span>
                        </div>

                        <div className="workspace-list">
                            {workspaces.length === 0 ? (
                                <div className="workspace-empty">
                                    <span>◌</span>
                                    <h3>No workspace selected</h3>
                                    <p>Create a new team space or join one with an invite code.</p>
                                </div>
                            ) : (
                                workspaces.map((item) => (
                                    <button
                                        className={`workspace-card ${selected?.workspace?._id === item.workspace?._id ? "selected" : ""}`}
                                        type="button"
                                        key={item.workspace._id}
                                        onClick={() => selectWorkspace(item.workspace._id)}
                                    >
                                        <span className="workspace-card-icon">{item.workspace.name.slice(0, 1).toUpperCase()}</span>
                                        <span className="workspace-card-copy">
                                            <strong>{item.workspace.name}</strong>
                                            <small>{item.role} · {item.workspace.description || "AI collaboration space"}</small>
                                        </span>
                                        <span className="workspace-card-arrow">→</span>
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="workspace-action-grid">
                            <form className="workspace-form-panel" onSubmit={handleCreate}>
                                <div className="form-panel-heading"><span>＋</span><div><h3>Create workspace</h3><p>Start a private team space.</p></div></div>
                                <input value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} placeholder="Workspace name" aria-label="Workspace name" />
                                <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What will your team build?" aria-label="Workspace description" rows="3" />
                                <button type="submit" disabled={busy}>Create workspace</button>
                            </form>

                            <form className="workspace-form-panel join-panel" onSubmit={handleJoin}>
                                <div className="form-panel-heading"><span>↗</span><div><h3>Join workspace</h3><p>Use your team invite code.</p></div></div>
                                <input value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="ENL-XXXXXX" aria-label="Invite code" />
                                <input value={alias} onChange={(event) => setAlias(event.target.value)} placeholder="Your team alias (optional)" aria-label="Team alias" />
                                <button type="submit" disabled={busy}>Join workspace</button>
                            </form>
                        </div>
                    </div>

                    <aside className="workspace-detail-panel">
                        <span className="workspace-kicker">SPACE DETAILS</span>
                        {selected ? (
                            <>
                                <div className="detail-title-row"><span className="detail-icon">{selected.workspace.name.slice(0, 1).toUpperCase()}</span><div><h2>{selected.workspace.name}</h2><span>{selected.members.length} members</span></div></div>
                                <div className="detail-rule" />
                                <h3>Members</h3>
                                <div className="member-list">
                                    {selected.members.map((member) => (
                                        <div className="member-row" key={`${member.userId}-${member.role}`}>
                                            <span className="member-avatar">{member.username.slice(0, 1).toUpperCase()}</span>
                                            <span><strong>{member.alias || member.username}</strong><small>{member.email || "Workspace member"}</small></span>
                                            <em>{member.role}</em>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="detail-empty"><span>◈</span><p>Select a workspace to inspect its members and team context.</p></div>
                        )}
                    </aside>
                </section>

                {status && <div className="workspace-status-message" role="status">{status}</div>}
            </main>
        </div>
    );
}

export default Workspace;

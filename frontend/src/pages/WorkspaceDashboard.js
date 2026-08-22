import { useCallback, useEffect, useMemo, useState } from "react";
import "./WorkspaceDashboard.css";
import {
    addWorkspaceMember,
    archiveProject,
    changeWorkspaceRole,
    clearWorkspaceToken,
    createProject,
    createWorkspace,
    createWorkspaceSession,
    getProjects,
    getMyWorkspaceSessions,
    getWorkspaceDetails,
    getWorkspaceShares,
    getWorkspaceUsage,
    getWorkspaces,
    hasWorkspaceToken,
    joinWorkspace,
    leaveWorkspace,
    removeWorkspaceMember,
    sendWorkspaceMessage,
    shareWorkspaceSession,
    switchWorkspaceSession
} from "../services/workspaceApi";

const categories = ["general", "coding", "design", "research", "planning", "debugging"];

function WorkspaceDashboard() {
    const [spaces, setSpaces] = useState([]);
    const [activeId, setActiveId] = useState("");
    const [details, setDetails] = useState(null);
    const [projects, setProjects] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [shares, setShares] = useState([]);
    const [usage, setUsage] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [tab, setTab] = useState("overview");
    const [draft, setDraft] = useState("");
    const [model, setModel] = useState("gemma3:4b");
    const [category, setCategory] = useState("general");
    const [projectId, setProjectId] = useState("");
    const [projectName, setProjectName] = useState("");
    const [memberId, setMemberId] = useState("");
    const [role, setRole] = useState("member");
    const [status, setStatus] = useState("");
    const [busy, setBusy] = useState(false);
    const [workspaceName, setWorkspaceName] = useState("");
    const [workspaceDescription, setWorkspaceDescription] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [alias, setAlias] = useState("");

    const activeMembership = useMemo(
        () => spaces.find((item) => item.workspace?._id === activeId),
        [spaces, activeId]
    );
    const currentRole = activeMembership?.role || "member";
    const canManage = currentRole === "owner" || currentRole === "admin";
    const isOwner = currentRole === "owner";

    const loadWorkspace = useCallback(async (workspaceId) => {
        setBusy(true);
        setStatus("");
        setDetails(null);
        setMessages([]);
        setActiveSession(null);
        try {
            const [workspaceData, projectData, sessionData] = await Promise.all([
                getWorkspaceDetails(workspaceId),
                getProjects(workspaceId),
                getMyWorkspaceSessions(workspaceId)
            ]);
            setDetails(workspaceData);
            setProjects(projectData.projects || []);
            setSessions(sessionData.sessions || []);
            setActiveId(workspaceId);
        } catch (error) {
            setStatus(error.message);
        } finally {
            setBusy(false);
        }
    }, []);

    const loadSpaces = useCallback(async () => {
        try {
            const data = await getWorkspaces();
            const nextSpaces = data.workspaces || [];
            setSpaces(nextSpaces);
            const nextId = activeId || nextSpaces[0]?.workspace?._id;
            if (nextId) await loadWorkspace(nextId);
        } catch (error) {
            setStatus(error.message);
        }
    }, [activeId, loadWorkspace]);

    useEffect(() => {
        if (hasWorkspaceToken()) loadSpaces();
    }, [loadSpaces]);

    async function refreshWorkspace() {
        if (activeId) await loadWorkspace(activeId);
    }

    async function handleCreateWorkspace(event) {
        event.preventDefault();
        if (!workspaceName.trim()) return;

        setBusy(true);
        try {
            const data = await createWorkspace(
                workspaceName,
                workspaceDescription
            );
            setWorkspaceName("");
            setWorkspaceDescription("");
            await loadSpaces();
            await loadWorkspace(data.workspace._id);
            setStatus("Workspace created successfully.");
        } catch (error) {
            setStatus(error.message);
        } finally {
            setBusy(false);
        }
    }

    async function handleJoinWorkspace(event) {
        event.preventDefault();
        if (!inviteCode.trim()) return;

        setBusy(true);
        try {
            await joinWorkspace(inviteCode, alias);
            setInviteCode("");
            setAlias("");
            await loadSpaces();
            setStatus("You joined the workspace successfully.");
        } catch (error) {
            setStatus(error.message);
        } finally {
            setBusy(false);
        }
    }

    async function openSession(sessionId) {
        setBusy(true);
        try {
            const data = await switchWorkspaceSession(sessionId);
            setActiveSession(data.session);
            setMessages(data.messages || []);
            setTab("chats");
        } catch (error) {
            setStatus(error.message);
        } finally {
            setBusy(false);
        }
    }

    async function createChat() {
        if (!activeId) return;
        setBusy(true);
        try {
            const data = await createWorkspaceSession(activeId, "New Workspace Chat", projectId || null, category);
            setSessions((current) => [data.session, ...current]);
            await openSession(data.session._id);
        } catch (error) {
            setStatus(error.message);
        } finally {
            setBusy(false);
        }
    }

    async function sendMessage(event) {
        event.preventDefault();
        if (!draft.trim() || !activeSession || busy) return;
        const text = draft.trim();
        setDraft("");
        setMessages((current) => [...current, { role: "user", content: text }]);
        setBusy(true);
        try {
            let streamed = false;
            await sendWorkspaceMessage(text, activeSession._id, model, (answer, modelInfo) => {
                streamed = true;
                setMessages((current) => {
                    const withoutStream = current.filter((message) => message.id !== "streaming");
                    return [...withoutStream, { id: "streaming", role: "assistant", content: answer, model: modelInfo }];
                });
            });
            if (!streamed) setStatus("The AI returned an empty response.");
        } catch (error) {
            setStatus(error.message);
        } finally {
            setBusy(false);
        }
    }

    async function handleCreateProject(event) {
        event.preventDefault();
        if (!projectName.trim() || !activeId) return;
        try {
            await createProject(activeId, projectName, "Workspace project");
            setProjectName("");
            await refreshWorkspace();
            setStatus("Project created.");
        } catch (error) {
            setStatus(error.message);
        }
    }

    async function handleAddMember(event) {
        event.preventDefault();
        if (!memberId.trim() || !activeId) return;
        try {
            await addWorkspaceMember(activeId, memberId.trim(), "", role);
            setMemberId("");
            await refreshWorkspace();
            setStatus("Member added.");
        } catch (error) {
            setStatus(error.message);
        }
    }

    async function handleRoleChange(targetUserId, nextRole) {
        try {
            await changeWorkspaceRole(activeId, targetUserId, nextRole);
            await refreshWorkspace();
            setStatus("Member role updated.");
        } catch (error) {
            setStatus(error.message);
        }
    }

    async function handleRemoveMember(targetUserId) {
        if (!window.confirm("Remove this member from the workspace?")) return;
        try {
            await removeWorkspaceMember(activeId, targetUserId);
            await refreshWorkspace();
            setStatus("Member removed.");
        } catch (error) {
            setStatus(error.message);
        }
    }

    async function loadShared() {
        try {
            const data = await getWorkspaceShares(activeId);
            setShares(data.shares || []);
            setTab("shared");
        } catch (error) {
            setStatus(error.message);
        }
    }

    async function shareCurrentSession() {
        if (!activeSession || !details) return;
        const target = window.prompt("Enter the workspace member user ID to share with:");
        if (!target) return;
        try {
            await shareWorkspaceSession(activeId, activeSession._id, [target], "view");
            setStatus("Session shared.");
            await loadShared();
        } catch (error) {
            setStatus(error.message);
        }
    }

    async function loadUsage() {
        try {
            const data = await getWorkspaceUsage(activeId);
            setUsage(data.usage || []);
            setTab("usage");
        } catch (error) {
            setStatus(error.message);
        }
    }

    async function handleLeave() {
        if (!activeId || !window.confirm("Leave this workspace?")) return;
        try {
            await leaveWorkspace(activeId);
            setActiveId("");
            setDetails(null);
            await loadSpaces();
        } catch (error) {
            setStatus(error.message);
        }
    }

    function signOut() {
        clearWorkspaceToken();
        window.location.reload();
    }

    if (!hasWorkspaceToken()) {
        return <div className="workspace-dashboard-empty"><h1>Workspace login required</h1><p>Sign in first to use team workspaces.</p></div>;
    }

    if (!activeId) {
        return (
            <div className="workspace-chooser">
                <header className="workspace-chooser-header">
                    <div>
                        <span>ENLIVONEX COLLABORATION</span>
                        <h1>Choose your workspace path</h1>
                        <p>Create a new team space, join one with an invite code, or open an existing workspace.</p>
                    </div>
                    <button type="button" onClick={signOut}>Sign out</button>
                </header>

                {status && <div className="workspace-dashboard-status" role="status">{status}</div>}

                <div className="workspace-choice-grid">
                    <form className="workspace-choice-card" onSubmit={handleCreateWorkspace}>
                        <span className="workspace-choice-icon">＋</span>
                        <span className="workspace-choice-kicker">START A TEAM</span>
                        <h2>Create new workspace</h2>
                        <p>Create a private collaboration space and become its owner.</p>
                        <input value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} placeholder="Workspace name" aria-label="Workspace name" />
                        <textarea value={workspaceDescription} onChange={(event) => setWorkspaceDescription(event.target.value)} placeholder="What will your team build?" aria-label="Workspace description" rows="3" />
                        <button type="submit" disabled={busy}>Create workspace</button>
                    </form>

                    <form className="workspace-choice-card" onSubmit={handleJoinWorkspace}>
                        <span className="workspace-choice-icon">↗</span>
                        <span className="workspace-choice-kicker">JOIN A TEAM</span>
                        <h2>Join workspace</h2>
                        <p>Enter the invite code shared by a workspace owner or admin.</p>
                        <input value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="ENL-XXXXXX" aria-label="Workspace invite code" />
                        <input value={alias} onChange={(event) => setAlias(event.target.value)} placeholder="Team alias (optional)" aria-label="Team alias" />
                        <button type="submit" disabled={busy}>Join workspace</button>
                    </form>

                    <section className="workspace-choice-card workspace-existing-card">
                        <span className="workspace-choice-icon">◈</span>
                        <span className="workspace-choice-kicker">YOUR TEAMS</span>
                        <h2>My workspaces</h2>
                        <p>Open a workspace you already belong to and continue your team&apos;s work.</p>
                        <div className="workspace-existing-list">
                            {spaces.map((item) => (
                                <button type="button" key={item.workspace._id} onClick={() => loadWorkspace(item.workspace._id)}>
                                    <strong>{item.workspace.name}</strong>
                                    <small>{item.role} · Open workspace →</small>
                                </button>
                            ))}
                            {spaces.length === 0 && <span>No workspaces yet.</span>}
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    return (
        <div className="workspace-dashboard">
            <aside className="workspace-dashboard-sidebar">
                <div>
                    <div className="workspace-dashboard-brand"><span>🚀</span><div><strong>ENLIVONEX</strong><small>Workspace console</small></div></div>
                    <label className="workspace-select-label" htmlFor="workspace-select">ACTIVE WORKSPACE</label>
                    <select id="workspace-select" value={activeId} onChange={(event) => loadWorkspace(event.target.value)}>
                        <option value="">Select workspace</option>
                        {spaces.map((item) => <option key={item.workspace._id} value={item.workspace._id}>{item.workspace.name}</option>)}
                    </select>
                    <nav className="workspace-dashboard-nav">
                        {[["overview", "▦ Overview"], ["projects", "⌘ Projects"], ["chats", "◈ Chats"], ["members", "◎ Members"]].map(([value, label]) => <button key={value} className={tab === value ? "active" : ""} type="button" onClick={() => setTab(value)}>{label}</button>)}
                        <button className={tab === "shared" ? "active" : ""} type="button" onClick={loadShared}>↗ Shared</button>
                        {isOwner && <button className={tab === "usage" ? "active" : ""} type="button" onClick={loadUsage}>◌ Usage</button>}
                    </nav>
                </div>
                <div className="workspace-dashboard-sidebar-actions"><button type="button" onClick={handleLeave}>Leave workspace</button><button type="button" onClick={signOut}>Sign out</button></div>
            </aside>

            <main className="workspace-dashboard-main">
                <header className="workspace-dashboard-header"><div><span>TEAM OPERATIONS</span><h1>{details?.workspace?.name || "Workspace"}</h1><p>{details?.workspace?.description || "A focused home for shared AI work."}</p></div><div className="workspace-role-badge">{currentRole}</div></header>
                {status && <div className="workspace-dashboard-status" role="status">{status}</div>}

                {tab === "overview" && <section className="workspace-overview-grid"><div className="workspace-stat-panel"><span>MEMBERS</span><strong>{details?.members?.length || 0}</strong><small>Active team members</small></div><div className="workspace-stat-panel"><span>PROJECTS</span><strong>{projects.length}</strong><small>Organized work areas</small></div><div className="workspace-stat-panel"><span>MY CHATS</span><strong>{sessions.length}</strong><small>Private workspace sessions</small></div><div className="workspace-quick-panel"><span className="workspace-panel-kicker">START HERE</span><h2>Turn ideas into shared work.</h2><p>Create a project, start a categorized chat, or inspect what your teammates have shared.</p><button type="button" onClick={createChat}>＋ New workspace chat</button></div></section>}

                {tab === "projects" && <section className="workspace-section"><div className="workspace-section-title"><div><span>PROJECT SPACE</span><h2>Projects and categories</h2></div><form onSubmit={handleCreateProject}><input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="New project name" aria-label="New project name" /><button type="submit">Create</button></form></div><div className="workspace-project-grid">{projects.map((project) => <div className="workspace-project-card" key={project._id}><button type="button" onClick={() => { setProjectId(project._id); setTab("chats"); }}><strong>{project.name}</strong><small>{project.description || "Workspace project"}</small><em>Open project →</em></button>{canManage && <button className="workspace-small-action" type="button" onClick={async () => { await archiveProject(project._id); await refreshWorkspace(); }}>Archive</button>}</div>)}{projects.length === 0 && <div className="workspace-empty-card">No projects yet. Create one to organize Coding, Design, Research, and General chats.</div>}</div></section>}

                {tab === "chats" && <section className="workspace-chat-layout"><aside className="workspace-chat-list"><div className="workspace-section-title"><div><span>PRIVATE BY DEFAULT</span><h2>Workspace chats</h2></div><button type="button" onClick={createChat}>＋</button></div><select className="workspace-category-select" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>{sessions.map((session) => <button className={activeSession?._id === session._id ? "workspace-chat-item active" : "workspace-chat-item"} type="button" key={session._id} onClick={() => openSession(session._id)}><strong>{session.title || "New Chat"}</strong><small>{session.category || "general"} · {session.lastMessage || "No messages yet"}</small></button>)}{sessions.length === 0 && <p className="workspace-muted">Create your first workspace chat.</p>}</aside><div className="workspace-chat-panel">{activeSession ? <><div className="workspace-chat-toolbar"><div><span>{activeSession.category || "general"}</span><h2>{activeSession.title}</h2></div><div><select value={model} onChange={(event) => setModel(event.target.value)}><option value="gemma3:4b">Gemma 3 4B</option><option value="qwen2.5:3b">Qwen 2.5 3B</option></select><button type="button" onClick={shareCurrentSession}>Share</button></div></div><div className="workspace-message-list">{messages.map((message, index) => <div className={message.role === "user" ? "workspace-message user" : "workspace-message"} key={message._id || message.id || index}><span>{message.role === "user" ? "You" : "Enlivonex AI"}</span><p>{message.content}</p></div>)}</div><form className="workspace-chat-input" onSubmit={sendMessage}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask your workspace AI..." aria-label="Workspace message" /><button type="submit" disabled={busy}>Send</button></form></> : <div className="workspace-chat-placeholder"><span>◈</span><h2>Select or create a workspace chat</h2><p>Your private workspace conversations will appear here.</p><button type="button" onClick={createChat}>Create chat</button></div>}</div></section>}

                {tab === "members" && <section className="workspace-section"><div className="workspace-section-title"><div><span>TEAM DIRECTORY</span><h2>Members</h2></div></div>{canManage && <form className="workspace-member-form" onSubmit={handleAddMember}><input value={memberId} onChange={(event) => setMemberId(event.target.value)} placeholder="Target user ID" aria-label="Target user ID" /><select value={role} onChange={(event) => setRole(event.target.value)}><option value="member">Member</option><option value="admin">Admin</option></select><button type="submit">Add member</button></form>}<div className="workspace-member-grid">{details?.members?.map((member) => <div className="workspace-member-card" key={`${member.userId}-${member.role}`}><span>{member.username.slice(0, 1).toUpperCase()}</span><div><strong>{member.alias || member.username}</strong><small>{member.email || "Workspace member"}</small></div><em>{member.role}</em>{isOwner && member.role !== "owner" && <><select value={member.role} onChange={(event) => handleRoleChange(member.userId, event.target.value)}><option value="member">Member</option><option value="admin">Admin</option></select><button className="workspace-small-action" type="button" onClick={() => handleRemoveMember(member.userId)}>Remove</button></>}</div>)}</div></section>}

                {tab === "shared" && <section className="workspace-section"><div className="workspace-section-title"><div><span>TEAM EXCHANGE</span><h2>Shared with me</h2></div></div><div className="workspace-share-list">{shares.map((share) => <div className="workspace-share-card" key={share._id}><strong>{share.resourceType}</strong><span>{share.permission} permission</span><small>Shared resource {share.resourceId}</small></div>)}{shares.length === 0 && <div className="workspace-empty-card">No shared sessions or messages yet.</div>}</div></section>}

                {tab === "usage" && <section className="workspace-section"><div className="workspace-section-title"><div><span>OWNER VIEW</span><h2>Estimated usage</h2></div></div><div className="workspace-usage-list">{usage.map((entry, index) => <div className="workspace-usage-row" key={`${entry._id?.userId}-${entry._id?.model}-${index}`}><strong>{entry._id?.model}</strong><span>{entry.requests} requests</span><span>{entry.totalTokens} estimated tokens</span></div>)}{usage.length === 0 && <div className="workspace-empty-card">No workspace usage recorded yet.</div>}</div></section>}
            </main>
        </div>
    );
}

export default WorkspaceDashboard;

import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import "./WorkspaceDashboard.css";

import {
    addWorkspaceMember,
    archiveProject,
    changeWorkspaceRole,
    clearWorkspaceToken,
    createProject,
    createWorkspace,
    createWorkspaceSession,
    deleteWorkspace,
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
    searchWorkspaceUsers,
    sendWorkspaceMessage,
    shareWorkspaceSession,
    switchWorkspaceSession
} from "../services/workspaceApi";

import {
    CODE_ASSISTANT_MODELS,
    sendCodeAssistant
} from "../services/api";


const categories = [
    "general",
    "coding",
    "design",
    "research",
    "planning",
    "debugging"
];


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

    const [tab, setTab] =
        useState("overview");

    const [draft, setDraft] =
        useState("");

    const [model, setModel] =
        useState("gemma3:4b");

    const [category, setCategory] =
        useState("general");

    const [projectId, setProjectId] =
        useState("");

    const [projectName, setProjectName] =
        useState("");

    const [memberId, setMemberId] =
        useState("");

    const [memberMatches, setMemberMatches] =
        useState([]);

    const [selectedMemberIds, setSelectedMemberIds] =
        useState([]);

    const [sharePickerOpen, setSharePickerOpen] =
        useState(false);

    const [shareTargets, setShareTargets] =
        useState([]);

    const [workspaceCode, setWorkspaceCode] =
        useState("");

    const [workspaceCodeInstruction, setWorkspaceCodeInstruction] =
        useState("");

    const [workspaceCodeResponse, setWorkspaceCodeResponse] =
        useState("");

    const [workspaceCodeModel, setWorkspaceCodeModel] =
        useState(CODE_ASSISTANT_MODELS.QWEN_7B.id);

    const [workspaceCodeSessionId, setWorkspaceCodeSessionId] =
        useState("");

    const [role, setRole] =
        useState("member");

    const [status, setStatus] =
        useState("");

    const [busy, setBusy] =
        useState(false);

    const [workspaceName, setWorkspaceName] =
        useState("");

    const [workspaceDescription, setWorkspaceDescription] =
        useState("");

    const [inviteCode, setInviteCode] =
        useState("");

    const [alias, setAlias] =
        useState("");


    /* ==================================
       MEMBERSHIP
    ================================== */

    const activeMembership =
        useMemo(
            () =>
                spaces.find(
                    (item) =>
                        item.workspace?._id ===
                        activeId
                ),
            [
                spaces,
                activeId
            ]
        );


    const currentRole =
        activeMembership?.role ||
        "member";


    const canManage =
        currentRole === "owner" ||
        currentRole === "admin";


    const isOwner =
        currentRole === "owner";


    /* ==================================
       LOAD WORKSPACE
    ================================== */

    const loadWorkspace =
        useCallback(
            async (workspaceId) => {
                setBusy(true);
                setStatus("");
                setDetails(null);
                setMessages([]);
                setActiveSession(null);

                try {
                    const [
                        workspaceData,
                        projectData,
                        sessionData
                    ] =
                        await Promise.all([
                            getWorkspaceDetails(
                                workspaceId
                            ),

                            getProjects(
                                workspaceId
                            ),

                            getMyWorkspaceSessions(
                                workspaceId
                            )
                        ]);


                    setDetails(
                        workspaceData
                    );

                    setProjects(
                        projectData.projects ||
                        []
                    );

                    setSessions(
                        sessionData.sessions ||
                        []
                    );

                    setActiveId(
                        workspaceId
                    );

                } catch (error) {
                    setStatus(
                        error.message
                    );

                } finally {
                    setBusy(false);
                }
            },
            []
        );


    /* ==================================
       LOAD WORKSPACES
    ================================== */

    const loadSpaces =
        useCallback(
            async () => {
                try {
                    const data =
                        await getWorkspaces();

                    const nextSpaces =
                        data.workspaces ||
                        [];

                    setSpaces(
                        nextSpaces
                    );


                    const nextId =
                        activeId ||
                        nextSpaces[0]
                            ?.workspace?._id;


                    if (nextId) {
                        await loadWorkspace(
                            nextId
                        );
                    }

                } catch (error) {
                    setStatus(
                        error.message
                    );
                }
            },
            [
                activeId,
                loadWorkspace
            ]
        );


    useEffect(() => {
        if (hasWorkspaceToken()) {
            loadSpaces();
        }
    }, [loadSpaces]);


    /* ==================================
       REFRESH WORKSPACE
    ================================== */

    async function refreshWorkspace() {
        if (activeId) {
            await loadWorkspace(
                activeId
            );
        }
    }


    /* ==================================
       CREATE WORKSPACE
    ================================== */

    async function handleCreateWorkspace(
        event
    ) {
        event.preventDefault();


        if (!workspaceName.trim()) {
            return;
        }


        setBusy(true);


        try {
            const data =
                await createWorkspace(
                    workspaceName,
                    workspaceDescription
                );


            setWorkspaceName("");
            setWorkspaceDescription("");


            await loadSpaces();


            await loadWorkspace(
                data.workspace._id
            );


            setStatus(
                "Workspace created successfully."
            );

        } catch (error) {
            setStatus(
                error.message
            );

        } finally {
            setBusy(false);
        }
    }


    /* ==================================
       JOIN WORKSPACE
    ================================== */

    async function handleJoinWorkspace(
        event
    ) {
        event.preventDefault();


        if (!inviteCode.trim()) {
            return;
        }


        setBusy(true);


        try {
            await joinWorkspace(
                inviteCode,
                alias
            );


            setInviteCode("");
            setAlias("");


            await loadSpaces();


            setStatus(
                "You joined the workspace successfully."
            );

        } catch (error) {
            setStatus(
                error.message
            );

        } finally {
            setBusy(false);
        }
    }


    /* ==================================
       OPEN SESSION
    ================================== */

    async function openSession(
        sessionId
    ) {
        setBusy(true);


        try {
            const data =
                await switchWorkspaceSession(
                    sessionId
                );


            setActiveSession(
                data.session
            );

            setMessages(
                data.messages ||
                []
            );

            setTab("chats");

        } catch (error) {
            setStatus(
                error.message
            );

        } finally {
            setBusy(false);
        }
    }


    /* ==================================
       CREATE CHAT
    ================================== */

    async function createChat() {
        if (!activeId) {
            return;
        }


        setBusy(true);


        try {
            const data =
                await createWorkspaceSession(
                    activeId,
                    "New Workspace Chat",
                    projectId || null,
                    category
                );


            setSessions(
                (current) => [
                    data.session,
                    ...current
                ]
            );


            await openSession(
                data.session._id
            );

        } catch (error) {
            setStatus(
                error.message
            );

        } finally {
            setBusy(false);
        }
    }


    /* ==================================
       SEND WORKSPACE MESSAGE
    ================================== */

    async function sendMessage(
        event
    ) {
        event.preventDefault();


        if (
            !draft.trim() ||
            !activeSession ||
            busy
        ) {
            return;
        }


        const text =
            draft.trim();


        setDraft("");


        setMessages(
            (current) => [
                ...current,
                {
                    role: "user",
                    content: text
                }
            ]
        );


        setBusy(true);


        try {
            let streamed = false;


            await sendWorkspaceMessage(
                text,
                activeSession._id,
                model,
                (
                    answer,
                    modelInfo
                ) => {
                    streamed = true;


                    setMessages(
                        (current) => {
                            const withoutStream =
                                current.filter(
                                    (message) =>
                                        message.id !==
                                        "streaming"
                                );


                            return [
                                ...withoutStream,
                                {
                                    id: "streaming",
                                    role: "assistant",
                                    content: answer,
                                    model: modelInfo
                                }
                            ];
                        }
                    );
                }
            );


            if (!streamed) {
                setStatus(
                    "The AI returned an empty response."
                );
            }

        } catch (error) {
            setStatus(
                error.message
            );

        } finally {
            setBusy(false);
        }
    }


    /* ==================================
       CREATE PROJECT
    ================================== */

    async function handleCreateProject(
        event
    ) {
        event.preventDefault();


        if (
            !projectName.trim() ||
            !activeId
        ) {
            return;
        }


        try {
            await createProject(
                activeId,
                projectName,
                "Workspace project"
            );


            setProjectName("");


            await refreshWorkspace();


            setStatus(
                "Project created."
            );

        } catch (error) {
            setStatus(
                error.message
            );
        }
    }


    /* ==================================
       ADD MEMBER
    ================================== */

    async function handleAddMember(
        event
    ) {
        event.preventDefault();


        const identifiers =
            selectedMemberIds.length
                ? selectedMemberIds
                : memberId.trim()
                    ? [memberId.trim()]
                    : [];


        if (
            !identifiers.length ||
            !activeId
        ) {
            return;
        }


        try {
            await Promise.all(
                identifiers.map(
                    (identifier) =>
                        addWorkspaceMember(
                            activeId,
                            identifier,
                            "",
                            role
                        )
                )
            );


            setMemberId("");
            setMemberMatches([]);
            setSelectedMemberIds([]);


            await refreshWorkspace();


            setStatus(
                "Selected member(s) added."
            );

        } catch (error) {
            setStatus(
                error.message
            );
        }
    }


    /* ==================================
       FIND MEMBERS
    ================================== */

    async function findMembers() {
        if (
            !memberId.trim() ||
            !activeId
        ) {
            return;
        }


        try {
            const data =
                await searchWorkspaceUsers(
                    activeId,
                    memberId.trim()
                );


            setMemberMatches(
                data.users ||
                []
            );


            setSelectedMemberIds([]);


            setStatus(
                data.users?.length
                    ? "Select the user(s) to add."
                    : "No matching users found."
            );

        } catch (error) {
            setStatus(
                error.message
            );
        }
    }


    /* ==================================
       TOGGLE MEMBER SELECTION
    ================================== */

    function toggleMemberSelection(
        userId
    ) {
        setSelectedMemberIds(
            (current) =>
                current.includes(userId)
                    ? current.filter(
                        (id) =>
                            id !== userId
                    )
                    : [
                        ...current,
                        userId
                    ]
        );
    }


    /* ==================================
       CHANGE MEMBER ROLE
    ================================== */

    async function handleRoleChange(
        targetUserId,
        nextRole
    ) {
        try {
            await changeWorkspaceRole(
                activeId,
                targetUserId,
                nextRole
            );


            await refreshWorkspace();


            setStatus(
                "Member role updated."
            );

        } catch (error) {
            setStatus(
                error.message
            );
        }
    }


    /* ==================================
       REMOVE MEMBER
    ================================== */

    async function handleRemoveMember(
        targetUserId
    ) {
        if (
            !window.confirm(
                "Remove this member from the workspace?"
            )
        ) {
            return;
        }


        try {
            await removeWorkspaceMember(
                activeId,
                targetUserId
            );


            await refreshWorkspace();


            setStatus(
                "Member removed."
            );

        } catch (error) {
            setStatus(
                error.message
            );
        }
    }


    /* ==================================
       LOAD SHARED
    ================================== */

    async function loadShared() {
        try {
            const data =
                await getWorkspaceShares(
                    activeId
                );


            setShares(
                data.shares ||
                []
            );


            setTab("shared");

        } catch (error) {
            setStatus(
                error.message
            );
        }
    }


    /* ==================================
       SHARE CURRENT SESSION
    ================================== */

    async function shareCurrentSession() {
        if (
            !activeSession ||
            !details
        ) {
            return;
        }


        if (!shareTargets.length) {
            setStatus(
                "Select at least one workspace member to share with."
            );

            return;
        }


        try {
            await shareWorkspaceSession(
                activeId,
                activeSession._id,
                shareTargets,
                "view"
            );


            setShareTargets([]);
            setSharePickerOpen(false);


            setStatus(
                "Session shared."
            );


            await loadShared();

        } catch (error) {
            setStatus(
                error.message
            );
        }
    }


    /* ==================================
       LOAD USAGE
    ================================== */

    async function loadUsage() {
        try {
            const data =
                await getWorkspaceUsage(
                    activeId
                );


            setUsage(
                data.usage ||
                []
            );


            setTab("usage");

        } catch (error) {
            setStatus(
                error.message
            );
        }
    }


    /* ==================================
       LEAVE WORKSPACE
    ================================== */

    async function handleLeave() {
        if (
            !activeId ||
            !window.confirm(
                "Leave this workspace?"
            )
        ) {
            return;
        }


        try {
            await leaveWorkspace(
                activeId
            );


            setActiveId("");
            setDetails(null);


            await loadSpaces();

        } catch (error) {
            setStatus(
                error.message
            );
        }
    }


    /* ==================================
       TOGGLE SHARE TARGET
    ================================== */

    function toggleShareTarget(
        userId
    ) {
        setShareTargets(
            (current) =>
                current.includes(userId)
                    ? current.filter(
                        (id) =>
                            id !== userId
                    )
                    : [
                        ...current,
                        userId
                    ]
        );
    }


    /* ==================================
       WORKSPACE CODE ASSISTANT
    ================================== */

    async function runWorkspaceCodeAssistant() {
        if (
            (
                !workspaceCode.trim() &&
                !workspaceCodeInstruction.trim()
            ) ||
            !activeId ||
            busy
        ) {
            return;
        }


        setBusy(true);
        setWorkspaceCodeResponse("");


        try {
            let sessionId =
                workspaceCodeSessionId;


            if (!sessionId) {
                const data =
                    await createWorkspaceSession(
                        activeId,
                        "Workspace Code Assistant",
                        projectId || null,
                        "coding"
                    );


                sessionId =
                    data.session._id;


                setWorkspaceCodeSessionId(
                    sessionId
                );


                setSessions(
                    (current) => [
                        data.session,
                        ...current
                    ]
                );
            }


            const prompt =
                `User Instruction:
${workspaceCodeInstruction.trim() ||
                    "Analyze the provided code and identify errors or improvements."}

Code:
${workspaceCode.trim() ||
                    "No code was provided. Answer the coding request directly."}`;


            const result =
                await sendCodeAssistant(
                    prompt,
                    (answer) =>
                        setWorkspaceCodeResponse(
                            answer
                        ),
                    workspaceCodeModel,
                    sessionId
                );


            setWorkspaceCodeResponse(
                result.answer ||
                ""
            );


            setStatus(
                "Code Assistant response saved to this workspace session."
            );

        } catch (error) {
            setStatus(
                error.message
            );

        } finally {
            setBusy(false);
        }
    }


    /* ==================================
       DELETE WORKSPACE
    ================================== */

    async function handleDeleteWorkspace() {
        const currentWorkspaceName =
            details?.workspace?.name;


        if (
            !activeId ||
            !currentWorkspaceName
        ) {
            return;
        }


        const confirmation =
            window.prompt(
                `This permanently deletes "${currentWorkspaceName}" and its workspace-only projects, chats, shares, usage, and memberships.

Type the workspace name to confirm:`
            );


        if (
            confirmation !==
            currentWorkspaceName
        ) {
            if (
                confirmation !==
                null
            ) {
                setStatus(
                    "Workspace deletion cancelled: the name did not match."
                );
            }


            return;
        }


        setBusy(true);


        try {
            await deleteWorkspace(
                activeId
            );


            const data =
                await getWorkspaces();


            const remainingSpaces =
                data.workspaces ||
                [];


            const nextWorkspaceId =
                remainingSpaces[0]
                    ?.workspace?._id ||
                "";


            setSpaces(
                remainingSpaces
            );

            setActiveId("");
            setDetails(null);
            setProjects([]);
            setSessions([]);
            setShares([]);
            setUsage([]);
            setMessages([]);
            setActiveSession(null);


            if (nextWorkspaceId) {
                await loadWorkspace(
                    nextWorkspaceId
                );
            }


            setStatus(
                "Workspace deleted successfully."
            );

        } catch (error) {
            setStatus(
                error.message
            );

        } finally {
            setBusy(false);
        }
    }


    /* ==================================
       SIGN OUT
    ================================== */

    function signOut() {
        clearWorkspaceToken();

        window.location.reload();
    }


    /* ==================================
       LOGIN REQUIRED
    ================================== */

    if (!hasWorkspaceToken()) {
        return (
            <div className="workspace-dashboard-empty">
                <h1>
                    Workspace login required
                </h1>

                <p>
                    Sign in first to use team workspaces.
                </p>
            </div>
        );
    }


    /* ==================================
       WORKSPACE CHOOSER
    ================================== */

    if (!activeId) {
        return (
            <div className="workspace-chooser">

                <header className="workspace-chooser-header">

                    <div>
                        <span>
                            ENLIVONEX COLLABORATION
                        </span>

                        <h1>
                            Choose your workspace path
                        </h1>

                        <p>
                            Create a new team space,
                            join one with an invite
                            code, or open an existing
                            workspace.
                        </p>
                    </div>


                    <button
                        type="button"
                        onClick={signOut}
                    >
                        Sign out
                    </button>

                </header>


                {status && (
                    <div
                        className="workspace-dashboard-status"
                        role="status"
                    >
                        {status}
                    </div>
                )}


                <div className="workspace-choice-grid">

                    <form
                        className="workspace-choice-card"
                        onSubmit={
                            handleCreateWorkspace
                        }
                    >

                        <span className="workspace-choice-icon">
                            ＋
                        </span>

                        <span className="workspace-choice-kicker">
                            START A TEAM
                        </span>

                        <h2>
                            Create new workspace
                        </h2>

                        <p>
                            Create a private
                            collaboration space
                            and become its owner.
                        </p>


                        <input
                            value={workspaceName}
                            onChange={
                                (event) =>
                                    setWorkspaceName(
                                        event.target.value
                                    )
                            }
                            placeholder="Workspace name"
                            aria-label="Workspace name"
                        />


                        <textarea
                            value={
                                workspaceDescription
                            }
                            onChange={
                                (event) =>
                                    setWorkspaceDescription(
                                        event.target.value
                                    )
                            }
                            placeholder="What will your team build?"
                            aria-label="Workspace description"
                            rows="3"
                        />


                        <button
                            type="submit"
                            disabled={busy}
                        >
                            Create workspace
                        </button>

                    </form>


                    <form
                        className="workspace-choice-card"
                        onSubmit={
                            handleJoinWorkspace
                        }
                    >

                        <span className="workspace-choice-icon">
                            ↗
                        </span>

                        <span className="workspace-choice-kicker">
                            JOIN A TEAM
                        </span>

                        <h2>
                            Join workspace
                        </h2>

                        <p>
                            Enter the invite code
                            shared by a workspace
                            owner or admin.
                        </p>


                        <input
                            value={inviteCode}
                            onChange={
                                (event) =>
                                    setInviteCode(
                                        event.target.value
                                    )
                            }
                            placeholder="ENL-XXXXXX"
                            aria-label="Workspace invite code"
                        />


                        <input
                            value={alias}
                            onChange={
                                (event) =>
                                    setAlias(
                                        event.target.value
                                    )
                            }
                            placeholder="Team alias (optional)"
                            aria-label="Team alias"
                        />


                        <button
                            type="submit"
                            disabled={busy}
                        >
                            Join workspace
                        </button>

                    </form>


                    <section className="workspace-choice-card workspace-existing-card">

                        <span className="workspace-choice-icon">
                            ◈
                        </span>

                        <span className="workspace-choice-kicker">
                            YOUR TEAMS
                        </span>

                        <h2>
                            My workspaces
                        </h2>

                        <p>
                            Open a workspace you
                            already belong to and
                            continue your team's work.
                        </p>


                        <div className="workspace-existing-list">

                            {spaces.map(
                                (item) => (
                                    <button
                                        type="button"
                                        key={
                                            item.workspace._id
                                        }
                                        onClick={() =>
                                            loadWorkspace(
                                                item.workspace._id
                                            )
                                        }
                                    >
                                        <strong>
                                            {
                                                item.workspace.name
                                            }
                                        </strong>

                                        <small>
                                            {item.role}
                                            {" · "}
                                            Open workspace →
                                        </small>
                                    </button>
                                )
                            )}


                            {spaces.length === 0 && (
                                <span>
                                    No workspaces yet.
                                </span>
                            )}

                        </div>

                    </section>

                </div>

            </div>
        );
    }


    /* ==================================
       MAIN DASHBOARD
    ================================== */

    return (
        <div className="workspace-dashboard">

            <aside className="workspace-dashboard-sidebar">

                <div>

                    <div className="workspace-dashboard-brand">

                        <span>
                            🚀
                        </span>

                        <div>
                            <strong>
                                ENLIVONEX
                            </strong>

                            <small>
                                Workspace console
                            </small>
                        </div>

                    </div>


                    <label
                        className="workspace-select-label"
                        htmlFor="workspace-select"
                    >
                        ACTIVE WORKSPACE
                    </label>


                    <select
                        id="workspace-select"
                        value={activeId}
                        onChange={
                            (event) =>
                                loadWorkspace(
                                    event.target.value
                                )
                        }
                    >

                        <option value="">
                            Select workspace
                        </option>


                        {spaces.map(
                            (item) => (
                                <option
                                    key={
                                        item.workspace._id
                                    }
                                    value={
                                        item.workspace._id
                                    }
                                >
                                    {
                                        item.workspace.name
                                    }
                                </option>
                            )
                        )}

                    </select>


                    <nav className="workspace-dashboard-nav">

                        {[
                            [
                                "overview",
                                "▦ Overview"
                            ],
                            [
                                "projects",
                                "⌘ Projects"
                            ],
                            [
                                "chats",
                                "◈ Chats"
                            ],
                            [
                                "code",
                                "⌨ Code Assistant"
                            ],
                            [
                                "members",
                                "◎ Members"
                            ]
                        ].map(
                            ([value, label]) => (
                                <button
                                    key={value}
                                    className={
                                        tab === value
                                            ? "active"
                                            : ""
                                    }
                                    type="button"
                                    onClick={() =>
                                        setTab(value)
                                    }
                                >
                                    {label}
                                </button>
                            )
                        )}


                        <button
                            className={
                                tab === "shared"
                                    ? "active"
                                    : ""
                            }
                            type="button"
                            onClick={loadShared}
                        >
                            ↗ Shared
                        </button>


                        {isOwner && (
                            <button
                                className={
                                    tab === "usage"
                                        ? "active"
                                        : ""
                                }
                                type="button"
                                onClick={loadUsage}
                            >
                                ◌ Usage
                            </button>
                        )}

                    </nav>

                </div>


                <div className="workspace-dashboard-sidebar-actions">

                    <button
                        type="button"
                        onClick={handleLeave}
                    >
                        Leave workspace
                    </button>


                    {isOwner && (
                        <button
                            className="workspace-danger-action"
                            type="button"
                            onClick={
                                handleDeleteWorkspace
                            }
                            disabled={busy}
                        >
                            Delete workspace
                        </button>
                    )}


                    <button
                        type="button"
                        onClick={signOut}
                    >
                        Sign out
                    </button>

                </div>

            </aside>


            <main className="workspace-dashboard-main">

                <header className="workspace-dashboard-header">

                    <div>

                        <span>
                            TEAM OPERATIONS
                        </span>

                        <h1>
                            {
                                details?.workspace?.name ||
                                "Workspace"
                            }
                        </h1>

                        <p>
                            {
                                details?.workspace?.description ||
                                "A focused home for shared AI work."
                            }
                        </p>

                    </div>


                    <div className="workspace-role-badge">
                        {currentRole}
                    </div>

                </header>


                {status && (
                    <div
                        className="workspace-dashboard-status"
                        role="status"
                    >
                        {status}
                    </div>
                )}


                {/* ==================================
                    OVERVIEW
                ================================== */}

                {tab === "overview" && (
                    <section className="workspace-overview-grid">

                        <div className="workspace-stat-panel">
                            <span>
                                MEMBERS
                            </span>

                            <strong>
                                {
                                    details?.members?.length ||
                                    0
                                }
                            </strong>

                            <small>
                                Active team members
                            </small>
                        </div>


                        <div className="workspace-stat-panel">
                            <span>
                                PROJECTS
                            </span>

                            <strong>
                                {projects.length}
                            </strong>

                            <small>
                                Organized work areas
                            </small>
                        </div>


                        <div className="workspace-stat-panel">
                            <span>
                                MY CHATS
                            </span>

                            <strong>
                                {sessions.length}
                            </strong>

                            <small>
                                Private workspace sessions
                            </small>
                        </div>


                        <div className="workspace-quick-panel">

                            <span className="workspace-panel-kicker">
                                START HERE
                            </span>

                            <h2>
                                Turn ideas into shared work.
                            </h2>

                            <p>
                                Create a project,
                                start a categorized
                                chat, or inspect what
                                your teammates have shared.
                            </p>

                            <button
                                type="button"
                                onClick={createChat}
                            >
                                ＋ New workspace chat
                            </button>

                        </div>

                    </section>
                )}


                {/* ==================================
                    PROJECTS
                ================================== */}

                {tab === "projects" && (
                    <section className="workspace-section">

                        <div className="workspace-section-title">

                            <div>
                                <span>
                                    PROJECT SPACE
                                </span>

                                <h2>
                                    Projects and categories
                                </h2>
                            </div>


                            <form
                                onSubmit={
                                    handleCreateProject
                                }
                            >

                                <input
                                    value={projectName}
                                    onChange={
                                        (event) =>
                                            setProjectName(
                                                event.target.value
                                            )
                                    }
                                    placeholder="New project name"
                                    aria-label="New project name"
                                />

                                <button type="submit">
                                    Create
                                </button>

                            </form>

                        </div>


                        <div className="workspace-project-grid">

                            {projects.map(
                                (project) => (
                                    <div
                                        className="workspace-project-card"
                                        key={
                                            project._id
                                        }
                                    >

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProjectId(
                                                    project._id
                                                );

                                                setTab(
                                                    "chats"
                                                );
                                            }}
                                        >

                                            <strong>
                                                {
                                                    project.name
                                                }
                                            </strong>

                                            <small>
                                                {
                                                    project.description ||
                                                    "Workspace project"
                                                }
                                            </small>

                                            <em>
                                                Open project →
                                            </em>

                                        </button>


                                        {canManage && (
                                            <button
                                                className="workspace-small-action"
                                                type="button"
                                                onClick={
                                                    async () => {
                                                        await archiveProject(
                                                            project._id
                                                        );

                                                        await refreshWorkspace();
                                                    }
                                                }
                                            >
                                                Archive
                                            </button>
                                        )}

                                    </div>
                                )
                            )}


                            {projects.length === 0 && (
                                <div className="workspace-empty-card">
                                    No projects yet.
                                    Create one to organize
                                    Coding, Design, Research,
                                    and General chats.
                                </div>
                            )}

                        </div>

                    </section>
                )}


                {/* ==================================
                    CHATS
                ================================== */}

                {tab === "chats" && (
                    <section className="workspace-chat-layout">

                        <aside className="workspace-chat-list">

                            <div className="workspace-section-title">

                                <div>
                                    <span>
                                        PRIVATE BY DEFAULT
                                    </span>

                                    <h2>
                                        Workspace chats
                                    </h2>
                                </div>


                                <button
                                    type="button"
                                    onClick={createChat}
                                >
                                    ＋
                                </button>

                            </div>


                            <select
                                className="workspace-category-select"
                                value={category}
                                onChange={
                                    (event) =>
                                        setCategory(
                                            event.target.value
                                        )
                                }
                            >

                                {categories.map(
                                    (item) => (
                                        <option
                                            key={item}
                                            value={item}
                                        >
                                            {item}
                                        </option>
                                    )
                                )}

                            </select>


                            {sessions.map(
                                (session) => (
                                    <button
                                        className={
                                            activeSession?._id ===
                                            session._id
                                                ? "workspace-chat-item active"
                                                : "workspace-chat-item"
                                        }
                                        type="button"
                                        key={
                                            session._id
                                        }
                                        onClick={() =>
                                            openSession(
                                                session._id
                                            )
                                        }
                                    >

                                        <strong>
                                            {
                                                session.title ||
                                                "New Chat"
                                            }
                                        </strong>

                                        <small>
                                            {
                                                session.category ||
                                                "general"
                                            }

                                            {" · "}

                                            {
                                                session.lastMessage ||
                                                "No messages yet"
                                            }
                                        </small>

                                    </button>
                                )
                            )}


                            {sessions.length === 0 && (
                                <p className="workspace-muted">
                                    Create your first
                                    workspace chat.
                                </p>
                            )}

                        </aside>


                        <div className="workspace-chat-panel">

                            {activeSession ? (
                                <>

                                    <div className="workspace-chat-toolbar">

                                        <div>
                                            <span>
                                                {
                                                    activeSession.category ||
                                                    "general"
                                                }
                                            </span>

                                            <h2>
                                                {
                                                    activeSession.title
                                                }
                                            </h2>
                                        </div>


                                        <div>

                                            <select
                                                value={model}
                                                onChange={
                                                    (event) =>
                                                        setModel(
                                                            event.target.value
                                                        )
                                                }
                                            >

                                                <option value="gemma3:4b">
                                                    Gemma 3 4B
                                                </option>

                                                <option value="qwen2.5:3b">
                                                    Qwen 2.5 3B
                                                </option>

                                            </select>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSharePickerOpen(
                                                        (open) =>
                                                            !open
                                                    )
                                                }
                                            >
                                                Share
                                            </button>

                                        </div>

                                    </div>


                                    {sharePickerOpen && (
                                        <div className="workspace-share-picker">

                                            <strong>
                                                Share with members
                                            </strong>


                                            {details?.members
                                                ?.filter(
                                                    (member) =>
                                                        member.userId !==
                                                        activeSession.userId
                                                )
                                                .map(
                                                    (member) => (
                                                        <label
                                                            key={
                                                                member.userId
                                                            }
                                                        >

                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    shareTargets.includes(
                                                                        member.userId
                                                                    )
                                                                }
                                                                onChange={() =>
                                                                    toggleShareTarget(
                                                                        member.userId
                                                                    )
                                                                }
                                                            />

                                                            {
                                                                member.alias ||
                                                                member.username
                                                            }

                                                        </label>
                                                    )
                                                )}


                                            <button
                                                type="button"
                                                onClick={
                                                    shareCurrentSession
                                                }
                                            >
                                                Share selected
                                            </button>

                                        </div>
                                    )}


                                    <div className="workspace-message-list">

                                        {messages.map(
                                            (
                                                message,
                                                index
                                            ) => (
                                                <div
                                                    className={
                                                        message.role ===
                                                        "user"
                                                            ? "workspace-message user"
                                                            : "workspace-message"
                                                    }
                                                    key={
                                                        message._id ||
                                                        message.id ||
                                                        index
                                                    }
                                                >

                                                    <span>
                                                        {
                                                            message.role ===
                                                            "user"
                                                                ? "You"
                                                                : "Enlivonex AI"
                                                        }
                                                    </span>

                                                    <p>
                                                        {
                                                            message.content
                                                        }
                                                    </p>

                                                </div>
                                            )
                                        )}

                                    </div>


                                    <form
                                        className="workspace-chat-input"
                                        onSubmit={
                                            sendMessage
                                        }
                                    >

                                        <input
                                            value={draft}
                                            onChange={
                                                (event) =>
                                                    setDraft(
                                                        event.target.value
                                                    )
                                            }
                                            placeholder="Ask your workspace AI..."
                                            aria-label="Workspace message"
                                        />

                                        <button
                                            type="submit"
                                            disabled={busy}
                                        >
                                            Send
                                        </button>

                                    </form>

                                </>
                            ) : (

                                <div className="workspace-chat-placeholder">

                                    <span>
                                        ◈
                                    </span>

                                    <h2>
                                        Select or create
                                        a workspace chat
                                    </h2>

                                    <p>
                                        Your private workspace
                                        conversations will
                                        appear here.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={createChat}
                                    >
                                        Create chat
                                    </button>

                                </div>

                            )}

                        </div>

                    </section>
                )}


                {/* ==================================
                    CODE ASSISTANT
                ================================== */}

                {tab === "code" && (
                    <section className="workspace-section">

                        <div className="workspace-section-title">

                            <div>
                                <span>
                                    TEAM CODING
                                </span>

                                <h2>
                                    Workspace Code Assistant
                                </h2>
                            </div>

                        </div>


                        <div className="workspace-code-layout">

                            <div className="workspace-code-panel">

                                <label>
                                    Code Assistant model
                                </label>


                                <select
                                    value={
                                        workspaceCodeModel
                                    }
                                    onChange={
                                        (event) =>
                                            setWorkspaceCodeModel(
                                                event.target.value
                                            )
                                    }
                                >

                                    <option
                                        value={
                                            CODE_ASSISTANT_MODELS
                                                .QWEN_7B
                                                .id
                                        }
                                    >
                                        {
                                            CODE_ASSISTANT_MODELS
                                                .QWEN_7B
                                                .name
                                        }
                                    </option>


                                    <option
                                        value={
                                            CODE_ASSISTANT_MODELS
                                                .QWEN_14B
                                                .id
                                        }
                                    >
                                        {
                                            CODE_ASSISTANT_MODELS
                                                .QWEN_14B
                                                .name
                                        }
                                    </option>

                                </select>


                                <label>
                                    Instruction
                                </label>


                                <textarea
                                    value={
                                        workspaceCodeInstruction
                                    }
                                    onChange={
                                        (event) =>
                                            setWorkspaceCodeInstruction(
                                                event.target.value
                                            )
                                    }
                                    placeholder="What should the Code Assistant analyze or change?"
                                    rows="5"
                                />


                                <label>
                                    Code
                                </label>


                                <textarea
                                    value={
                                        workspaceCode
                                    }
                                    onChange={
                                        (event) =>
                                            setWorkspaceCode(
                                                event.target.value
                                            )
                                    }
                                    placeholder="Paste your code here..."
                                    rows="14"
                                />


                                <button
                                    type="button"
                                    onClick={
                                        runWorkspaceCodeAssistant
                                    }
                                    disabled={busy}
                                >
                                    {busy
                                        ? "Analyzing..."
                                        : "Run Code Assistant"}
                                </button>

                            </div>


                            <div className="workspace-code-response">

                                <div className="workspace-code-response-header">

                                    <span>
                                        AI RESPONSE
                                    </span>

                                    <small>
                                        Workspace session
                                    </small>

                                </div>


                                <pre>
                                    {
                                        workspaceCodeResponse ||
                                        "Code Assistant response will appear here."
                                    }
                                </pre>

                            </div>

                        </div>

                    </section>
                )}


                {/* ==================================
                    MEMBERS
                ================================== */}

                {tab === "members" && (
                    <section className="workspace-section">

                        <div className="workspace-section-title">

                            <div>
                                <span>
                                    TEAM DIRECTORY
                                </span>

                                <h2>
                                    Members
                                </h2>
                            </div>

                        </div>


                        {canManage && (
                            <>
                                <form
                                    className="workspace-member-form"
                                    onSubmit={
                                        handleAddMember
                                    }
                                >

                                    <input
                                        value={memberId}
                                        onChange={
                                            (event) =>
                                                setMemberId(
                                                    event.target.value
                                                )
                                        }
                                        placeholder="Search by email or username"
                                        aria-label="Member search"
                                    />


                                    <button
                                        type="button"
                                        onClick={
                                            findMembers
                                        }
                                    >
                                        Find users
                                    </button>


                                    <select
                                        value={role}
                                        onChange={
                                            (event) =>
                                                setRole(
                                                    event.target.value
                                                )
                                        }
                                    >

                                        <option value="member">
                                            Member
                                        </option>

                                        <option value="admin">
                                            Admin
                                        </option>

                                    </select>


                                    <button type="submit">
                                        Add selected
                                    </button>

                                </form>


                                {memberMatches.length > 0 && (
                                    <div className="workspace-member-picker">

                                        {memberMatches.map(
                                            (member) => (
                                                <label
                                                    key={
                                                        member._id
                                                    }
                                                >

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            selectedMemberIds.includes(
                                                                member._id
                                                            )
                                                        }
                                                        onChange={() =>
                                                            toggleMemberSelection(
                                                                member._id
                                                            )
                                                        }
                                                    />


                                                    <span>

                                                        <strong>
                                                            {
                                                                member.username
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                member.email
                                                            }
                                                        </small>

                                                    </span>

                                                </label>
                                            )
                                        )}

                                    </div>
                                )}

                            </>
                        )}


                        <div className="workspace-member-grid">

                            {details?.members?.map(
                                (member) => (
                                    <div
                                        className="workspace-member-card"
                                        key={`${member.userId}-${member.role}`}
                                    >

                                        <span>
                                            {
                                                member.username
                                                    .slice(
                                                        0,
                                                        1
                                                    )
                                                    .toUpperCase()
                                            }
                                        </span>


                                        <div>

                                            <strong>
                                                {
                                                    member.alias ||
                                                    member.username
                                                }
                                            </strong>

                                            <small>
                                                {
                                                    member.email ||
                                                    "Workspace member"
                                                }
                                            </small>

                                        </div>


                                        <em>
                                            {member.role}
                                        </em>


                                        {isOwner &&
                                            member.role !==
                                            "owner" && (
                                                <>

                                                    <select
                                                        value={
                                                            member.role
                                                        }
                                                        onChange={
                                                            (event) =>
                                                                handleRoleChange(
                                                                    member.userId,
                                                                    event.target.value
                                                                )
                                                        }
                                                    >

                                                        <option value="member">
                                                            Member
                                                        </option>

                                                        <option value="admin">
                                                            Admin
                                                        </option>

                                                    </select>


                                                    <button
                                                        className="workspace-small-action"
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveMember(
                                                                member.userId
                                                            )
                                                        }
                                                    >
                                                        Remove
                                                    </button>

                                                </>
                                            )}

                                    </div>
                                )
                            )}

                        </div>

                    </section>
                )}


                {/* ==================================
                    SHARED
                ================================== */}

                {tab === "shared" && (
                    <section className="workspace-section">

                        <div className="workspace-section-title">

                            <div>
                                <span>
                                    TEAM EXCHANGE
                                </span>

                                <h2>
                                    Shared with me
                                </h2>
                            </div>

                        </div>


                        <div className="workspace-share-list">

                            {shares.map(
                                (share) => (
                                    <div
                                        className="workspace-share-card"
                                        key={
                                            share._id
                                        }
                                    >

                                        <strong>
                                            {
                                                share.resourceType
                                            }
                                        </strong>

                                        <span>
                                            {
                                                share.permission
                                            }
                                            {" "}
                                            permission
                                        </span>

                                        <small>
                                            Shared resource{" "}
                                            {
                                                share.resourceId
                                            }
                                        </small>

                                    </div>
                                )
                            )}


                            {shares.length === 0 && (
                                <div className="workspace-empty-card">
                                    No shared sessions
                                    or messages yet.
                                </div>
                            )}

                        </div>

                    </section>
                )}


                {/* ==================================
                    USAGE
                ================================== */}

                {tab === "usage" && (
                    <section className="workspace-section">

                        <div className="workspace-section-title">

                            <div>
                                <span>
                                    OWNER VIEW
                                </span>

                                <h2>
                                    Estimated usage
                                </h2>
                            </div>

                        </div>


                        <div className="workspace-usage-list">

                            {usage.map(
                                (
                                    entry,
                                    index
                                ) => (
                                    <div
                                        className="workspace-usage-row"
                                        key={`${entry._id?.userId}-${entry._id?.model}-${index}`}
                                    >

                                        <strong>
                                            {
                                                entry._id?.model
                                            }
                                        </strong>

                                        <span>
                                            {
                                                entry.requests
                                            }
                                            {" "}
                                            requests
                                        </span>

                                        <span>
                                            {
                                                entry.totalTokens
                                            }
                                            {" "}
                                            estimated tokens
                                        </span>

                                    </div>
                                )
                            )}


                            {usage.length === 0 && (
                                <div className="workspace-empty-card">
                                    No workspace usage
                                    recorded yet.
                                </div>
                            )}

                        </div>

                    </section>
                )}

            </main>

        </div>
    );
}


export default WorkspaceDashboard;
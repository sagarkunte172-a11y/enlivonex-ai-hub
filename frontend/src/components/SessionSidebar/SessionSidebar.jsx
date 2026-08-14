import "./SessionSidebar.css";

function SessionSidebar({

    sessions = [],

    activeSession,

    onNewChat,

    onSwitchSession,

    onDeleteSession,

    mobileOpen = false,

    onMobileClose

}) {

    function handleSwitch(sessionId) {

        onSwitchSession(sessionId);

        if (onMobileClose) {

            onMobileClose();

        }

    }

    return (

        <aside className={`session-sidebar ${mobileOpen ? "mobile-open" : ""}`}>

            <div className="sidebar-header">

                <div className="sidebar-brand">

                    <span className="sidebar-brand-icon">🚀</span>

                    <div>

                        <h2>Enlivonex</h2>

                        <span>AI Workspace</span>

                    </div>

                </div>

                <button

                    type="button"

                    className="new-chat-btn"

                    onClick={onNewChat}

                >

                    <span className="new-chat-icon">+</span>

                    New Chat

                </button>

            </div>

            <div className="session-list-label">

                Recent Chats

            </div>

            <div className="session-list">

                {

                    sessions.length === 0 ? (

                        <div className="empty-session">

                            <div className="empty-session-icon">💬</div>

                            <p>No conversations yet</p>

                            <span>Start a new chat to begin</span>

                        </div>

                    ) : (

                        sessions.map((session) => (

                            <div

                                key={session._id}

                                className={`session-item ${

                                    session._id === activeSession

                                        ? "active"

                                        : ""

                                }`}

                                onClick={() => handleSwitch(session._id)}

                                role="button"

                                tabIndex={0}

                                onKeyDown={(e) => {

                                    if (e.key === "Enter" || e.key === " ") {

                                        e.preventDefault();

                                        handleSwitch(session._id);

                                    }

                                }}

                            >

                                <div className="session-item-content">

                                    <div className="session-title">

                                        {session.title || "New Chat"}

                                    </div>

                                    {

                                        session.lastMessage && (

                                            <div className="session-preview">

                                                {session.lastMessage}

                                            </div>

                                        )

                                    }

                                </div>

                                <button

                                    type="button"

                                    className="delete-session"

                                    aria-label="Delete session"

                                    onClick={(e) => {

                                        e.stopPropagation();

                                        onDeleteSession(session._id);

                                    }}

                                >

                                    ✕

                                </button>

                            </div>

                        ))

                    )

                }

            </div>

        </aside>

    );

}

export default SessionSidebar;

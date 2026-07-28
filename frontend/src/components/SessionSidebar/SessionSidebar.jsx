import "./SessionSidebar.css";

function SessionSidebar({

    sessions = [],

    activeSession,

    onNewChat,

    onSwitchSession,

    onDeleteSession

}) {

    return (

        <div className="session-sidebar">

            {/* ==========================
                Header
            ========================== */}

            <div className="sidebar-header">

                <h2>💬 Chats</h2>

                <button

                    className="new-chat-btn"

                    onClick={onNewChat}

                >

                    + New Chat

                </button>

            </div>

            {/* ==========================
                Session List
            ========================== */}

            <div className="session-list">

                {

                    sessions.length === 0 ? (

                        <div className="empty-session">

                            No Chats Yet

                        </div>

                    ) : (

                        sessions.map((session) => (

                            <div

                                key={session.id}

                                className={`session-item ${

                                    session.id === activeSession

                                        ? "active"

                                        : ""

                                }`}

                                onClick={() =>

                                    onSwitchSession(session.id)

                                }

                            >

                                <div className="session-title">

                                    💬 {session.title}

                                </div>

                                <button

                                    className="delete-session"

                                    onClick={(e) => {

                                        e.stopPropagation();

                                        onDeleteSession(session.id);

                                    }}

                                >

                                    🗑

                                </button>

                            </div>

                        ))

                    )

                }

            </div>

        </div>

    );

}

export default SessionSidebar;
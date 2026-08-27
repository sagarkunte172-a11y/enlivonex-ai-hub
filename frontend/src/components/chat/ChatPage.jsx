import {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo
} from "react";

import "./ChatPage.css";

import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import SessionSidebar from "../SessionSidebar/SessionSidebar";

import {
    CHAT_MODELS,
    getSessions,
    createSession,
    switchSession,
    deleteSession,
    sendMessage
} from "../../services/api";


/*==================================
SUGGESTIONS
==================================*/

const SUGGESTIONS = [
    {
        icon: "💡",
        title: "Explain a concept",
        prompt:
            "Explain quantum computing in simple terms."
    },
    {
        icon: "💻",
        title: "Write code",
        prompt:
            "Write a React hook for debouncing input values."
    },
    {
        icon: "🧠",
        title: "Brainstorm ideas",
        prompt:
            "Give me 5 creative startup ideas in the AI space."
    },
    {
        icon: "📝",
        title: "Draft content",
        prompt:
            "Write a short intro paragraph for an AI productivity blog."
    }
];


/*==================================
SYSTEM MESSAGE
==================================*/

const systemMessage = (text) => ({
    id: `system-${Date.now()}-${Math.random()}`,
    sender: "ai",
    text,
    model: {
        name: "Enlivonex AI",
        id: "system",
        reason: "System"
    }
});


/*==================================
CONVERT BACKEND MESSAGES
==================================*/

const toUiMessages = (messages = []) =>
    messages.map((m) => ({
        id:
            m._id ||
            m.id ||
            `message-${Date.now()}-${Math.random()}`,

        sender:
            m.role === "assistant"
                ? "ai"
                : "user",

        text:
            m.content,

        model:
            m.role === "assistant"
                ? m.model || null
                : null
    }));


/*==================================
AUTH TOKEN HELPER
==================================*/

function getAuthToken() {
    return (
        localStorage.getItem("auth_token") ||
        localStorage.getItem("workspace_token") ||
        null
    );
}


/*==================================
GUEST SESSION ID
==================================

This ID exists ONLY inside the
current browser tab/runtime.

It is NOT stored in:

- localStorage
- sessionStorage
- cookies
- MongoDB

Therefore a refresh/reopen creates
a completely new guest session.
==================================
*/

function createGuestSessionId() {
    return `guest-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;
}


/*==================================
GUEST SESSION OBJECT
==================================*/

function createGuestSession() {
    return {
        _id: createGuestSessionId(),
        id: null,
        title: "Guest Chat",
        workspaceId: null,
        guest: true
    };
}


/*==================================
CHAT PAGE
==================================*/

function ChatPage() {

    /*==================================
    AUTH STATE
    ==================================*/

    const [isAuthenticated, setIsAuthenticated] =
        useState(Boolean(getAuthToken()));


    /*==================================
    CHAT STATE
    ==================================*/

    const [messages, setMessages] = useState([
        systemMessage(
            "👋 Hello! I am Enlivonex AI. How can I help you today?"
        )
    ]);


    /*==================================
    SESSION STATE
    ==================================*/

    const [sessions, setSessions] = useState([]);

    const [activeSession, setActiveSession] =
        useState(null);


    /*==================================
    GUEST SESSION
    ==================================*/

    const [guestSession, setGuestSession] =
        useState(null);


    /*==================================
    MODEL STATE
    ==================================*/

    const [selectedModel, setSelectedModel] =
        useState(CHAT_MODELS.AUTO.id);


    /*==================================
    UI STATE
    ==================================*/

    const [isTyping, setIsTyping] =
        useState(false);

    const [sidebarOpen, setSidebarOpen] =
        useState(false);


    /*==================================
    REFS
    ==================================*/

    const bodyRef =
        useRef(null);

    const sessionRef =
        useRef(activeSession);

    const guestSessionRef =
        useRef(guestSession);

    const abortRef =
        useRef(null);


    /*==================================
    KEEP SESSION REF UPDATED
    ==================================*/

    useEffect(() => {
        sessionRef.current =
            activeSession;
    }, [activeSession]);


    /*==================================
    KEEP GUEST SESSION REF UPDATED
    ==================================*/

    useEffect(() => {
        guestSessionRef.current =
            guestSession;
    }, [guestSession]);


    /*==================================
    AUTH STATE CHECK
    ==================================

    We intentionally do NOT persist
    guest state.

    Authentication is determined by
    the currently available JWT.
    ==================================
    */

    useEffect(() => {

        const checkAuth = () => {

            const authenticated =
                Boolean(getAuthToken());

            setIsAuthenticated(
                authenticated
            );

            /*
            If authentication disappears,
            immediately move to guest mode.
            */

            if (!authenticated) {

                sessionRef.current = null;

                setActiveSession(null);

                setSessions([]);

                /*
                Guest session starts fresh
                after logout/auth expiration.
                */

                const newGuest =
                    createGuestSession();

                guestSessionRef.current =
                    newGuest;

                setGuestSession(
                    newGuest
                );

                setMessages([
                    systemMessage(
                        "👋 You are now using Enlivonex AI as a guest."
                    )
                ]);
            }
        };


        checkAuth();


        /*
        Re-check when browser storage
        changes from another tab.
        */

        window.addEventListener(
            "storage",
            checkAuth
        );


        return () => {
            window.removeEventListener(
                "storage",
                checkAuth
            );
        };

    }, []);


    /*==================================
    INITIAL SESSION MODE
    ==================================*/

    useEffect(() => {

        if (!isAuthenticated) {

            /*
            Guest session lives only in
            React memory.

            Refreshing the page destroys it.
            */

            const newGuest =
                createGuestSession();

            guestSessionRef.current =
                newGuest;

            setGuestSession(
                newGuest
            );

            setSessions([]);

            setActiveSession(null);

            return;
        }


        /*
        Authenticated users load their
        persistent MongoDB sessions.
        */

        loadSessions();

    }, [isAuthenticated]);


    /*==================================
    LOAD AUTHENTICATED SESSIONS
    ==================================*/

    const loadSessions =
        useCallback(async () => {

            /*
            Never call this for guests.
            */

            if (!getAuthToken()) {
                return;
            }

            try {

                const data =
                    await getSessions();


                if (!data?.success) {
                    return;
                }


                setSessions(
                    data.sessions || []
                );


                const nextActive =
                    data.activeSession ||
                    null;


                setActiveSession(
                    nextActive
                );


                sessionRef.current =
                    nextActive;


            } catch (error) {

                console.error(
                    "Load Sessions:",
                    error
                );

            }

        }, []);


    /*==================================
    SCROLL TO BOTTOM
    ==================================*/

    useEffect(() => {

        if (bodyRef.current) {

            bodyRef.current.scrollTop =
                bodyRef.current.scrollHeight;

        }

    }, [
        messages,
        isTyping
    ]);


    /*==================================
    ABORT ON UNMOUNT
    ==================================*/

    useEffect(() => {

        return () => {

            abortRef.current?.abort();

        };

    }, []);


    /*==================================
    ABORT REQUEST
    ==================================*/

    const abortRequest =
        useCallback(() => {

            abortRef.current?.abort();

            abortRef.current = null;

            setIsTyping(false);

        }, []);


    /*==================================
    ENSURE SESSION
    ==================================

    Authenticated:

        MongoDB session

    Guest:

        Temporary React-only session
    ==================================
    */

    const ensureSession =
        useCallback(async () => {

            /*
            ==================================
            GUEST
            ==================================
            */

            if (!isAuthenticated) {

                if (
                    guestSessionRef.current
                ) {
                    return guestSessionRef
                        .current
                        ._id;
                }


                const newGuest =
                    createGuestSession();


                guestSessionRef.current =
                    newGuest;


                setGuestSession(
                    newGuest
                );


                return newGuest._id;
            }


            /*
            ==================================
            AUTHENTICATED
            ==================================
            */

            if (sessionRef.current) {

                return sessionRef.current;

            }


            try {

                const data =
                    await createSession();


                if (!data?.success) {
                    return null;
                }


                const id =
                    data.activeSession ||
                    data.session?._id ||
                    data.session?.id ||
                    null;


                if (id) {

                    sessionRef.current =
                        id;

                    setActiveSession(
                        id
                    );

                    await loadSessions();

                }


                return id;

            } catch (error) {

                console.error(
                    "Ensure Session:",
                    error
                );

                return null;
            }

        }, [
            isAuthenticated,
            loadSessions
        ]);


    /*==================================
    NEW CHAT
    ==================================*/

    const handleNewChat =
        useCallback(async () => {

            abortRequest();


            /*
            ==================================
            GUEST NEW CHAT
            ==================================
            */

            if (!isAuthenticated) {

                const newGuest =
                    createGuestSession();


                guestSessionRef.current =
                    newGuest;


                setGuestSession(
                    newGuest
                );


                setActiveSession(null);

                sessionRef.current = null;

                setSessions([]);


                setMessages([
                    systemMessage(
                        "👋 New Guest Chat Started"
                    )
                ]);


                setSidebarOpen(false);

                return;
            }


            /*
            ==================================
            AUTHENTICATED NEW CHAT
            ==================================
            */

            try {

                const data =
                    await createSession();


                if (!data?.success) {
                    return;
                }


                const id =
                    data.activeSession ||
                    data.session?._id ||
                    data.session?.id ||
                    null;


                setMessages([
                    systemMessage(
                        "👋 New Chat Started"
                    )
                ]);


                if (id) {

                    sessionRef.current =
                        id;

                    setActiveSession(
                        id
                    );

                }


                await loadSessions();


                setSidebarOpen(false);


            } catch (error) {

                console.error(
                    "New Chat:",
                    error
                );

            }

        }, [
            abortRequest,
            isAuthenticated,
            loadSessions
        ]);


    /*==================================
    SWITCH SESSION
    ==================================*/

    const handleSwitchSession =
        useCallback(
            async (sessionId) => {

                /*
                Guests cannot switch
                persistent sessions.
                */

                if (!isAuthenticated) {
                    return;
                }


                abortRequest();


                try {

                    const data =
                        await switchSession(
                            sessionId
                        );


                    if (!data?.success) {
                        return;
                    }


                    sessionRef.current =
                        sessionId;


                    setActiveSession(
                        sessionId
                    );


                    const uiMessages =
                        toUiMessages(
                            data.messages || []
                        );


                    setMessages(
                        uiMessages.length
                            ? uiMessages
                            : [
                                systemMessage(
                                    "👋 New Chat Started"
                                )
                            ]
                    );


                    await loadSessions();


                    setSidebarOpen(false);


                } catch (error) {

                    console.error(
                        "Switch Session:",
                        error
                    );

                }

            },
            [
                abortRequest,
                isAuthenticated,
                loadSessions
            ]
        );


    /*==================================
    DELETE SESSION
    ==================================*/

    const handleDeleteSession =
        useCallback(
            async (sessionId) => {

                /*
                Guests do not have
                MongoDB sessions.
                */

                if (!isAuthenticated) {
                    return;
                }


                abortRequest();


                try {

                    const data =
                        await deleteSession(
                            sessionId
                        );


                    if (!data?.success) {
                        return;
                    }


                    await loadSessions();


                    if (
                        sessionRef.current ===
                        sessionId
                    ) {

                        sessionRef.current =
                            data.activeSession ||
                            null;


                        setActiveSession(
                            data.activeSession ||
                            null
                        );


                        setMessages([
                            systemMessage(
                                "👋 Chat session deleted."
                            )
                        ]);

                    }


                } catch (error) {

                    console.error(
                        "Delete Session:",
                        error
                    );

                }

            },
            [
                abortRequest,
                isAuthenticated,
                loadSessions
            ]
        );


    /*==================================
    SEND MESSAGE
    ==================================*/

    const handleSend =
        useCallback(
            async (message) => {

                const clean =
                    String(
                        message || ""
                    ).trim();


                if (
                    !clean ||
                    isTyping
                ) {
                    return;
                }


                abortRequest();


                /*
                ==================================
                SESSION
                ==================================
                */

                const sessionId =
                    await ensureSession();


                if (!sessionId) {

                    setMessages(
                        (prev) => [
                            ...prev,
                            {
                                id:
                                    `error-${Date.now()}`,

                                sender: "ai",

                                text:
                                    "❌ Unable to create chat session.",

                                model: null
                            }
                        ]
                    );

                    return;
                }


                /*
                ==================================
                TEMPORARY USER MESSAGE
                ==================================
                */

                const userMessageId =
                    `user-${Date.now()}-${Math.random()}`;


                const streamId =
                    `stream-${Date.now()}-${Math.random()}`;


                setMessages(
                    (prev) => [
                        ...prev,
                        {
                            id:
                                userMessageId,

                            sender:
                                "user",

                            text:
                                clean,

                            model:
                                null
                        }
                    ]
                );


                setIsTyping(true);


                /*
                ==================================
                ABORT CONTROLLER
                ==================================
                */

                const controller =
                    new AbortController();


                abortRef.current =
                    controller;


                try {

                    let responseStarted =
                        false;


                    await sendMessage(
                        clean,

                        (answer, model) => {

                            /*
                            Do not update a chat
                            after switching sessions.
                            */

                            if (
                                sessionRef.current !==
                                sessionId &&
                                isAuthenticated
                            ) {
                                return;
                            }


                            setIsTyping(false);


                            setMessages(
                                (prev) => {

                                    const index =
                                        prev.findIndex(
                                            (m) =>
                                                m.id ===
                                                streamId
                                        );


                                    const aiMessage = {
                                        id:
                                            streamId,

                                        sender:
                                            "ai",

                                        text:
                                            answer,

                                        model
                                    };


                                    if (
                                        index === -1
                                    ) {

                                        return [
                                            ...prev,
                                            aiMessage
                                        ];

                                    }


                                    const updated =
                                        [...prev];


                                    updated[index] =
                                        aiMessage;


                                    return updated;

                                }
                            );


                            responseStarted =
                                true;

                        },

                        sessionId,

                        selectedModel,

                        controller.signal
                    );


                    if (!responseStarted) {

                        throw new Error(
                            "Empty AI response."
                        );

                    }


                } catch (error) {

                    if (
                        error?.name !==
                        "AbortError"
                    ) {

                        console.error(
                            "Chat:",
                            error
                        );


                        setMessages(
                            (prev) => [
                                ...prev,
                                {
                                    id:
                                        `error-${Date.now()}`,

                                    sender:
                                        "ai",

                                    text:
                                        "❌ Unable to connect to Enlivonex AI.",

                                    model:
                                        null
                                }
                            ]
                        );

                    }

                } finally {

                    if (
                        abortRef.current ===
                        controller
                    ) {

                        abortRef.current =
                            null;

                    }


                    setIsTyping(false);

                }

            },
            [
                abortRequest,
                ensureSession,
                isAuthenticated,
                isTyping,
                selectedModel
            ]
        );


    /*==================================
    ACTIVE SESSION DATA
    ==================================*/

    const activeSessionData =
        useMemo(
            () => {

                if (!isAuthenticated) {
                    return guestSession;
                }


                return (
                    sessions.find(
                        (s) =>
                            s._id ===
                            activeSession
                    ) || null
                );

            },
            [
                sessions,
                activeSession,
                guestSession,
                isAuthenticated
            ]
        );


    /*==================================
    LAST MODEL
    ==================================*/

    const lastModel =
        useMemo(() => {

            for (
                let i =
                    messages.length - 1;
                i >= 0;
                i--
            ) {

                if (
                    messages[i].sender ===
                        "ai" &&
                    messages[i].model &&
                    messages[i].model.id !==
                        "system"
                ) {

                    return messages[i].model;

                }

            }


            return null;

        }, [messages]);


    /*==================================
    USER MESSAGE CHECK
    ==================================*/

    const hasUserMessages =
        messages.some(
            (m) =>
                m.sender === "user"
        );


    /*==================================
    RENDER
    ==================================*/

    return (
        <div className="chat-layout">

            {sidebarOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                    aria-hidden="true"
                />
            )}


            <SessionSidebar
                sessions={
                    isAuthenticated
                        ? sessions
                        : []
                }

                activeSession={
                    isAuthenticated
                        ? activeSession
                        : null
                }

                onNewChat={
                    handleNewChat
                }

                onSwitchSession={
                    handleSwitchSession
                }

                onDeleteSession={
                    handleDeleteSession
                }

                mobileOpen={
                    sidebarOpen
                }

                onMobileClose={() =>
                    setSidebarOpen(false)
                }
            />


            <div className="chat-page">

                {/*==================================
                HEADER
                ==================================*/}

                <header className="chat-header">

                    <div className="chat-header-left">

                        <button
                            className="mobile-menu-button"
                            onClick={() =>
                                setSidebarOpen(true)
                            }
                            aria-label="Open chat sessions"
                        >
                            ☰
                        </button>


                        <div className="chat-header-brand">

                            <div className="chat-header-icon">
                                🤖
                            </div>


                            <div>

                                <h2>
                                    Enlivonex AI
                                </h2>


                                {activeSessionData && (
                                    <p className="chat-session-title">

                                        {activeSessionData.title ||
                                            "New Chat"}

                                        {!isAuthenticated && (
                                            <span>
                                                {" "}
                                                · Guest
                                            </span>
                                        )}

                                    </p>
                                )}

                            </div>

                        </div>

                    </div>


                    <div className="chat-header-right">

                        {/*==================================
                        MODEL SELECTOR
                        ==================================*/}

                        <div className="model-selector">

                            <span className="model-selector-label">
                                Model
                            </span>


                            <select
                                value={
                                    selectedModel
                                }

                                onChange={(e) =>
                                    setSelectedModel(
                                        e.target.value
                                    )
                                }

                                disabled={
                                    isTyping
                                }

                                aria-label="Select chat model"
                            >

                                <option value="auto">
                                    🤖 Automatic
                                </option>


                                <option value="qwen2.5:3b">
                                    ⚡ Qwen 2.5 3B
                                </option>


                                <option value="gemma3:4b">
                                    🧠 Gemma 3 4B
                                </option>

                            </select>

                        </div>


                        {/*==================================
                        LAST MODEL
                        ==================================*/}

                        {lastModel && (
                            <div className="header-model-badge">

                                <span className="header-model-name">
                                    {lastModel.name}
                                </span>


                                {lastModel.reason && (
                                    <span className="header-model-reason">
                                        {lastModel.reason}
                                    </span>
                                )}

                            </div>
                        )}


                        {/*==================================
                        AUTH / GUEST STATUS
                        ==================================*/}

                        <div className="header-status">

                            <span className="status-dot" />

                            {isAuthenticated
                                ? "Ready"
                                : "Guest"}

                        </div>

                    </div>

                </header>


                {/*==================================
                CHAT BODY
                ==================================*/}

                <div
                    className="chat-body"
                    ref={bodyRef}
                >

                    {!hasUserMessages &&
                        !isTyping && (

                            <div className="chat-empty-state">

                                <div className="empty-state-glow" />


                                <div className="empty-state-content">

                                    <div className="empty-state-icon">
                                        ✨
                                    </div>


                                    <h3>
                                        How can Enlivonex AI help you?
                                    </h3>


                                    <p>

                                        Ask questions, write code,
                                        brainstorm ideas, or draft
                                        content — powered by local
                                        AI models through Enlivonex
                                        AI Hub.

                                        {!isAuthenticated && (
                                            <>
                                                {" "}
                                                You are currently
                                                using guest mode.
                                                Your chat will not
                                                be saved after a
                                                refresh.
                                            </>
                                        )}

                                    </p>


                                    <div className="suggestion-grid">

                                        {SUGGESTIONS.map(
                                            (item) => (

                                                <button
                                                    key={
                                                        item.title
                                                    }

                                                    type="button"

                                                    className="suggestion-card"

                                                    onClick={() =>
                                                        handleSend(
                                                            item.prompt
                                                        )
                                                    }
                                                >

                                                    <span className="suggestion-icon">
                                                        {item.icon}
                                                    </span>


                                                    <span className="suggestion-title">
                                                        {item.title}
                                                    </span>

                                                </button>

                                            )
                                        )}

                                    </div>

                                </div>

                            </div>

                        )}


                    {/*==================================
                    MESSAGES
                    ==================================*/}

                    {messages.map(
                        (msg, index) => {

                            if (
                                msg.sender ===
                                    "ai" &&
                                msg.model?.id ===
                                    "system"
                            ) {
                                return null;
                            }


                            return (
                                <ChatMessage
                                    key={
                                        msg.id ||
                                        index
                                    }

                                    sender={
                                        msg.sender
                                    }

                                    text={
                                        msg.text
                                    }

                                    model={
                                        msg.model
                                    }

                                    streaming={
                                        isTyping &&
                                        index ===
                                            messages.length -
                                                1
                                    }
                                />
                            );

                        }
                    )}


                    {/*==================================
                    TYPING INDICATOR
                    ==================================*/}

                    {isTyping && (

                        <div className="typing-message">

                            <div className="avatar ai-avatar">
                                🤖
                            </div>


                            <div className="typing-bubble">

                                <span />
                                <span />
                                <span />

                            </div>

                        </div>

                    )}

                </div>


                {/*==================================
                INPUT
                ==================================*/}

                <ChatInput
                    onSend={
                        handleSend
                    }
                />

            </div>

        </div>
    );
}


export default ChatPage;
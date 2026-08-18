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

const SUGGESTIONS = [
    {
        icon: "💡",
        title: "Explain a concept",
        prompt: "Explain quantum computing in simple terms."
    },
    {
        icon: "💻",
        title: "Write code",
        prompt: "Write a React hook for debouncing input values."
    },
    {
        icon: "🧠",
        title: "Brainstorm ideas",
        prompt: "Give me 5 creative startup ideas in the AI space."
    },
    {
        icon: "📝",
        title: "Draft content",
        prompt: "Write a short intro paragraph for an AI productivity blog."
    }
];

const systemMessage = (text) => ({
    sender: "ai",
    text,
    model: {
        name: "Enlivonex AI",
        id: "system",
        reason: "System"
    }
});

const toUiMessages = (messages = []) =>
    messages.map((m) => ({
        id: m._id || m.id,
        sender: m.role === "assistant" ? "ai" : "user",
        text: m.content,
        model: m.role === "assistant" ? m.model || null : null
    }));

function ChatPage() {
    const [messages, setMessages] = useState([
        systemMessage("👋 Hello! I am Enlivonex AI. How can I help you today?")
    ]);

    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [selectedModel, setSelectedModel] = useState(CHAT_MODELS.AUTO.id);
    const [isTyping, setIsTyping] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const bodyRef = useRef(null);
    const sessionRef = useRef(activeSession);
    const abortRef = useRef(null);

    const loadSessions = useCallback(async () => {
        try {
            const data = await getSessions();

            if (!data.success) return;

            setSessions(data.sessions || []);
            setActiveSession(data.activeSession || null);
        } catch (error) {
            console.error("Load Sessions:", error);
        }
    }, []);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    useEffect(() => {
        sessionRef.current = activeSession;
    }, [activeSession]);

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop =
                bodyRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    useEffect(() => {
        return () => abortRef.current?.abort();
    }, []);

    const abortRequest = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;
        setIsTyping(false);
    }, []);

    const ensureSession = useCallback(async () => {
        if (sessionRef.current) {
            return sessionRef.current;
        }

        const data = await createSession();

        if (!data.success) return null;

        const id =
            data.activeSession ||
            data.session?._id ||
            data.session?.id;

        if (id) {
            sessionRef.current = id;
            setActiveSession(id);
            await loadSessions();
        }

        return id || null;
    }, [loadSessions]);

    const handleNewChat = useCallback(async () => {
        abortRequest();

        try {
            const data = await createSession();

            if (!data.success) return;

            const id =
                data.activeSession ||
                data.session?._id ||
                data.session?.id ||
                null;

            setMessages([
                systemMessage("👋 New Chat Started")
            ]);

            if (id) {
                sessionRef.current = id;
                setActiveSession(id);
            }

            await loadSessions();
            setSidebarOpen(false);
        } catch (error) {
            console.error("New Chat:", error);
        }
    }, [abortRequest, loadSessions]);

    const handleSwitchSession = useCallback(
        async (sessionId) => {
            abortRequest();

            try {
                const data = await switchSession(sessionId);

                if (!data.success) return;

                sessionRef.current = sessionId;
                setActiveSession(sessionId);

                const uiMessages =
                    toUiMessages(data.messages || []);

                setMessages(
                    uiMessages.length
                        ? uiMessages
                        : [systemMessage("👋 New Chat Started")]
                );

                await loadSessions();
                setSidebarOpen(false);
            } catch (error) {
                console.error("Switch Session:", error);
            }
        },
        [abortRequest, loadSessions]
    );

    const handleDeleteSession = useCallback(
        async (sessionId) => {
            abortRequest();

            try {
                const data = await deleteSession(sessionId);

                if (!data.success) return;

                await loadSessions();

                if (sessionRef.current === sessionId) {
                    setMessages([
                        systemMessage("👋 Chat session deleted.")
                    ]);
                }
            } catch (error) {
                console.error("Delete Session:", error);
            }
        },
        [abortRequest, loadSessions]
    );

    const handleSend = useCallback(
        async (message) => {
            const clean = String(message || "").trim();

            if (!clean || isTyping) return;

            abortRequest();

            const sessionId = await ensureSession();

            if (!sessionId) {
                setMessages((prev) => [
                    ...prev,
                    {
                        sender: "ai",
                        text: "❌ Unable to create chat session.",
                        model: null
                    }
                ]);
                return;
            }

            const streamId = `stream-${Date.now()}`;

            setMessages((prev) => [
                ...prev,
                {
                    id: `user-${Date.now()}`,
                    sender: "user",
                    text: clean
                }
            ]);

            setIsTyping(true);

            const controller = new AbortController();
            abortRef.current = controller;

            try {
                let responseStarted = false;

                await sendMessage(
                    clean,
                    (answer, model) => {
                        if (sessionRef.current !== sessionId) {
                            return;
                        }

                        setIsTyping(false);

                        setMessages((prev) => {
                            const index = prev.findIndex(
                                (m) => m.id === streamId
                            );

                            const aiMessage = {
                                id: streamId,
                                sender: "ai",
                                text: answer,
                                model
                            };

                            if (index === -1) {
                                return [...prev, aiMessage];
                            }

                            const updated = [...prev];
                            updated[index] = aiMessage;
                            return updated;
                        });

                        responseStarted = true;
                    },
                    sessionId,
                    selectedModel,
                    controller.signal
                );

                if (!responseStarted) {
                    throw new Error("Empty AI response.");
                }
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Chat:", error);

                    setMessages((prev) => [
                        ...prev,
                        {
                            id: `error-${Date.now()}`,
                            sender: "ai",
                            text: "❌ Unable to connect to Enlivonex AI.",
                            model: null
                        }
                    ]);
                }
            } finally {
                if (abortRef.current === controller) {
                    abortRef.current = null;
                }

                setIsTyping(false);
            }
        },
        [
            abortRequest,
            ensureSession,
            isTyping,
            selectedModel
        ]
    );

    const activeSessionData = useMemo(
        () =>
            sessions.find(
                (s) => s._id === activeSession
            ) || null,
        [sessions, activeSession]
    );

    const lastModel = useMemo(() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (
                messages[i].sender === "ai" &&
                messages[i].model &&
                messages[i].model.id !== "system"
            ) {
                return messages[i].model;
            }
        }

        return null;
    }, [messages]);

    const hasUserMessages = messages.some(
        (m) => m.sender === "user"
    );

    return (
        <div className="chat-layout">
            {sidebarOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <SessionSidebar
                sessions={sessions}
                activeSession={activeSession}
                onNewChat={handleNewChat}
                onSwitchSession={handleSwitchSession}
                onDeleteSession={handleDeleteSession}
                mobileOpen={sidebarOpen}
                onMobileClose={() => setSidebarOpen(false)}
            />

            <div className="chat-page">
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
                                <h2>Enlivonex AI</h2>

                                {activeSessionData && (
                                    <p className="chat-session-title">
                                        {activeSessionData.title ||
                                            "New Chat"}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="chat-header-right">
                        <div className="model-selector">
                            <span className="model-selector-label">
                                Model
                            </span>

                            <select
                                value={selectedModel}
                                onChange={(e) =>
                                    setSelectedModel(
                                        e.target.value
                                    )
                                }
                                disabled={isTyping}
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

                        <div className="header-status">
                            <span className="status-dot" />
                            Ready
                        </div>
                    </div>
                </header>

                <div
                    className="chat-body"
                    ref={bodyRef}
                >
                    {!hasUserMessages && !isTyping && (
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
                                    brainstorm ideas, or draft content —
                                    powered by local AI models through
                                    Enlivonex AI Hub.
                                </p>

                                <div className="suggestion-grid">
                                    {SUGGESTIONS.map((item) => (
                                        <button
                                            key={item.title}
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
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, index) => {
                        if (
                            msg.sender === "ai" &&
                            msg.model?.id === "system"
                        ) {
                            return null;
                        }

                        return (
                            <ChatMessage
                                key={msg.id || index}
                                sender={msg.sender}
                                text={msg.text}
                                model={msg.model}
                                streaming={
                                    isTyping &&
                                    index === messages.length - 1
                                }
                            />
                        );
                    })}

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

                <ChatInput onSend={handleSend} />
            </div>
        </div>
    );
}

export default ChatPage;
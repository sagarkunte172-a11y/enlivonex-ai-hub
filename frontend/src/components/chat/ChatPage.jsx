import { useState, useEffect, useRef, useCallback, useMemo } from "react";

import "./ChatPage.css";

import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import SessionSidebar from "../SessionSidebar/SessionSidebar";

import {
    getSessions,
    createSession,
    switchSession,
    deleteSession
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

function createSystemMessage(text) {
    return {
        sender: "ai",
        text,
        model: {
            name: "Enlivonex AI",
            id: "system",
            reason: "System"
        }
    };
}

function toUiMessages(sessionMessages = []) {
    return (sessionMessages || []).map((message) => ({
        sender: message.role === "assistant" ? "ai" : "user",
        text: message.content,
        model: message.role === "assistant" ? (message.model || null) : null
    }));
}

function ChatPage() {

    const [messages, setMessages] = useState([
        createSystemMessage("👋 Hello! I am Enlivonex AI. How can I help you today?")
    ]);

    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const chatBodyRef = useRef(null);
    const activeSessionRef = useRef(activeSession);
    const abortControllerRef = useRef(null);

    const loadSessions = useCallback(async () => {
        try {
            const response = await getSessions();
            if (!response.success) return;

            setSessions(response.sessions || []);
            setActiveSession(response.activeSession || null);
        } catch (err) {
            console.error("Load Sessions Error:", err);
        }
    }, []);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    useEffect(() => {
        activeSessionRef.current = activeSession;
    }, [activeSession]);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
        };
    }, []);

    const abortActiveRequest = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsTyping(false);
    }, []);

    const handleNewChat = useCallback(async () => {
        try {
            abortActiveRequest();

            const response = await createSession();
            if (!response.success) return;

            await loadSessions();

            const nextSessionId = response.activeSession || response.session?._id || response.session?.id || null;
            setMessages([createSystemMessage("👋 New Chat Started")]);
            setActiveSession(nextSessionId);
            activeSessionRef.current = nextSessionId;
            setSidebarOpen(false);
        }
        catch (err) {
            console.error("Create Session Error:", err);
        }
    }, [abortActiveRequest, loadSessions]);

    const handleSwitchSession = useCallback(async (sessionId) => {
        try {
            abortActiveRequest();

            const response = await switchSession(sessionId);
            if (!response.success) return;

            setActiveSession(sessionId);

            const msgs = toUiMessages(response.messages || []);
            setMessages(msgs.length ? msgs : [createSystemMessage("👋 New Chat Started")]);

            await loadSessions();
        }
        catch (err) {
            console.error("Switch Session Error:", err);
        }
    }, [abortActiveRequest, loadSessions]);

    const handleDeleteSession = useCallback(async (sessionId) => {
        try {
            abortActiveRequest();

            const response = await deleteSession(sessionId);
            if (!response.success) return;

            await loadSessions();
        }
        catch (err) {
            console.error("Delete Session Error:", err);
        }
    }, [abortActiveRequest, loadSessions]);

    const ensureActiveSession = useCallback(async () => {
        if (activeSessionRef.current) {
            return activeSessionRef.current;
        }

        try {
            const response = await createSession();
            if (!response.success) return null;

            const nextSessionId = response.activeSession || response.session?._id || response.session?.id || null;
            if (nextSessionId) {
                setActiveSession(nextSessionId);
                activeSessionRef.current = nextSessionId;
                await loadSessions();
                return nextSessionId;
            }
        } catch (err) {
            console.error("Create fallback session error:", err);
        }

        return null;
    }, [loadSessions]);

    const handleSend = useCallback(async (message) => {
        setMessages(prev => [
            ...prev,
            {
                sender: "user",
                text: message
            }
        ]);

        setIsTyping(true);

        let aiIndex = -1;
        let firstChunkReceived = false;
        const sessionAtSend = activeSessionRef.current;

        abortActiveRequest();

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const resolvedSessionId = sessionAtSend || await ensureActiveSession();
            if (!resolvedSessionId) {
                throw new Error("Failed to create session.");
            }

            const response = await fetch(`${process.env.REACT_APP_API_URL || "/api"}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message,
                    sessionId: resolvedSessionId
                }),
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error("Failed to connect.");
            }

            const modelInfo = {
                name: response.headers.get("X-Model-Name") || "Unknown",
                id: response.headers.get("X-Model-ID") || "unknown",
                reason: response.headers.get("X-Model-Reason") || ""
            };

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullResponse = "";

            if (!reader) {
                throw new Error("Failed to connect.");
            }

            const updateStreamingMessage = (text) => {
                setMessages(prev => {
                    const updated = [...prev];
                    if (aiIndex >= 0 && updated[aiIndex]) {
                        updated[aiIndex] = {
                            ...updated[aiIndex],
                            text
                        };
                    }
                    return updated;
                });
            };

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                if (controller.signal.aborted) return;

                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;

                if (activeSessionRef.current !== resolvedSessionId) return;

                if (!firstChunkReceived) {
                    firstChunkReceived = true;
                    setIsTyping(false);

                    setMessages(prev => {
                        aiIndex = prev.length;
                        return [
                            ...prev,
                            {
                                sender: "ai",
                                text: fullResponse,
                                model: modelInfo || { name: "Loading...", id: "", reason: "" }
                            }
                        ];
                    });

                    continue;
                }

                updateStreamingMessage(fullResponse);
            }

            if (activeSessionRef.current === resolvedSessionId && aiIndex >= 0) {
                setMessages(prev => {
                    const updated = [...prev];
                    updated[aiIndex] = {
                        ...updated[aiIndex],
                        model: modelInfo
                    };
                    return updated;
                });
            }
        }
        catch (err) {
            if (err.name === "AbortError") {
                setIsTyping(false);
                return;
            }

            if (activeSessionRef.current === sessionAtSend && aiIndex >= 0) {
                setMessages(prev => {
                    const updated = [...prev];
                    updated[aiIndex] = {
                        ...updated[aiIndex],
                        text: "❌ Unable to connect.",
                        model: { name: "Unknown", id: "unknown", reason: "" }
                    };
                    return updated;
                });
            } else if (activeSessionRef.current === sessionAtSend) {
                setMessages(prev => [
                    ...prev,
                    {
                        sender: "ai",
                        text: "❌ Unable to connect.",
                        model: { name: "Unknown", id: "unknown", reason: "" }
                    }
                ]);
            }

            setIsTyping(false);
        }
        finally {
            if (abortControllerRef.current === controller) {
                abortControllerRef.current = null;
            }
            setIsTyping(false);
        }
    }, [abortActiveRequest, ensureActiveSession]);

    const activeSessionData = useMemo(() => {
        return sessions.find((s) => s._id === activeSession) || null;
    }, [sessions, activeSession]);

    const lastModel = useMemo(() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            const msg = messages[i];
            if (msg.sender === "ai" && msg.model && msg.model.id !== "system") {
                return msg.model;
            }
        }
        return null;
    }, [messages]);

    const hasUserMessages = useMemo(() => {
        return messages.some((msg) => msg.sender === "user");
    }, [messages]);

    const showEmptyState = !hasUserMessages && !isTyping;

    return (
        <div className="chat-layout">
            {
                sidebarOpen && (
                    <div
                        className="sidebar-backdrop"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )
            }

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
                            type="button"
                            className="sidebar-toggle"
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            aria-label="Toggle sessions"
                        >
                            ☰
                        </button>

                        <div className="chat-header-brand">
                            <div className="chat-header-icon">🤖</div>
                            <div>
                                <h2>Enlivonex AI</h2>
                                {
                                    activeSessionData && (
                                        <p className="chat-session-title">
                                            {activeSessionData.title || "New Chat"}
                                        </p>
                                    )
                                }
                            </div>
                        </div>
                    </div>

                    <div className="chat-header-right">
                        {
                            lastModel && (
                                <div className="header-model-badge">
                                    <span className="header-model-name">{lastModel.name}</span>
                                    {
                                        lastModel.reason && (
                                            <span className="header-model-reason">{lastModel.reason}</span>
                                        )
                                    }
                                </div>
                            )
                        }

                        <div className="header-status">
                            <span className="status-dot"></span>
                            Ready
                        </div>
                    </div>
                </header>

                <div className="chat-body" ref={chatBodyRef}>
                    {
                        showEmptyState && (
                            <div className="chat-empty-state">
                                <div className="empty-state-glow"></div>

                                <div className="empty-state-content">
                                    <div className="empty-state-icon">✨</div>

                                    <h3>How can Enlivonex AI help you?</h3>

                                    <p>
                                        Ask questions, write code, brainstorm ideas, or draft content —
                                        powered by local AI models through Enlivonex AI Hub.
                                    </p>

                                    <div className="suggestion-grid">
                                        {
                                            SUGGESTIONS.map((item) => (
                                                <button
                                                    key={item.title}
                                                    type="button"
                                                    className="suggestion-card"
                                                    onClick={() => handleSend(item.prompt)}
                                                >
                                                    <span className="suggestion-icon">{item.icon}</span>
                                                    <span className="suggestion-title">{item.title}</span>
                                                </button>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {
                        messages.map((msg, index) => {
                            if (msg.sender === "ai" && msg.model?.id === "system") {
                                return null;
                            }

                            return (
                                <ChatMessage
                                    key={index}
                                    sender={msg.sender}
                                    text={msg.text}
                                    model={msg.model}
                                    streaming={index === messages.length - 1 && msg.sender === "ai"}
                                />
                            );
                        })
                    }

                    {
                        isTyping && (
                            <div className="typing-message">
                                <div className="avatar ai-avatar">🤖</div>
                                <div className="typing-bubble">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )
                    }
                </div>

                <ChatInput onSend={handleSend} />
            </div>
        </div>
    );
}

export default ChatPage;

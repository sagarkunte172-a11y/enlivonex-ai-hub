import { useState, useEffect, useRef } from "react";

import "./ChatPage.css";

import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import SessionSidebar from "../SessionSidebar/SessionSidebar";

import {
    sendMessage,
    getSessions,
    createSession,
    switchSession,
    deleteSession,
    getSession
} from "../../services/api";

function ChatPage() {

    const [messages, setMessages] = useState([
        {
            sender: "ai",
            text: "👋 Hello! I am Enlivonex AI. How can I help you today?",
            model: {
                name: "Enlivonex AI",
                id: "system",
                reason: "System"
            }
        }
    ]);

    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [isTyping, setIsTyping] = useState(false);

    const chatBodyRef = useRef(null);
    const activeSessionRef = useRef(activeSession);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    useEffect(() => {
        loadSessions();
    }, []);

    useEffect(() => {
        activeSessionRef.current = activeSession;
    }, [activeSession]);

    async function loadSessions() {
        try {
            const response = await getSessions();
            if (!response.success) return;

            setSessions(response.sessions || []);
            const active = response.activeSession || null;
            setActiveSession(active);

            if (active) {
                try {
                    const sessResp = await getSession(active);
                    if (sessResp && sessResp.success) {
                        const msgs = (sessResp.messages || []).map(m => ({
                            sender: m.role === 'assistant' ? 'ai' : 'user',
                            text: m.content,
                            model: m.role === 'assistant' ? (m.model || null) : null
                        }));
                        if (msgs.length) setMessages(msgs);
                        else setMessages([]);
                    }
                }
                catch (err) {
                    console.error('Load session messages error:', err);
                }
            }

        } catch (err) {
            console.error("Load Sessions Error:", err);
        }
    }

    async function handleNewChat() {
        try {
            const response = await createSession();
            if (!response.success) return;

            await loadSessions();

            setMessages([]);
            setActiveSession(response.activeSession || response.session?.id || null);
        }
        catch (err) {
            console.error("Create Session Error:", err);
        }
    }

    async function handleSwitchSession(sessionId) {
        try {
            const response = await switchSession(sessionId);
            if (!response.success) return;

            setActiveSession(sessionId);

            const msgs = (response.messages || []).map(m => ({
                sender: m.role === 'assistant' ? 'ai' : 'user',
                text: m.content,
                model: m.role === 'assistant' ? (m.model || null) : null
            }));

            setMessages(msgs.length ? msgs : []);

        }
        catch (err) {
            console.error("Switch Session Error:", err);
        }
    }

    async function handleDeleteSession(sessionId) {
        try {
            const response = await deleteSession(sessionId);
            if (!response.success) return;
            await loadSessions();
        }
        catch (err) {
            console.error("Delete Session Error:", err);
        }
    }

    async function handleSend(message) {
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

        const sessionAtSend = activeSession;

        const responsePromise = sendMessage(
            message,
            (streamText, modelInfo) => {
                if (!firstChunkReceived) {
                    firstChunkReceived = true;
                    setIsTyping(false);

                    // If user switched sessions since sending, don't append to current UI
                    if (activeSessionRef.current !== sessionAtSend) return;

                    setMessages(prev => {
                        aiIndex = prev.length;
                        return [
                            ...prev,
                            {
                                sender: "ai",
                                text: streamText,
                                model: modelInfo || { name: "Loading...", id: "", reason: "" }
                            }
                        ];
                    });

                    return;
                }

                // If user switched sessions since sending, don't update current UI
                if (activeSessionRef.current !== sessionAtSend) return;

                setMessages(prev => {
                    const updated = [...prev];
                    if (aiIndex >= 0) {
                        updated[aiIndex] = {
                            ...updated[aiIndex],
                            text: streamText
                        };
                    }
                    return updated;
                });
            }
        , sessionAtSend);

        const response = await responsePromise;

        setIsTyping(false);

        // If user switched sessions since sending, do not modify current UI
        if (activeSessionRef.current === sessionAtSend && aiIndex >= 0) {
            if (!response.success) {
                setMessages(prev => {
                    const updated = [...prev];
                    updated[aiIndex] = {
                        ...updated[aiIndex],
                        text: response.aiReply || "❌ Unable to connect to AI.",
                        model: response.model || { name: "Unknown", id: "unknown", reason: "" }
                    };
                    return updated;
                });
            }

            if (response.success) {
                setMessages(prev => {
                    const updated = [...prev];
                    updated[aiIndex] = {
                        ...updated[aiIndex],
                        model: response.model
                    };
                    return updated;
                });
            }
        }

        await loadSessions();
    }

    return (
        <div className="chat-layout">
            <SessionSidebar
                sessions={sessions}
                activeSession={activeSession}
                onNewChat={handleNewChat}
                onSwitchSession={handleSwitchSession}
                onDeleteSession={handleDeleteSession}
            />

            <div className="chat-page">
                <div className="chat-header">
                    <h2>🤖 Enlivonex AI</h2>
                    <p>Your Local AI Assistant powered by ENLIVONEX AI HUB</p>
                </div>

                <div className="chat-body" ref={chatBodyRef}>
                    {messages.map((msg, index) => (
                        <ChatMessage
                            key={index}
                            sender={msg.sender}
                            text={msg.text}
                            model={msg.model}
                            streaming={index === messages.length - 1 && msg.sender === "ai"}
                        />
                    ))}

                    {isTyping && (
                        <div className="typing-message">
                            <div className="avatar ai-avatar">🤖</div>
                            <div className="typing-bubble">
                                <span></span>
                                <span></span>
                                <span></span>
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

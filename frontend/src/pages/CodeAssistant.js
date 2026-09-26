import { useEffect, useState } from "react";
import "./CodeAssistant.css";

import {
    sendCodeAssistant,
    createCodeConversation,
    getCodeConversations,
    getCodeConversation
} from "../services/api";

function CodeAssistant() {

    const [code, setCode] = useState("");
    const [instruction, setInstruction] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [model, setModel] = useState("qwen2.5-coder:7b");
    const [conversationId, setConversationId] = useState("");
    const [permission, setPermission] = useState("owner");
    const [myChats, setMyChats] = useState([]);
    const [sharedChats, setSharedChats] = useState([]);
    const [historyError, setHistoryError] = useState("");

    async function loadHistory() {
        try {
            const [mine, shared] = await Promise.all([
                getCodeConversations({ scope: "mine" }),
                getCodeConversations({ scope: "shared" })
            ]);
            setMyChats(mine.conversations || []);
            setSharedChats(shared.conversations || []);
            setHistoryError("");
        } catch (error) {
            setHistoryError("Unable to load Code Assistant history.");
        }
    }

    useEffect(() => { loadHistory(); }, []);

    async function openConversation(id) {
        try {
            const data = await getCodeConversation(id);
            setConversationId(data.conversation._id);
            setPermission(data.permission);
            const entries = data.conversation.messages || [];
            const lastUser = [...entries].reverse().find((item) => item.role === "user");
            const lastAssistant = [...entries].reverse().find((item) => item.role === "assistant");
            setInstruction(lastUser?.content || "");
            setResponse(lastAssistant?.content || "");
            setHistoryError("");
        } catch (error) {
            setHistoryError("This Code Assistant conversation is unavailable or you no longer have access.");
        }
    }

    const MODEL_NAME = model === "qwen2.5-coder:14b-instruct"
        ? "Qwen 2.5 Coder 14B"
        : "Qwen 2.5 Coder 7B";

    async function handleGenerate() {

        if (!code.trim() && !instruction.trim()) {
            return;
        }

        setResponse("");
        setLoading(true);

        const prompt = `
User Instruction:
${instruction.trim() ||
    "Analyze the provided code and identify errors or improvements."}

Code:
${code.trim() ||
    "No code was provided. Answer the coding request directly."}
        `.trim();

        try {
            let activeConversationId = conversationId;
            if (!activeConversationId) {
                const created = await createCodeConversation({ title: instruction.trim().slice(0, 80) || "Code Assistant Chat" });
                activeConversationId = created.conversation._id;
                setConversationId(activeConversationId);
                setPermission("owner");
            }
            const result = await sendCodeAssistant(
                prompt,
                (liveResponse) => {
                    setResponse(liveResponse);
                },
                model,
                activeConversationId
            );

            setResponse(
                result.answer || ""
            );
            await loadHistory();
        } catch (error) {
            setResponse(`❌ ${error.message || "Unable to generate a response."}`);
        } finally {
            setLoading(false);
        }
    }

    function clearAssistant() {

        if (loading) return;

        setCode("");
        setInstruction("");
        setResponse("");
        setConversationId("");
        setPermission("owner");
    }

    return (

        <div className="code-page">

            {/* HEADER */}

            <header className="code-header">

                <div className="code-title">

                    <h1>💻 Code Assistant</h1>

                    <p>
                        Generate, debug, explain and
                        optimize your code with AI.
                    </p>

                </div>

                <div className="model-badge">

                    <span
                        className={
                            loading
                                ? "status-dot loading"
                                : "status-dot"
                        }
                    />

                    <select value={model} onChange={(event) => setModel(event.target.value)} disabled={loading} aria-label="Code Assistant model">
                        <option value="qwen2.5-coder:7b">Qwen 2.5 Coder 7B</option>
                        <option value="qwen2.5-coder:14b-instruct">Qwen 2.5 Coder 14B</option>
                    </select>

                </div>

            </header>

            <section className="code-history">
                <div><h2>My Code Chats</h2><button type="button" onClick={clearAssistant}>New chat</button></div>
                {historyError && <p role="status">{historyError}</p>}
                <div className="code-history-list">
                    {myChats.map((chat) => <button type="button" key={chat._id} onClick={() => openConversation(chat._id)}>{chat.title}</button>)}
                </div>
                <div><h2>Shared Code Chats</h2></div>
                <div className="code-history-list">
                    {sharedChats.map((chat) => <button type="button" key={chat._id} onClick={() => openConversation(chat._id)}>{chat.title}</button>)}
                </div>
            </section>


            {/* WORKSPACE */}

            <div className="code-workspace">

                {/* CODE */}

                <section className="code-panel">

                    <div className="panel-header">

                        <h2>Your Code</h2>

                        <span>Code Input</span>

                    </div>

                    <textarea
                        className="code-input"
                        value={code}
                        onChange={(e) =>
                            setCode(e.target.value)
                        }
                        placeholder={`Paste your code here...

Example:

def add(a, b):
    return a + b`}
                        spellCheck="false"
                    />

                </section>


                {/* INSTRUCTION */}

                <section className="instruction-panel">

                    <div className="panel-header">

                        <h2>Instruction</h2>

                        <span>What should AI do?</span>

                    </div>

                    <textarea
                        className="instruction-input"
                        value={instruction}
                        onChange={(e) =>
                            setInstruction(e.target.value)
                        }
                        placeholder={`Example:

Debug this code and explain the error.

or

Optimize this code for better performance.`}
                    />

                    <div className="action-buttons">

                        <button
                            className="generate-button"
                            onClick={handleGenerate}
                            disabled={loading || permission === "view"}
                        >
                            {loading
                                ? "⏳ Qwen is working..."
                                : "⚡ Generate Solution"}
                        </button>

                        <button
                            className="clear-button"
                            onClick={clearAssistant}
                            disabled={loading}
                        >
                            Clear
                        </button>

                    </div>

                </section>

            </div>


            {/* RESPONSE */}

            <section className="response-panel">

                <div className="response-header">

                    <div>

                        <h2>🤖 AI Response</h2>

                        <span>
                            {loading
                                ? `${MODEL_NAME} is generating...`
                                : "Ready"}
                        </span>

                    </div>

                    {loading && (

                        <div className="typing-indicator">

                            <span />
                            <span />
                            <span />

                        </div>

                    )}

                </div>


                <div className="response-content">

                    {response ? (

                        <pre>{response}</pre>

                    ) : (

                        <div className="empty-response">

                            <div className="empty-icon">
                                💡
                            </div>

                            <h3>
                                Your AI response will appear here
                            </h3>

                            <p>
                                Paste your code, describe what
                                you want to do, and let Qwen
                                analyze it.
                            </p>

                        </div>

                    )}

                </div>

            </section>

        </div>
    );
}

export default CodeAssistant;

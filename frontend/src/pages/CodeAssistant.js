import { useState } from "react";
import "./CodeAssistant.css";
import { sendCodeAssistant } from "../services/api";

function CodeAssistant() {

    const [code, setCode] = useState("");
    const [instruction, setInstruction] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [model, setModel] = useState("Qwen 2.5 Coder 7B");

    async function handleGenerate() {

        if (!code.trim() && !instruction.trim()) {
            return;
        }

        setResponse("");
        setLoading(true);

        const prompt = `
User Instruction:
${instruction || "Analyze the provided code and suggest improvements."}

Code:
${code}
        `.trim();

        const result = await sendCodeAssistant(
            prompt,
            (liveResponse) => {
                setResponse(liveResponse);
            }
        );

        if (result.success) {
            setModel(
                result.model?.name ||
                "Qwen 2.5 Coder 7B"
            );

            setResponse(result.answer);
        }
        else {
            setResponse(
                result.answer ||
                "❌ Unable to generate a response."
            );
        }

        setLoading(false);
    }

    function clearAssistant() {
        setCode("");
        setInstruction("");
        setResponse("");
    }

    return (

        <div className="code-page">

            {/* Header */}

            <div className="code-header">

                <div>

                    <h1>💻 Code Assistant</h1>

                    <p>
                        Generate, debug, explain and optimize
                        your code with AI.
                    </p>

                </div>

                <div className="model-badge">

                    <span className="status-dot"></span>

                    {model}

                </div>

            </div>


            {/* Workspace */}

            <div className="code-workspace">

                {/* Left side */}

                <div className="code-panel">

                    <div className="panel-header">

                        <h2>Your Code</h2>

                        <span>
                            Code Input
                        </span>

                    </div>

                    <textarea
                        className="code-input"
                        value={code}
                        onChange={(e) =>
                            setCode(e.target.value)
                        }
                        placeholder={
                            "Paste your code here...\n\nExample:\n\ndef add(a, b):\n    return a + b"
                        }
                        spellCheck="false"
                    />

                </div>


                {/* Right side */}

                <div className="instruction-panel">

                    <div className="panel-header">

                        <h2>Instruction</h2>

                        <span>
                            What should AI do?
                        </span>

                    </div>

                    <textarea
                        className="instruction-input"
                        value={instruction}
                        onChange={(e) =>
                            setInstruction(e.target.value)
                        }
                        placeholder={
                            "Example:\nDebug this code and explain the error.\n\nor\n\nOptimize this code for better performance."
                        }
                    />

                    <div className="action-buttons">

                        <button
                            className="generate-button"
                            onClick={handleGenerate}
                            disabled={loading}
                        >

                            {loading
                                ? "⏳ Generating..."
                                : "⚡ Generate Solution"
                            }

                        </button>

                        <button
                            className="clear-button"
                            onClick={clearAssistant}
                            disabled={loading}
                        >
                            Clear
                        </button>

                    </div>

                </div>

            </div>


            {/* AI Response */}

            <div className="response-panel">

                <div className="response-header">

                    <div>

                        <h2>🤖 AI Response</h2>

                        <span>
                            {loading
                                ? "Qwen is generating..."
                                : "Ready"
                            }
                        </span>

                    </div>

                    {loading && (
                        <div className="typing-indicator">

                            <span></span>
                            <span></span>
                            <span></span>

                        </div>
                    )}

                </div>


                <div className="response-content">

                    {response ? (

                        <pre>
                            {response}
                        </pre>

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

            </div>

        </div>

    );
}

export default CodeAssistant;
import { useState } from "react";

import "./ChatMessage.css";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function ChatMessage({

    sender,

    text,

    model,

    streaming = false

}) {

    const [copiedCode, setCopiedCode] = useState("");

    async function copyCode(code) {

        try {

            await navigator.clipboard.writeText(code);

            setCopiedCode(code);

            setTimeout(() => {

                setCopiedCode("");

            }, 2000);

        }

        catch (err) {

            console.error(err);

        }

    }

    const isUser = sender === "user";

    return (

        <div className={`message ${isUser ? "user-message" : "ai-message"}`}>

            {

                !isUser && (

                    <div className="avatar ai-avatar" aria-hidden="true">

                        🤖

                    </div>

                )

            }

            <div className="message-bubble">

                {

                    !isUser && model && model.id !== "system" && (

                        <div className="model-badge">

                            <span className="model-name">

                                {model.name}

                            </span>

                            {

                                model.reason && (

                                    <span className="model-reason">

                                        {model.reason}

                                    </span>

                                )

                            }

                        </div>

                    )

                }

                <ReactMarkdown

                    remarkPlugins={[remarkGfm]}

                    components={{

                        code({

                            inline,

                            className,

                            children,

                            ...props

                        }) {

                            const match = /language-(\w+)/.exec(className || "");

                            const code = String(children).replace(/\n$/, "");

                            if (!inline && match) {

                                return (

                                    <div className="code-block">

                                        <div className="code-header">

                                            <span className="code-lang">

                                                {match[1]}

                                            </span>

                                            <button

                                                type="button"

                                                className="copy-btn"

                                                onClick={() => copyCode(code)}

                                            >

                                                {

                                                    copiedCode === code

                                                        ? "Copied"

                                                        : "Copy"

                                                }

                                            </button>

                                        </div>

                                        <SyntaxHighlighter

                                            style={oneDark}

                                            language={match[1]}

                                            PreTag="div"

                                            {...props}

                                        >

                                            {code}

                                        </SyntaxHighlighter>

                                    </div>

                                );

                            }

                            return (

                                <code

                                    className={className}

                                    {...props}

                                >

                                    {children}

                                </code>

                            );

                        }

                    }}

                >

                    {text}

                </ReactMarkdown>

                {

                    streaming && (

                        <span className="stream-cursor" aria-hidden="true">

                            |

                        </span>

                    )

                }

            </div>

            {

                isUser && (

                    <div className="avatar user-avatar" aria-hidden="true">

                        👤

                    </div>

                )

            }

        </div>

    );

}

export default ChatMessage;

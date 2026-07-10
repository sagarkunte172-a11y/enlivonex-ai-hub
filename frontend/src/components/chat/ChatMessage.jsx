import { useState } from "react";

import "./ChatMessage.css";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function ChatMessage({

    sender,

    text,

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

    return (

        <div

            className={

                sender === "user"

                    ? "message user-message"

                    : "message ai-message"

            }

        >

            {

                sender === "ai" && (

                    <div className="avatar ai-avatar">

                        🤖

                    </div>

                )

            }

            <div className="message-bubble">

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

                                            <span>

                                                {match[1]}

                                            </span>

                                            <button

                                                className="copy-btn"

                                                onClick={() => copyCode(code)}

                                            >

                                                {

                                                    copiedCode === code

                                                        ? "✅ Copied"

                                                        : "📋 Copy"

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

                        <span className="stream-cursor">

                            |

                        </span>

                    )

                }

            </div>

            {

                sender === "user" && (

                    <div className="avatar user-avatar">

                        👤

                    </div>

                )

            }

        </div>

    );

}

export default ChatMessage;
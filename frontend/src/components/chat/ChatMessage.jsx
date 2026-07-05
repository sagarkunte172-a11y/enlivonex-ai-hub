import "./ChatMessage.css";

function ChatMessage({ sender, text }) {

    return (

        <div
            className={
                sender === "user"
                    ? "message user-message"
                    : "message ai-message"
            }
        >

            <div className="message-bubble">

                {text}

            </div>

        </div>

    );

}

export default ChatMessage;
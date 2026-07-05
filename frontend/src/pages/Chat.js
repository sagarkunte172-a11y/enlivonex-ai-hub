import "./Chat.css";

function Chat() {
  return (
    <div className="chat-page">

      <div className="chat-header">
        <h1>🤖 Enlivonex AI Chat</h1>
        <p>Talk with your favourite AI models in one place.</p>
      </div>

      <div className="chat-window">

        <div className="message ai">
          <strong>Enlivonex AI</strong>
          <p>Hello! 👋 How can I help you today?</p>
        </div>

        <div className="message user">
          <strong>You</strong>
          <p>This is my first AI Hub project!</p>
        </div>

      </div>

      <div className="chat-input">

        <input
          type="text"
          placeholder="Type your message..."
        />

        <button>Send</button>

      </div>

    </div>
  );
}

export default Chat;
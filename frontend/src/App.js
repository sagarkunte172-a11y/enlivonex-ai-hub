import "./App.css";

function App() {
  function showMessage() {
    alert(
      "🚀 Welcome to Enlivonex AI Hub!\n\nVersion 0.1\n\nCreated by Sagar\n\nMore exciting features are coming soon!"
    );
  }

  return (
    <>
      <nav className="navbar">
        <h2>🚀 ENLIVONEX AI HUB</h2>

        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/">Features</a>
          <a href="/">About</a>
          <a href="/">Contact</a>
        </div>
      </nav>

      <div className="App">
        <div className="container">
          <h1>🚀 Enlivonex AI Hub</h1>

          <h2>Build. Learn. Create.</h2>

          <p>
            An AI platform built by students, for creators,
            developers and innovators.
          </p>

          <div className="features">
            <h3>Upcoming Features</h3>

            <ul>
              <li>🤖 AI Chat</li>
              <li>🎨 Image Generation</li>
              <li>💻 Coding Assistant</li>
              <li>📝 Script Generator</li>
              <li>🚀 More Coming Soon...</li>
            </ul>
          </div>

          <button onClick={showMessage}>
            Coming Soon
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
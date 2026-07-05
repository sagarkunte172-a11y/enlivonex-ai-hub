import "./Dashboard.css";
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="dashboard">

      <aside className="sidebar">

        <h2>🚀 ENLIVONEX</h2>

        <ul>

          <li>🏠 Dashboard</li>

          <li>
            <Link to="/chat">🤖 AI Chat</Link>
          </li>

          <li>
            <Link to="/code">💻 Code Assistant</Link>
          </li>

          <li>
            <Link to="/image">🎨 Image Generator</Link>
          </li>

          <li>
            <Link to="/script">📝 Script Generator</Link>
          </li>

          <li>⚙ Settings</li>

        </ul>

      </aside>

      <main className="dashboard-main">

        <div className="dashboard-header">

          <div>

            <h1>Welcome Back 👋</h1>

            <p>
              Your personal AI workspace is ready.
            </p>

          </div>

        </div>

        <div className="dashboard-cards">

          <Link to="/chat" className="dash-card">

            <h2>🤖 AI Chat</h2>

            <p>Talk with AI models.</p>

          </Link>

          <Link to="/code" className="dash-card">

            <h2>💻 Code Assistant</h2>

            <p>Generate and debug code.</p>

          </Link>

          <Link to="/image" className="dash-card">

            <h2>🎨 Image Generator</h2>

            <p>Create AI Images instantly.</p>

          </Link>

          <Link to="/script" className="dash-card">

            <h2>📝 Script Generator</h2>

            <p>Generate scripts and content.</p>

          </Link>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;
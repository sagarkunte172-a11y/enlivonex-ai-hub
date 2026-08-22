import "./Dashboard.css";
import { Link } from "react-router-dom";

function Dashboard() {

  return (

    <div className="dashboard-page">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="dashboard-sidebar">

        <div>

          <div className="sidebar-logo">

            <h2>🚀 ENLIVONEX</h2>

            <span>AI Hub • Version 0.1 Alpha</span>

          </div>

          <nav className="sidebar-menu">

            <Link
              to="/dashboard"
              className="active"
            >
              🏠 Dashboard
            </Link>

            <Link to="/chat">
              🤖 AI Chat
            </Link>

            <Link to="/workspace">
              👥 Team Workspace
            </Link>

            <Link to="/profile">
              👤 My Profile
            </Link>

            <Link to="/code">
              💻 Code Assistant
            </Link>

            <Link to="/image">
              🎨 Image Generator
            </Link>

            <Link to="/script">
              📝 Script Generator
            </Link>

            <Link to="/">
              🌐 Homepage
            </Link>

          </nav>

        </div>

        <div className="sidebar-bottom">

          <h4>Workspace Status</h4>

          <p>

            Enlivonex AI Hub is running in
            Alpha Mode.

          </p>

          <div className="workspace-status">

            <span className="status-dot"></span>

            Active

          </div>

        </div>

      </aside>

      {/* =========================
          MAIN
      ========================= */}

      <main className="dashboard-main">

        {/* =========================
            HERO
        ========================= */}

        <section className="dashboard-hero">

          <div className="hero-panel">

            <div className="hero-badge">

              🚀 AI Workspace

            </div>

            <h2>

              Everything You Need,

              <br />

              <span>Inside One Dashboard.</span>

            </h2>

            <p>

              Access AI Chat, Code Assistant,
              Image Generator, Script Generator,
              future AI Models and productivity
              tools from one beautiful workspace.

            </p>

            <div className="quick-actions">

              <Link
                to="/workspace"
                className="action-btn"
              >
                👥 Open Workspace
              </Link>

              <Link
                to="/chat"
                className="action-btn"
              >
                🤖 Launch AI Chat
              </Link>

              <Link
                to="/features"
                className="action-btn"
              >
                ⚡ Explore Features
              </Link>

            </div>

          </div>

          <div className="status-panel">

            <h3>System Status</h3>

            <div className="status-item">

              <span>Backend</span>

              <span className="online">

                Running

              </span>

            </div>

            <div className="status-item">

              <span>MongoDB</span>

              <span className="online">

                Connected

              </span>

            </div>

            <div className="status-item">

              <span>Ollama</span>

              <span className="online">

                Ready

              </span>

            </div>

            <div className="status-item">

              <span>Workspace</span>

              <span>Alpha v0.1</span>

            </div>

          </div>

        </section>

        {/* =========================
            AI WORKSPACE
        ========================= */}

        <section className="dashboard-tools">

          <h2>

            ⚡ AI Workspace

          </h2>

          <p className="section-subtitle">

            Launch every AI tool from one place.

          </p>

          <div className="tool-grid">

            <Link
              to="/chat"
              className="tool-card"
            >

              <div className="tool-card-icon">

                🤖

              </div>

              <h3>AI Chat</h3>

              <p>

                Chat with local and cloud AI
                models inside one interface.

              </p>

              <span className="open-tool">

                Open →

              </span>

            </Link>

            <Link
              to="/code"
              className="tool-card"
            >

              <div className="tool-card-icon">

                💻

              </div>

              <h3>Code Assistant</h3>

              <p>

                Generate, debug and explain
                programming code instantly.

              </p>

              <span className="open-tool">

                Open →

              </span>

            </Link>

            <Link
              to="/image"
              className="tool-card"
            >

              <div className="tool-card-icon">

                🎨

              </div>

              <h3>Image Generator</h3>

              <p>

                Create stunning AI images
                using simple prompts.

              </p>

              <span className="open-tool">

                Coming Soon

              </span>

            </Link>

            <Link
              to="/script"
              className="tool-card"
            >

              <div className="tool-card-icon">

                📝

              </div>

              <h3>Script Generator</h3>

              <p>

                Generate blogs, YouTube scripts
                and creative content.

              </p>

              <span className="open-tool">

                Coming Soon

              </span>

            </Link>

          </div>

        </section>

        {/* =========================
            ANALYTICS
        ========================= */}

        <section className="dashboard-analytics">

          <h2>

            📊 Workspace Analytics

          </h2>

          <p className="analytics-subtitle">

            Live overview of your AI workspace.

          </p>

          <div className="analytics-grid">

            <div className="analytics-card">

              <h3>Total AI Tools</h3>

              <h1>4+</h1>

              <p>

                Available productivity tools.

              </p>

            </div>

            <div className="analytics-card">

              <h3>Models Ready</h3>

              <h1>3</h1>

              <p>

                Local AI models connected.

              </p>

            </div>

            <div className="analytics-card">

              <h3>Workspace</h3>

              <h1>24/7</h1>

              <p>

                Always available for development.

              </p>

            </div>

            <div className="analytics-card">

              <h3>Version</h3>

              <h1>0.1</h1>

              <p>

                Current Alpha release.

              </p>

            </div>

          </div>

        </section>

        {/* =========================
            PART 2 CONTINUES HERE
        ========================= */}
                {/* =========================
            ACTIVITY + MODELS
        ========================= */}

        <section className="dashboard-bottom">

          {/* Activity */}

          <div className="activity-panel">

            <h2>📌 Recent Activity</h2>

            <div className="timeline">

              <div className="timeline-item">

                <div className="timeline-dot"></div>

                <div className="timeline-content">

                  <h4>AI Chat Workspace Ready</h4>

                  <p>
                    Chat module successfully integrated with the
                    Enlivonex AI ecosystem.
                  </p>

                </div>

              </div>

              <div className="timeline-item">

                <div className="timeline-dot"></div>

                <div className="timeline-content">

                  <h4>Dashboard Redesigned</h4>

                  <p>
                    Premium glassmorphism dashboard completed
                    with responsive layout.
                  </p>

                </div>

              </div>

              <div className="timeline-item">

                <div className="timeline-dot"></div>

                <div className="timeline-content">

                  <h4>Upcoming Features</h4>

                  <p>
                    Image Generator, Script Generator and AI
                    Marketplace are under development.
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* Models */}

          <div className="models-panel">

            <h2>🧠 AI Models</h2>

            <div className="model-list">

              <div className="model-card">

                <div>

                  <h4>Ollama</h4>

                  <span>Local AI Engine</span>

                </div>

                <span className="model-status">

                  Online

                </span>

              </div>

              <div className="model-card">

                <div>

                  <h4>Llama 3</h4>

                  <span>Language Model</span>

                </div>

                <span className="model-status">

                  Ready

                </span>

              </div>

              <div className="model-card">

                <div>

                  <h4>Gemma</h4>

                  <span>Assistant Model</span>

                </div>

                <span className="model-status">

                  Ready

                </span>

              </div>

            </div>

          </div>

        </section>

        {/* =========================
            ROADMAP
        ========================= */}

        <section className="dashboard-roadmap">

          <h2>🛣 Development Roadmap</h2>

          <p className="roadmap-subtitle">

            Building the complete Enlivonex AI ecosystem.

          </p>

          <div className="roadmap-grid">

            <div className="roadmap-card completed">

              <div className="roadmap-icon">

                ✅

              </div>

              <h3>Foundation</h3>

              <p>

                Landing Page, Hero Section,
                Dashboard UI and project structure.

              </p>

            </div>

            <div className="roadmap-card progress">

              <div className="roadmap-icon">

                ⚡

              </div>

              <h3>Current Phase</h3>

              <p>

                AI Chat integration,
                Code Assistant and backend APIs.

              </p>

            </div>

            <div className="roadmap-card future">

              <div className="roadmap-icon">

                🚀

              </div>

              <h3>Future Vision</h3>

              <p>

                AI Marketplace,
                Voice Assistant,
                Team Workspace,
                Enlivonex Cloud
                and AI Operating System.

              </p>

            </div>

          </div>

        </section>

        {/* =========================
            FOOTER CTA
        ========================= */}

        <section className="workspace-footer">

          <h2>

            Build The Future With AI

          </h2>

          <p>

            Enlivonex AI Hub is designed to become one
            intelligent workspace where developers,
            creators and innovators build the next
            generation of technology.

          </p>

          <Link
            to="/chat"
            className="action-btn"
          >

            🚀 Start Building

          </Link>

        </section>

      </main>

    </div>

  );

}

export default Dashboard;
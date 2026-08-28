import "./About.css";

function About() {
  const progress = [
    "✅ Responsive React Frontend",
    "✅ Express Backend APIs",
    "✅ MongoDB Database",
    "✅ AI Chat with Ollama",
    "✅ Session Management",
    "✅ Contact System",
    "✅ Workspace Dashboard",
    "✅ Team Workspace",
    "✅ Workspace Projects",
    "✅ Workspace Sessions",
    "✅ Workspace Member Management",
    "✅ Workspace Sharing",
    "✅ Workspace Usage Tracking",
    "✅ AI Code Assistant",
    "🚧 Authentication & advanced security",
    "🚧 Cloud AI Models",
    "🚧 AI Image Generator",
    "🚧 Script Generator",
  ];

  const roadmap = [
    "🚀 v0.1 — AI Chat Foundation",
    "⚡ v0.2 — AI Workspace & Collaboration",
    "💻 v0.3 — Advanced Code Assistant",
    "🎨 v0.4 — Image Generation",
    "📝 v0.5 — Script Generator",
    "🔐 v0.6 — Authentication & User Accounts",
    "☁️ v0.7 — Cloud AI Models",
    "🌍 v0.8 — Community & Collaboration",
    "💎 v0.9 — Premium AI Hub",
    "🏆 v1.0 — Stable Public Release",
  ];

  const tech = [
    "⚛ React.js",
    "🟢 Node.js",
    "🚂 Express.js",
    "🍃 MongoDB",
    "🤖 Ollama",
    "💻 JavaScript",
    "🔗 REST APIs",
    "🐙 Git & GitHub",
  ];

  return (
    <section className="about-page">

      {/* =======================================
          HERO
      ======================================== */}

      <div className="about-hero">

        <span className="about-kicker">
          ENLIVONEX AI HUB • PROJECT INFORMATION
        </span>

        <h1>
          🚀 About Enlivonex AI Hub
        </h1>

        <p className="about-intro">
          Enlivonex AI Hub is an AI-powered productivity platform
          designed to bring intelligent tools, development assistance
          and collaborative workspaces into one unified ecosystem.
        </p>

        <div className="about-version-row">

          <span className="about-version-badge">
            VERSION 0.2 ALPHA
          </span>

          <span className="about-status-badge">
            <span className="about-status-dot"></span>
            Active Development
          </span>

        </div>

      </div>


      {/* =======================================
          STATS
      ======================================== */}

      <div className="about-stats">

        <div className="stat-card">

          <span className="stat-icon">
            ⚡
          </span>

          <h2>
            0.2
          </h2>

          <p>
            Current Version
          </p>

        </div>


        <div className="stat-card">

          <span className="stat-icon">
            🤖
          </span>

          <h2>
            4+
          </h2>

          <p>
            AI Capabilities
          </p>

        </div>


        <div className="stat-card">

          <span className="stat-icon">
            👥
          </span>

          <h2>
            Team
          </h2>

          <p>
            Workspace Support
          </p>

        </div>


        <div className="stat-card">

          <span className="stat-icon">
            ∞
          </span>

          <h2>
            Future
          </h2>

          <p>
            Possibilities
          </p>

        </div>

      </div>


      {/* =======================================
          MAIN INFORMATION
      ======================================== */}

      <div className="about-container">


        {/* ===================================
            MISSION
        ==================================== */}

        <div className="about-card about-card-featured">

          <div className="about-card-icon">
            🎯
          </div>

          <span className="about-card-label">
            PURPOSE
          </span>

          <h2>
            Our Mission
          </h2>

          <p>
            Our mission is to make Artificial Intelligence easier
            to access and use by bringing multiple AI capabilities
            into one practical workspace.
          </p>

          <p>
            Enlivonex AI Hub is being designed for students,
            developers, creators, entrepreneurs and anyone who
            wants to learn, create and experiment with AI.
          </p>

        </div>


        {/* ===================================
            VISION
        ==================================== */}

        <div className="about-card">

          <div className="about-card-icon">
            🌍
          </div>

          <span className="about-card-label">
            LONG-TERM VISION
          </span>

          <h2>
            Our Vision
          </h2>

          <p>
            Enlivonex AI Hub is only the beginning.
          </p>

          <p>
            The long-term vision is to build
            <strong> Enlivonex </strong>
            into a technology ecosystem focused on Artificial
            Intelligence, developer tools, software, operating
            systems and future hardware innovation.
          </p>

        </div>


        {/* ===================================
            WHY
        ==================================== */}

        <div className="about-card">

          <div className="about-card-icon">
            💡
          </div>

          <span className="about-card-label">
            THE IDEA
          </span>

          <h2>
            Why Enlivonex?
          </h2>

          <p>
            Modern AI tools are often separated across different
            platforms and services.
          </p>

          <p>
            Enlivonex aims to create one ecosystem where users can
            chat with AI, work on code, manage projects and
            collaborate without constantly switching platforms.
          </p>

        </div>


        {/* ===================================
            FOUNDER
        ==================================== */}

        <div className="about-card">

          <div className="about-card-icon">
            👨‍💻
          </div>

          <span className="about-card-label">
            CREATOR
          </span>

          <h2>
            Founder
          </h2>

          <p>
            <strong>
              Sagar Kunte
            </strong>
          </p>

          <p>
            Student Developer • AI Enthusiast • Future Entrepreneur
          </p>

          <p>
            Enlivonex is being developed with the goal of creating
            useful, affordable and future-ready technology products.
          </p>

        </div>


        {/* ===================================
            VERSION
        ==================================== */}

        <div className="about-card about-card-wide">

          <div className="about-card-icon">
            🚀
          </div>

          <span className="about-card-label">
            CURRENT RELEASE
          </span>

          <h2>
            Version 0.2 Alpha
          </h2>

          <p>
            Version 0.2 represents a major step beyond the original
            foundation release.
          </p>

          <div className="release-highlights">

            <div>
              <strong>
                Workspace
              </strong>

              <span>
                Collaborative team environment
              </span>
            </div>

            <div>
              <strong>
                Projects
              </strong>

              <span>
                Workspace project organization
              </span>
            </div>

            <div>
              <strong>
                AI Sessions
              </strong>

              <span>
                Workspace-based AI conversations
              </span>
            </div>

            <div>
              <strong>
                Code Assistant
              </strong>

              <span>
                AI-powered development assistance
              </span>
            </div>

            <div>
              <strong>
                Sharing
              </strong>

              <span>
                Workspace resource sharing
              </span>
            </div>

            <div>
              <strong>
                Usage
              </strong>

              <span>
                Workspace usage information
              </span>
            </div>

          </div>

        </div>


        {/* ===================================
            PROGRESS
        ==================================== */}

        <div className="about-card">

          <div className="about-card-icon">
            📈
          </div>

          <span className="about-card-label">
            DEVELOPMENT
          </span>

          <h2>
            Development Progress
          </h2>

          <ul className="progress-list">

            {progress.map((item, index) => (
              <li key={index}>
                {item}
              </li>
            ))}

          </ul>

        </div>


        {/* ===================================
            ROADMAP
        ==================================== */}

        <div className="about-card about-card-wide">

          <div className="about-card-icon">
            🛣
          </div>

          <span className="about-card-label">
            WHAT COMES NEXT
          </span>

          <h2>
            Product Roadmap
          </h2>

          <div className="roadmap-list">

            {roadmap.map((item, index) => {

              const [version, ...description] =
                item.split(" — ");

              return (
                <div
                  className={
                    `roadmap-item ${
                      index === 1
                        ? "current"
                        : ""
                    }`
                  }
                  key={index}
                >

                  <span className="roadmap-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>

                    <strong>
                      {version}
                    </strong>

                    <p>
                      {description.join(" — ")}
                    </p>

                  </div>

                </div>
              );

            })}

          </div>

        </div>


        {/* ===================================
            TECH STACK
        ==================================== */}

        <div className="about-card">

          <div className="about-card-icon">
            ⚙
          </div>

          <span className="about-card-label">
            ENGINEERING
          </span>

          <h2>
            Technology Stack
          </h2>

          <div className="tech-list">

            {tech.map((item, index) => (
              <span
                className="tech-pill"
                key={index}
              >
                {item}
              </span>
            ))}

          </div>

        </div>


        {/* ===================================
            OPEN DEVELOPMENT
        ==================================== */}

        <div className="about-card">

          <div className="about-card-icon">
            🌐
          </div>

          <span className="about-card-label">
            DEVELOPMENT MODEL
          </span>

          <h2>
            Open Development
          </h2>

          <p>
            Enlivonex AI Hub is being developed as an evolving
            technology project where every version represents
            a new stage of learning, experimentation and improvement.
          </p>

          <p>
            The project will continue to evolve as new AI
            capabilities, collaboration systems and developer
            tools are introduced.
          </p>

        </div>


        {/* ===================================
            CONTACT
        ==================================== */}

        <div className="about-card about-card-contact">

          <div className="about-card-icon">
            📧
          </div>

          <span className="about-card-label">
            CONNECT
          </span>

          <h2>
            Official Contact
          </h2>

          <div className="contact-info">

            <div>
              <span>
                Email
              </span>

              <strong>
                enlivonexofficial@gmail.com
              </strong>
            </div>


            <div>
              <span>
                GitHub
              </span>

              <strong>
                github.com/Enlivonex
              </strong>
            </div>


            <div>
              <span>
                Status
              </span>

              <strong className="contact-active">
                🚀 Active Development
              </strong>
            </div>

          </div>

        </div>

      </div>


      {/* =======================================
          FINAL VISION
      ======================================== */}

      <div className="about-final">

        <span>
          🌌 ENLIVONEX
        </span>

        <h2>
          Building More Than an AI Platform.
        </h2>

        <p>
          From AI software to developer tools and future
          technology products, Enlivonex is being built
          step by step toward a larger vision.
        </p>

        <div className="about-final-line"></div>

        <small>
          Version 0.2 Alpha • Active Development
        </small>

      </div>

    </section>
  );
}

export default About;
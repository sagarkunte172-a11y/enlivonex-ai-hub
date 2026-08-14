import "./Home.css";
import Hero from "../components/Hero";

function Home() {

  const features = [

    {
      icon: "🤖",
      title: "AI Chat",
      desc:
        "Chat with powerful AI models from one clean workspace using local and cloud intelligence.",
      status: "Available"
    },

    {
      icon: "💻",
      title: "Code Assistant",
      desc:
        "Generate, debug and optimize code across multiple programming languages effortlessly.",
      status: "Available"
    },

    {
      icon: "🎨",
      title: "Image Generator",
      desc:
        "Create high-quality AI generated artwork from simple natural language prompts.",
      status: "Coming Soon"
    },

    {
      icon: "📝",
      title: "Script Generator",
      desc:
        "Generate YouTube scripts, blogs, captions and creative writing instantly.",
      status: "Coming Soon"
    },

    {
      icon: "🧠",
      title: "Multiple AI Models",
      desc:
        "Switch between local AI models and future cloud models without leaving the platform.",
      status: "Future"
    },

    {
      icon: "⚡",
      title: "Lightning Fast",
      desc:
        "Built using React, Node.js, MongoDB and optimized APIs for maximum performance.",
      status: "Available"
    }

  ];

  return (

    <div className="home-page">

      {/* ======================================
              HERO
      ======================================= */}

      <Hero />

      {/* ======================================
            WHY ENLIVONEX
      ======================================= */}

      <section className="why-section">

        <div className="section-heading">

          <span className="section-badge">

            🚀 Why Enlivonex?

          </span>

          <h2>

            One Platform.
            <br />

            Endless AI Possibilities.

          </h2>

          <p>

            Enlivonex AI Hub combines multiple AI tools into one
            unified ecosystem so students, developers and creators
            can focus on creating instead of switching platforms.

          </p>

        </div>

        <div className="why-grid">

          <div className="why-card">

            <div className="why-icon">

              ⚡

            </div>

            <h3>

              Fast & Lightweight

            </h3>

            <p>

              Optimized architecture built with React and Node.js
              for an incredibly smooth user experience.

            </p>

          </div>

          <div className="why-card">

            <div className="why-icon">

              🛡️

            </div>

            <h3>

              Secure & Open

            </h3>

            <p>

              User privacy and transparency remain at the center
              of every feature we build.

            </p>

          </div>

          <div className="why-card">

            <div className="why-icon">

              🌍

            </div>

            <h3>

              Built for Everyone

            </h3>

            <p>

              Whether you're learning programming or building
              startups, Enlivonex grows with you.

            </p>

          </div>

        </div>

      </section>

      {/* ======================================
               AI TOOLS
      ======================================= */}

      <section className="tools-section">

        <div className="section-heading">

          <span className="section-badge">

            🤖 AI Workspace

          </span>

          <h2>

            Powerful AI Tools
            <br />

            Inside One Dashboard

          </h2>

          <p>

            Every release brings new capabilities designed to
            simplify your workflow and increase productivity.

          </p>

        </div>

        <div className="tools-grid">

          {

            features.map((tool, index) => (

              <div
                className="tool-card"
                key={index}
              >

                <span className={`tool-status ${tool.status}`}>

                  {tool.status}

                </span>

                <div className="tool-icon">

                  {tool.icon}

                </div>

                <h3>

                  {tool.title}

                </h3>

                <p>

                  {tool.desc}

                </p>

              </div>

            ))

          }

        </div>

      </section>
            {/* ======================================
            DEVELOPMENT PROGRESS
      ======================================= */}

      <section className="progress-section">

        <div className="section-heading">

          <span className="section-badge">

            📈 Development Progress

          </span>

          <h2>

            Building the Future
            <br />

            One Version at a Time

          </h2>

          <p>

            Enlivonex AI Hub is under active development.
            Every release introduces new capabilities while
            keeping the platform stable and lightweight.

          </p>

        </div>

        <div className="progress-grid">

          <div className="progress-card">

            <h3>

              Current Version

            </h3>

            <h1>

              v0.1 Alpha

            </h1>

            <p>

              Foundation Release

            </p>

          </div>

          <div className="progress-card">

            <h3>

              Completed

            </h3>

            <ul>

              <li>✅ React Frontend</li>

              <li>✅ Express Backend</li>

              <li>✅ MongoDB Database</li>

              <li>✅ AI Chat</li>

              <li>✅ Contact System</li>

            </ul>

          </div>

          <div className="progress-card">

            <h3>

              Coming Soon

            </h3>

            <ul>

              <li>🚧 Image Generator</li>

              <li>🚧 AI Workspace</li>

              <li>🚧 Authentication</li>

              <li>🚧 Cloud AI Models</li>

              <li>🚧 Team Collaboration</li>

            </ul>

          </div>

        </div>

      </section>

      {/* ======================================
              ROADMAP
      ======================================= */}

      <section className="roadmap-section">

        <div className="section-heading">

          <span className="section-badge">

            🛣 Product Roadmap

          </span>

          <h2>

            Our Journey Ahead

          </h2>

        </div>

        <div className="roadmap-grid">

          <div className="roadmap-card">

            <h3>

              🚀 v0.1

            </h3>

            <p>

              AI Chat, Backend,
              MongoDB Integration

            </p>

          </div>

          <div className="roadmap-card">

            <h3>

              🎨 v0.2

            </h3>

            <p>

              Image Generation
              using AI Models

            </p>

          </div>

          <div className="roadmap-card">

            <h3>

              ⚡ v0.5

            </h3>

            <p>

              Cloud AI,
              Workspace &
              Collaboration

            </p>

          </div>

          <div className="roadmap-card">

            <h3>

              🌍 v1.0

            </h3>

            <p>

              Stable Public
              Release

            </p>

          </div>

        </div>

      </section>

      {/* ======================================
              FINAL CTA
      ======================================= */}

      <section className="vision-section">

        <div className="vision-card">

          <span className="section-badge">

            🌍 Enlivonex Vision

          </span>

          <h2>

            Beyond an AI Platform

          </h2>

          <p>

            Enlivonex AI Hub is only the beginning.
            Our long-term vision is to build a complete
            ecosystem of AI software, developer tools,
            cloud services and future hardware products
            that empower millions of creators worldwide.

          </p>

          <div className="vision-buttons">

            <button className="primary-btn">

              Join Our Journey

            </button>

            <button className="secondary-btn">

              Explore GitHub

            </button>

          </div>

        </div>

      </section>

    </div>

  );

}

export default Home;
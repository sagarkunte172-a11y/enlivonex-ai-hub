import "./Home.css";
import Hero from "../components/Hero";

function Home() {

  const features = [

    {
      icon: "🤖",
      title: "AI Chat",
      desc:
        "Chat with AI through a clean workspace with conversation sessions, backend integration and persistent data support.",
      status: "Available"
    },

    {
      icon: "💻",
      title: "Code Assistant",
      desc:
        "Generate, understand, debug and improve code through the integrated Enlivonex AI Code Assistant.",
      status: "Available"
    },

    {
      icon: "🧩",
      title: "AI Workspace",
      desc:
        "A dedicated workspace environment for organizing AI conversations, projects, members and productivity workflows.",
      status: "Available"
    },

    {
      icon: "🎨",
      title: "Image Generator",
      desc:
        "Generate AI-powered images from natural language prompts. This module is currently under development.",
      status: "Coming Soon"
    },

    {
      icon: "📝",
      title: "Script Generator",
      desc:
        "Create YouTube scripts, short-form content, captions and other creative content with AI.",
      status: "Coming Soon"
    },

    {
      icon: "🧠",
      title: "Multiple AI Models",
      desc:
        "Switch between different local and future cloud AI models while keeping the same Enlivonex workspace experience.",
      status: "Future"
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

            Enlivonex AI Hub brings AI tools, development
            assistance and collaborative workspaces together
            inside one unified ecosystem.

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

              Built with a lightweight React and Node.js
              architecture designed to keep the platform
              responsive and easy to evolve.

            </p>

          </div>


          <div className="why-card">

            <div className="why-icon">

              🛡️

            </div>

            <h3>

              Built With Privacy in Mind

            </h3>

            <p>

              Enlivonex is designed around controlled data,
              modular services and a transparent development
              approach as the platform continues to evolve.

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

              From students and developers to creators and
              future innovators, Enlivonex aims to provide
              useful AI tools without unnecessary complexity.

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

            Inside One Platform

          </h2>

          <p>

            The Enlivonex AI Hub is gradually expanding from
            AI Chat into a complete AI workspace with coding,
            generation and collaboration capabilities.

          </p>

        </div>


        <div className="tools-grid">

          {

            features.map((tool, index) => (

              <div
                className="tool-card"
                key={index}
              >


                <span
                  className={`tool-status ${
                    tool.status === "Available"
                      ? "available"
                      : tool.status === "Coming Soon"
                        ? "coming"
                        : "future"
                  }`}
                >

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

            Enlivonex AI Hub is currently in active Alpha
            development. Version 0.2 expands the original
            AI foundation with a dedicated workspace and
            integrated Code Assistant experience.

          </p>

        </div>


        <div className="progress-grid">


          <div className="progress-card">

            <h3>

              Current Version

            </h3>

            <h1>

              v0.2 Alpha

            </h1>

            <p>

              Workspace & AI Development Release

            </p>

          </div>


          <div className="progress-card">

            <h3>

              Completed

            </h3>

            <ul>

              <li>✅ React Frontend</li>

              <li>✅ Express Backend</li>

              <li>✅ MongoDB Integration</li>

              <li>✅ AI Chat</li>

              <li>✅ Session Management</li>

              <li>✅ Contact System</li>

              <li>✅ AI Workspace</li>

              <li>✅ Code Assistant</li>

            </ul>

          </div>


          <div className="progress-card">

            <h3>

              Coming Soon

            </h3>

            <ul>

              <li>🚧 AI Image Generator</li>

              <li>🚧 Script Generator</li>

              <li>🚧 Authentication</li>

              <li>🚧 Cloud AI Models</li>

              <li>🚧 Advanced Collaboration</li>

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

          <p>

            The roadmap will continue evolving as Enlivonex
            moves from its Alpha foundation toward a complete
            AI ecosystem.

          </p>

        </div>


        <div className="roadmap-grid">


          <div className="roadmap-card">

            <h3>

              🚀 v0.2

            </h3>

            <p>

              AI Workspace,
              Code Assistant
              and platform refinement.

            </p>

          </div>


          <div className="roadmap-card">

            <h3>

              🎨 v0.3

            </h3>

            <p>

              AI Image Generation
              and expanded creative
              AI capabilities.

            </p>

          </div>


          <div className="roadmap-card">

            <h3>

              🧠 v0.5

            </h3>

            <p>

              Authentication,
              cloud AI models,
              advanced workspace
              and collaboration.

            </p>

          </div>


          <div className="roadmap-card">

            <h3>

              🌍 v1.0

            </h3>

            <p>

              Stable public release
              of the Enlivonex AI Hub
              ecosystem.

            </p>

          </div>


        </div>

      </section>


      {/* ======================================
              FINAL CTA / VISION
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
            The long-term vision is to create a complete
            technology ecosystem combining AI software,
            developer tools, collaborative workspaces,
            cloud services and future hardware products.

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
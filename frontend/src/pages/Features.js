import "./Features.css";

function Features() {

const availableTools = [


{
  icon: "🤖",
  title: "AI Chat",
  status: "Available",
  desc:
    "Chat with local AI models using Ollama with session history and MongoDB integration."
},

{
  icon: "💻",
  title: "Code Assistant",
  status: "Available",
  desc:
    "Generate, analyze, debug and improve code inside the Enlivonex AI Workspace."
},

{
  icon: "🎨",
  title: "Image Generator",
  status: "Coming Soon",
  desc:
    "Generate high-quality AI images using future local and cloud-based image models."
},

{
  icon: "📝",
  title: "Script Generator",
  status: "Coming Soon",
  desc:
    "Create YouTube scripts, Shorts ideas, captions, blogs and other creative content with AI."
},

{
  icon: "👥",
  title: "Team Workspace",
  status: "Alpha",
  desc:
    "Collaborative workspace architecture for projects, team members, shared conversations and productivity."
},

{
  icon: "📄",
  title: "PDF AI",
  status: "Future",
  desc:
    "Analyze documents, summarize PDFs and interact with uploaded files using AI."
},

{
  icon: "🎙",
  title: "Voice Assistant",
  status: "Future",
  desc:
    "Interact with AI using natural voice conversations and future speech capabilities."
},

{
  icon: "📊",
  title: "Data Analyzer",
  status: "Future",
  desc:
    "Analyze CSV, Excel files and datasets using intelligent AI-powered tools."
}


];

const progress = [


"✅ React Frontend",
"✅ Express Backend",
"✅ MongoDB Database",
"✅ AI Chat",
"✅ Session Management",
"✅ Contact System",
"✅ AI Workspace",
"✅ Code Assistant",
"🚧 Authentication",
"🚧 Cloud AI Models",
"🚧 Image Generation",
"🚧 Script Generator",
"🚧 Advanced Team Collaboration"


];

const roadmap = [


{
  version: "v0.1",
  title: "Foundation",
  desc: "AI Chat, Express backend and MongoDB integration.",
  status: "Completed"
},

{
  version: "v0.2",
  title: "AI Workspace",
  desc: "Workspace architecture, Code Assistant and collaborative foundations.",
  status: "Current"
},

{
  version: "v0.3",
  title: "Image Generation",
  desc: "AI-powered image generation and media workflows.",
  status: "Planned"
},

{
  version: "v0.4",
  title: "Script Generator",
  desc: "AI-powered scripts, captions and creative content generation.",
  status: "Planned"
},

{
  version: "v0.5",
  title: "Authentication",
  desc: "Secure accounts, user identity and personalized AI experiences.",
  status: "Planned"
},

{
  version: "v0.6",
  title: "Cloud AI",
  desc: "Integration with multiple cloud-based AI models and services.",
  status: "Planned"
},

{
  version: "v0.7",
  title: "Collaboration",
  desc: "Advanced team projects, sharing and collaborative workflows.",
  status: "Planned"
},

{
  version: "v1.0",
  title: "Stable Release",
  desc: "A polished, stable and publicly ready Enlivonex AI Hub.",
  status: "Future"
}


];

const tech = [


"⚛ React",
"🟢 Node.js",
"🚂 Express",
"🍃 MongoDB",
"🤖 Ollama",
"💻 JavaScript",
"🔗 REST APIs",
"🐙 Git & GitHub"


];

return (


<section className="features-page">

  {/* ======================================
          HERO
  ======================================= */}

  <div className="features-hero">

    <span className="features-kicker">
      🚀 ENLIVONEX AI HUB
    </span>

    <h1>
      AI Tools.
      <br />
      <span>One Unified Workspace.</span>
    </h1>

    <p>
      Explore the capabilities currently available inside Enlivonex AI Hub,
      the features under active development and the technologies powering
      the platform.
    </p>

    <div className="features-hero-meta">

      <span className="version-badge">
        Current Build • v0.2 Alpha
      </span>

      <span className="development-status">
        <i></i>
        Active Development
      </span>

    </div>

  </div>


  {/* ======================================
          AI TOOLS
  ======================================= */}

  <section className="features-tools-section">

    <div className="section-heading">

      <span className="section-badge">
        🤖 AI Ecosystem
      </span>

      <h2>
        Everything Starts
        <br />
        Inside One Hub.
      </h2>

      <p>
        Enlivonex is being designed as a unified AI ecosystem where
        different intelligent tools can work together instead of forcing
        users to constantly switch between platforms.
      </p>

    </div>

    <div className="feature-grid">

      {
        availableTools.map((tool, index) => (

          <article
            className="feature-card"
            key={index}
          >

            <div className="feature-card-glow"></div>

            <div className="feature-card-top">

              <div className="feature-icon">
                {tool.icon}
              </div>

              <span
                className={`status ${tool.status
                  .replace(/\s/g, "")
                  .toLowerCase()}`}
              >
                {tool.status}
              </span>

            </div>

            <h3>
              {tool.title}
            </h3>

            <p>
              {tool.desc}
            </p>

            <div className="feature-card-line"></div>

          </article>

        ))
      }

    </div>

  </section>


  {/* ======================================
          DEVELOPMENT
  ======================================= */}

  <section className="development-section">

    <div className="section-heading">

      <span className="section-badge">
        📈 Development Status
      </span>

      <h2>
        Building Step
        <br />
        By Step.
      </h2>

      <p>
        Enlivonex AI Hub is still an Alpha project. Features are being
        introduced gradually while the underlying architecture continues
        to evolve.
      </p>

    </div>

    <div className="feature-bottom">

      {/* PROGRESS */}

      <div className="info-box">

        <div className="info-box-header">

          <span className="info-box-icon">
            📈
          </span>

          <div>
            <h2>Development Progress</h2>
            <p>Current platform status</p>
          </div>

        </div>

        <ul>

          {
            progress.map((item, index) => (

              <li key={index}>
                {item}
              </li>

            ))
          }

        </ul>

      </div>


      {/* TECHNOLOGY */}

      <div className="info-box">

        <div className="info-box-header">

          <span className="info-box-icon">
            ⚙️
          </span>

          <div>
            <h2>Technology Stack</h2>
            <p>Core technologies powering the hub</p>
          </div>

        </div>

        <ul>

          {
            tech.map((item, index) => (

              <li key={index}>
                {item}
              </li>

            ))
          }

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
        From Alpha
        <br />
        To Ecosystem.
      </h2>

      <p>
        The roadmap represents the planned evolution of Enlivonex AI Hub.
        Features may change as development and testing continue.
      </p>

    </div>

    <div className="roadmap-grid">

      {
        roadmap.map((item, index) => (

          <article
            className={`roadmap-card roadmap-${item.status
              .toLowerCase()}`}
            key={index}
          >

            <div className="roadmap-number">
              {String(index + 1).padStart(2, "0")}
            </div>

            <div className="roadmap-content">

              <div className="roadmap-top">

                <span className="roadmap-version">
                  {item.version}
                </span>

                <span className="roadmap-status">
                  {item.status}
                </span>

              </div>

              <h3>
                {item.title}
              </h3>

              <p>
                {item.desc}
              </p>

            </div>

          </article>

        ))
      }

    </div>

  </section>


  {/* ======================================
          VISION
  ======================================= */}

  <section className="vision-section">

    <div className="vision-card">

      <div className="vision-orb orb-one"></div>
      <div className="vision-orb orb-two"></div>

      <span className="section-badge">
        🌍 Future Vision
      </span>

      <h2>
        More Than
        <br />
        An AI Tool.
      </h2>

      <p>
        Enlivonex AI Hub is the foundation for a larger technology
        ecosystem. The long-term vision includes intelligent software,
        developer tools, cloud AI services, collaborative workspaces and
        eventually future hardware products under the Enlivonex brand.
      </p>

      <div className="vision-points">

        <span>🤖 Artificial Intelligence</span>
        <span>💻 Developer Tools</span>
        <span>👥 Collaboration</span>
        <span>🌐 Cloud Services</span>

      </div>

    </div>

  </section>

</section>


);

}

export default Features;

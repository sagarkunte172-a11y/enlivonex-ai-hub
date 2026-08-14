import "./Features.css";

function Features() {

  const availableTools = [

    {
      icon: "🤖",
      title: "AI Chat",
      status: "Available",
      desc: "Chat with local AI models using Ollama with session history and MongoDB integration."
    },

    {
      icon: "💻",
      title: "Code Assistant",
      status: "Coming Soon",
      desc: "Generate, debug and optimize code for multiple programming languages."
    },

    {
      icon: "🎨",
      title: "Image Generator",
      status: "Coming Soon",
      desc: "Generate beautiful AI images using local and cloud image models."
    },

    {
      icon: "📝",
      title: "Script Generator",
      status: "Coming Soon",
      desc: "Generate YouTube, Instagram, Shorts and blog content instantly."
    },

    {
      icon: "📄",
      title: "PDF AI",
      status: "Future",
      desc: "Ask questions from PDFs and summarize long documents."
    },

    {
      icon: "🎙",
      title: "Voice Assistant",
      status: "Future",
      desc: "Talk with AI using voice conversations."
    },

    {
      icon: "🌍",
      title: "Translator",
      status: "Future",
      desc: "Translate text into multiple languages with AI."
    },

    {
      icon: "📊",
      title: "Data Analyzer",
      status: "Future",
      desc: "Analyze CSV, Excel and datasets using AI."
    }

  ];

  const progress = [

    "✅ React Frontend",
    "✅ Express Backend",
    "✅ MongoDB Database",
    "✅ AI Chat",
    "✅ Session Management",
    "✅ Contact System",
    "🚧 Authentication",
    "🚧 Cloud AI",
    "🚧 Image Generation",
    "🚧 Script Generator"

  ];

  const roadmap = [

    "🚀 Version 0.1 — AI Chat",
    "🚀 Version 0.2 — Image Generator",
    "🚀 Version 0.3 — Code Assistant",
    "🚀 Version 0.4 — Script Generator",
    "🚀 Version 0.5 — Authentication",
    "🚀 Version 0.6 — Cloud AI Models",
    "🚀 Version 0.7 — AI Workspace",
    "🏆 Version 1.0 — Stable Release"

  ];

  const tech = [

    "⚛ React",
    "🟢 Node.js",
    "🚂 Express",
    "🍃 MongoDB",
    "🤖 Ollama",
    "💻 JavaScript",
    "🔗 REST APIs",
    "🐙 GitHub"

  ];

  return (

    <section className="features-page">

      {/* Hero */}

      <div className="features-hero">

        <h1>🚀 Enlivonex AI Features</h1>

        <p>

          Everything you need to create, learn and build with Artificial
          Intelligence — all inside one unified platform.

        </p>

        <span className="version-badge">

          Current Version • v0.1 Alpha

        </span>

      </div>

      {/* AI Tools */}

      <h2 className="section-title">

        🤖 AI Tools

      </h2>

      <div className="feature-grid">

        {

          availableTools.map((tool,index)=>(

            <div className="feature-card" key={index}>

              <div className="feature-icon">

                {tool.icon}

              </div>

              <h3>{tool.title}</h3>

              <span className={`status ${tool.status.replace(/\s/g,"")}`}>

                {tool.status}

              </span>

              <p>{tool.desc}</p>

            </div>

          ))

        }

      </div>

      {/* Bottom Grid */}

      <div className="feature-bottom">

        {/* Progress */}

        <div className="info-box">

          <h2>

            📈 Development Progress

          </h2>

          <ul>

            {

              progress.map((item,index)=>(

                <li key={index}>{item}</li>

              ))

            }

          </ul>

        </div>

        {/* Tech */}

        <div className="info-box">

          <h2>

            ⚙ Technology Stack

          </h2>

          <ul>

            {

              tech.map((item,index)=>(

                <li key={index}>{item}</li>

              ))

            }

          </ul>

        </div>

      </div>

      {/* Roadmap */}

      <div className="roadmap">

        <h2>

          🛣 Product Roadmap

        </h2>

        <div className="roadmap-grid">

          {

            roadmap.map((item,index)=>(

              <div className="roadmap-card" key={index}>

                {item}

              </div>

            ))

          }

        </div>

      </div>

      {/* Vision */}

      <div className="vision-card">

        <h2>

          🌍 Future Vision

        </h2>

        <p>

          Enlivonex AI Hub is only the first step.

          Our long-term goal is to create a complete AI ecosystem that
          combines intelligent software, cloud AI services, productivity
          tools and future hardware products under one platform.

        </p>

      </div>

    </section>

  );

}

export default Features;
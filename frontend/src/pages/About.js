import "./About.css";

function About() {

  return (

    <section className="about-page">

      {/* =======================================
                HERO SECTION
      ======================================== */}

      <div className="about-hero">

        <h1>🚀 About Enlivonex AI Hub</h1>

        <p className="about-intro">

          Enlivonex AI Hub is an AI-powered productivity platform created to
          bring multiple Artificial Intelligence tools into one seamless
          workspace. We believe AI should be affordable, accessible and useful
          for everyone — from students and developers to creators and future
          innovators.

        </p>

      </div>

      {/* =======================================
                STATS
      ======================================== */}

      <div className="about-stats">

        <div className="stat-card">

          <h2>0.1</h2>

          <p>Current Version</p>

        </div>

        <div className="stat-card">

          <h2>8+</h2>

          <p>Planned AI Tools</p>

        </div>

        <div className="stat-card">

          <h2>24/7</h2>

          <p>Development</p>

        </div>

        <div className="stat-card">

          <h2>∞</h2>

          <p>Future Possibilities</p>

        </div>

      </div>

      {/* =======================================
                MAIN CARDS
      ======================================== */}

      <div className="about-container">

        {/* Mission */}

        <div className="about-card">

          <h2>🎯 Our Mission</h2>

          <p>

            Our mission is to simplify Artificial Intelligence by creating
            one platform where users can access AI Chat, Coding Assistance,
            Image Generation, Script Writing and many future AI services
            without switching between multiple websites.

          </p>

        </div>

        {/* Vision */}

        <div className="about-card">

          <h2>🌍 Our Vision</h2>

          <p>

            Enlivonex AI Hub is only the beginning.

            <br /><br />

            Our long-term vision is to build

            <strong> Enlivonex </strong>

            into a global technology company focused on Artificial
            Intelligence, innovative software, operating systems and
            modular smartphone technology.

          </p>

        </div>

        {/* Why */}

        <div className="about-card">

          <h2>💡 Why Enlivonex?</h2>

          <p>

            Most AI platforms provide only one specific feature.

            <br /><br />

            Enlivonex aims to combine multiple AI capabilities into one
            powerful ecosystem, making productivity faster, simpler and
            smarter.

          </p>

        </div>

        {/* Founder */}

        <div className="about-card">

          <h2>👨‍💻 Founder</h2>

          <p>

            <strong>Sagar Kunte</strong>

            <br /><br />

            Student Developer • AI Enthusiast • Future Entrepreneur

            <br /><br />

            Building Enlivonex with the vision of creating useful,
            affordable and future-ready AI products for everyone.

          </p>

        </div>

        {/* Version */}

        <div className="about-card">

          <h2>📌 Current Version</h2>

          <p>

            <strong>Version 0.1 Alpha</strong>

            <br /><br />

            This release establishes the foundation of the platform with

            React Frontend,

            Express Backend,

            MongoDB Database,

            AI Chat,

            Session Management

            and Contact System.

          </p>

        </div>

        {/* Progress */}

        <div className="about-card">

          <h2>📈 Development Progress</h2>

          <ul className="progress-list">

            <li>✅ Responsive React Frontend</li>

            <li>✅ Express Backend APIs</li>

            <li>✅ MongoDB Database</li>

            <li>✅ AI Chat (Ollama)</li>

            <li>✅ Session Management</li>

            <li>✅ Contact Form Database</li>

            <li>🚧 AI Image Generator</li>

            <li>🚧 Script Generator</li>

            <li>🚧 Authentication</li>

            <li>🚧 Cloud AI Models</li>

          </ul>

        </div>

        {/* Roadmap */}

        <div className="about-card">

          <h2>🛣 Product Roadmap</h2>

          <ul className="roadmap-list">

            <li>🚀 v0.1 — AI Chat & MongoDB</li>

            <li>🚀 v0.2 — Image Generation</li>

            <li>🚀 v0.3 — Code Assistant</li>

            <li>🚀 v0.4 — Script Generator</li>

            <li>🚀 v0.5 — Authentication</li>

            <li>🚀 v0.6 — Cloud AI Models</li>

            <li>🚀 v0.7 — AI Workspace</li>

            <li>🚀 v0.8 — Community Features</li>

            <li>🚀 v0.9 — Premium AI Hub</li>

            <li>🏆 v1.0 — Stable Public Release</li>

          </ul>

        </div>

        {/* Tech Stack */}

        <div className="about-card">

          <h2>⚙ Technology Stack</h2>

          <ul className="progress-list">

            <li>⚛ React.js</li>

            <li>🟢 Node.js</li>

            <li>🚂 Express.js</li>

            <li>🍃 MongoDB</li>

            <li>🤖 Ollama AI</li>

            <li>💻 JavaScript</li>

            <li>🔗 REST APIs</li>

            <li>🐙 Git & GitHub</li>

          </ul>

        </div>

        {/* Open Source */}

        <div className="about-card">

          <h2>🌐 Open Source</h2>

          <p>

            Enlivonex AI Hub is being built publicly.

            Every version represents our journey,
            improvements and learning process.

            Future developers and contributors will be
            able to participate in making the platform
            even better.

          </p>

        </div>

        {/* Contact */}

        <div className="about-card">

          <h2>📧 Official Contact</h2>

          <p>

            <strong>Email</strong>

            <br />

            enlivonexofficial@gmail.com

            <br /><br />

            <strong>GitHub</strong>

            <br />

            github.com/Enlivonex

            <br /><br />

            <strong>Status</strong>

            <br />

            🚀 Active Development

          </p>

        </div>

      </div>

    </section>

  );

}

export default About;
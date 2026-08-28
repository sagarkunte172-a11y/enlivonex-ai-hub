import "./Hero.css";
import { Link } from "react-router-dom";
import { useRef } from "react";

function Hero() {
  const heroCardRef = useRef(null);
  const heroRightRef = useRef(null);

  const handleMouseMove = (event) => {
    if (window.innerWidth < 992) return;

    const card = heroCardRef.current;
    const container = heroRightRef.current;

    if (!card || !container) return;

    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 14;
    const rotateX = ((y / rect.height) - 0.5) * -14;

    card.style.transform = `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-7px)
    `;

    const widgets =
      container.querySelectorAll(".floating-widget");

    widgets.forEach((widget, index) => {
      const depth = (index + 1) * 4;

      widget.style.transform = `
        translate3d(
          ${rotateY * depth * 0.22}px,
          ${-rotateX * depth * 0.22}px,
          ${depth}px
        )
      `;
    });
  };

  const handleMouseLeave = () => {
    const card = heroCardRef.current;
    const container = heroRightRef.current;

    if (card) {
      card.style.transform = `
        perspective(1200px)
        rotateX(0deg)
        rotateY(0deg)
        translateY(0)
      `;
    }

    if (container) {
      const widgets =
        container.querySelectorAll(".floating-widget");

      widgets.forEach((widget) => {
        widget.style.transform =
          "translate3d(0, 0, 0)";
      });
    }
  };

  const tools = [
    {
      icon: "🤖",
      title: "AI Chat",
      status: "Ready",
      type: "available"
    },
    {
      icon: "💻",
      title: "Code Assistant",
      status: "Ready",
      type: "available"
    },
    {
      icon: "🎨",
      title: "Image Generator",
      status: "Coming Soon",
      type: "coming"
    },
    {
      icon: "📝",
      title: "Script Generator",
      status: "Coming Soon",
      type: "coming"
    }
  ];

  return (
    <section className="hero">

      {/* =========================================
          BACKGROUND ATMOSPHERE
      ========================================== */}

      <div
        className="hero-orb hero-orb-one"
        aria-hidden="true"
      />

      <div
        className="hero-orb hero-orb-two"
        aria-hidden="true"
      />

      <div
        className="hero-grid"
        aria-hidden="true"
      />

      {/* =========================================
          LEFT CONTENT
      ========================================== */}

      <div className="hero-left">

        <div className="hero-badge">
          <span className="hero-badge-dot" />
          <span>Version 0.2 Alpha</span>
        </div>

        <div className="hero-eyebrow">
          ENLIVONEX AI HUB
        </div>

        <h1>
          The Future of
          <br />

          <span>Artificial Intelligence</span>

          <br />

          Starts Here.
        </h1>

        <p className="hero-description">
          Enlivonex AI Hub brings AI chat, coding assistance,
          creative tools and future AI services together inside
          one unified workspace — built for students,
          developers, creators and innovators.
        </p>

        {/* =========================================
            CTA BUTTONS
        ========================================== */}

        <div className="hero-buttons">

          <Link
            to="/dashboard"
            className="primary-btn hero-primary-btn"
          >
            <span>🚀</span>
            <span>Launch AI Hub</span>
          </Link>

          <a
            href="https://github.com/enlivonexofficial-debug"
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-btn hero-secondary-btn"
          >
            <span>🌐</span>
            <span>Explore GitHub</span>
          </a>

        </div>

        {/* =========================================
            TRUST / PLATFORM INFO
        ========================================== */}

        <div className="hero-trust-row">

          <div className="hero-trust-item">
            <span className="trust-icon">⚡</span>
            <div>
              <strong>Fast</strong>
              <small>Lightweight platform</small>
            </div>
          </div>

          <div className="hero-trust-divider" />

          <div className="hero-trust-item">
            <span className="trust-icon">🔒</span>
            <div>
              <strong>Built with privacy</strong>
              <small>Local AI focused</small>
            </div>
          </div>

        </div>

        {/* =========================================
            HERO STATS
        ========================================== */}

        <div className="hero-stats">

          <div className="stat-box">
            <h2>4+</h2>
            <span>AI Tools</span>
          </div>

          <div className="stat-box">
            <h2>AI</h2>
            <span>Workspace</span>
          </div>

          <div className="stat-box">
            <h2>0.2</h2>
            <span>Alpha</span>
          </div>

        </div>

      </div>

      {/* =========================================
          RIGHT VISUAL
      ========================================== */}

      <div
        className="hero-right"
        ref={heroRightRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >

        {/* =======================================
            FLOATING WIDGETS
        ======================================== */}

        <div className="floating-widget widget-chat">
          <span>🤖</span>
          <div>
            <strong>AI Chat</strong>
            <small>Online</small>
          </div>
        </div>

        <div className="floating-widget widget-image">
          <span>🎨</span>
          <div>
            <strong>Image AI</strong>
            <small>Coming Soon</small>
          </div>
        </div>

        <div className="floating-widget widget-code">
          <span>💻</span>
          <div>
            <strong>Code AI</strong>
            <small>Available</small>
          </div>
        </div>

        <div className="floating-widget widget-script">
          <span>📝</span>
          <div>
            <strong>Script AI</strong>
            <small>Coming Soon</small>
          </div>
        </div>

        {/* =======================================
            MAIN AI HUB CARD
        ======================================== */}

        <div
          className="hero-card"
          ref={heroCardRef}
        >

          {/* CARD HEADER */}

          <div className="hero-card-header">

            <div className="hero-brand-mark">
              <span>⚡</span>

              <div>
                <strong>ENLIVONEX AI</strong>
                <small>AI HUB / ALPHA</small>
              </div>
            </div>

            <div className="live-status">

              <span className="live-dot" />

              <span>System Online</span>

            </div>

          </div>

          {/* CARD DIVIDER */}

          <div className="hero-card-line" />

          {/* =====================================
              TOOL GRID
          ====================================== */}

          <div className="hero-tools">

            {tools.map((tool) => (
              <div
                className={`tool ${tool.type}`}
                key={tool.title}
              >

                <div className="tool-top">

                  <span className="tool-icon">
                    {tool.icon}
                  </span>

                  <span
                    className={`tool-status ${tool.type}`}
                  >
                    {tool.status}
                  </span>

                </div>

                <strong>
                  {tool.title}
                </strong>

                <small>
                  {tool.type === "available"
                    ? "Available in AI Hub"
                    : "Part of the upcoming ecosystem"}
                </small>

              </div>
            ))}

          </div>

          {/* =====================================
              MINI SYSTEM STATUS
          ====================================== */}

          <div className="dashboard-mini">

            <div className="mini-card">

              <div className="mini-card-icon">
                ◉
              </div>

              <h4>Models</h4>

              <span>
                Ollama
              </span>

              <small>
                Local AI
              </small>

            </div>

            <div className="mini-card">

              <div className="mini-card-icon">
                ⚡
              </div>

              <h4>System</h4>

              <span className="online-text">
                Connected
              </span>

              <small>
                Operational
              </small>

            </div>

            <div className="mini-card">

              <div className="mini-card-icon">
                ∞
              </div>

              <h4>Possibilities</h4>

              <span>
                Unlimited
              </span>

              <small>
                Future ready
              </small>

            </div>

          </div>

          {/* =====================================
              DEVELOPMENT PROGRESS
          ====================================== */}

          <div className="hero-progress">

            <div className="progress-top">

              <div>
                <h3>
                  Platform Development
                </h3>

                <small>
                  Enlivonex AI Hub v0.2
                </small>
              </div>

              <span>
                40%
              </span>

            </div>

            <div
              className="progress-bar"
              aria-label="Development progress: 40%"
            >
              <div className="progress-fill" />
              <div className="progress-shimmer" />
            </div>

            <div className="progress-meta">

              <span>
                Foundation
              </span>

              <span>
                AI Ecosystem
              </span>

            </div>

            <p>
              Expanding from the core AI foundation into a
              complete multi-tool workspace with coding,
              creative and collaborative capabilities.
            </p>

          </div>

          {/* =====================================
              CARD FOOTER
          ====================================== */}

          <div className="hero-card-footer">

            <span>
              <i />
              AI infrastructure active
            </span>

            <span>
              v0.2 ALPHA
            </span>

          </div>

        </div>

        {/* Decorative ring */}

        <div
          className="hero-ring hero-ring-one"
          aria-hidden="true"
        />

        <div
          className="hero-ring hero-ring-two"
          aria-hidden="true"
        />

      </div>

    </section>
  );
}

export default Hero;
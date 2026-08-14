import "./Hero.css";
import { Link } from "react-router-dom";
import { useRef } from "react";

function Hero() {

  const heroCardRef = useRef(null);
  const heroRightRef = useRef(null);

  const handleMouseMove = (e) => {

    if (window.innerWidth < 992) return;

    const card = heroCardRef.current;

    if (!card) return;

    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 18;
    const rotateX = ((y / rect.height) - 0.5) * -18;

    card.style.transform = `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-6px)
    `;

    const widgets = heroRightRef.current.querySelectorAll(".floating-widget");

    widgets.forEach((widget, index) => {

      const depth = (index + 1) * 5;

      widget.style.transform = `
        translate(
          ${rotateY * depth * 0.25}px,
          ${-rotateX * depth * 0.25}px
        )
      `;

    });

  };

  const handleMouseLeave = () => {

    if (!heroCardRef.current) return;

    heroCardRef.current.style.transform = `
      perspective(1200px)
      rotateX(0deg)
      rotateY(0deg)
      translateY(0px)
    `;

    const widgets = heroRightRef.current.querySelectorAll(".floating-widget");

    widgets.forEach((widget) => {

      widget.style.transform = "translate(0px,0px)";

    });

  };

  return (

    <section className="hero">

      {/* LEFT */}

      <div className="hero-left">

        <div className="hero-badge">
          🚀 Version 0.1 Alpha
        </div>

        <h1>
          The Future of
          <br />
          <span>Artificial Intelligence</span>
          <br />
          Starts Here.
        </h1>

        <p>
          Enlivonex AI Hub is an all-in-one AI workspace built for
          students, developers, creators and innovators.
          Chat with AI, generate images, write code,
          create scripts and build the future from one platform.
        </p>

        <div className="hero-buttons">

          <Link
            to="/dashboard"
            className="primary-btn"
          >
            🚀 Launch Dashboard
          </Link>

          <a
            href="https://github.com/Enlivonex"
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-btn"
          >
            🌐 View GitHub
          </a>

        </div>

        <div className="hero-stats">

          <div className="stat-box">
            <h2>4+</h2>
            <span>AI Tools</span>
          </div>

          <div className="stat-box">
            <h2>Open</h2>
            <span>Source</span>
          </div>

          <div className="stat-box">
            <h2>0.1</h2>
            <span>Alpha</span>
          </div>

        </div>

      </div>

      {/* RIGHT */}

      <div
        className="hero-right"
        ref={heroRightRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >

        <div className="floating-widget widget-chat">
          🤖 AI Chat
        </div>

        <div className="floating-widget widget-image">
          🎨 Image AI
        </div>

        <div className="floating-widget widget-code">
          💻 Code AI
        </div>

        <div className="floating-widget widget-script">
          📝 Script AI
        </div>

        <div
          className="hero-card"
          ref={heroCardRef}
        >

          <div className="hero-card-header">

            <span>
              ⚡ ENLIVONEX AI
            </span>

            <div className="live-status">

              <span className="live-dot"></span>

              Online

            </div>

          </div>

          <div className="hero-tools">

            <div className="tool">
              🤖 AI Chat
              <small>Ready</small>
            </div>

            <div className="tool">
              💻 Code Assistant
              <small>Available</small>
            </div>

            <div className="tool">
              🎨 Image Generator
              <small>Coming Soon</small>
            </div>

            <div className="tool">
              📝 Script Generator
              <small>Coming Soon</small>
            </div>

          </div>

          <div className="dashboard-mini">

            <div className="mini-card">
              <h4>Models</h4>
              <span>Ollama</span>
            </div>

            <div className="mini-card">
              <h4>Status</h4>
              <span className="online-text">
                Connected
              </span>
            </div>

            <div className="mini-card">
              <h4>Credits</h4>
              <span>∞</span>
            </div>

          </div>

          <div className="hero-progress">

            <div className="progress-top">

              <h3>Development</h3>

              <span>35%</span>

            </div>

            <div className="progress-bar">

              <div className="progress-fill"></div>

            </div>

            <p>

              Building the complete AI ecosystem with
              modern tools, cloud integration and
              powerful productivity features.

            </p>

          </div>

        </div>

      </div>

    </section>

  );

}

export default Hero;
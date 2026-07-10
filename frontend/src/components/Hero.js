import "./Hero.css";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-left">

        <span className="hero-badge">
          🚀 Version 0.1 Alpha
        </span>

        <h1>
          Build the Future
          <br />
          with <span>Enlivonex AI</span>
        </h1>

        <p>
          A modern open-source AI platform built by students
          for developers, creators and innovators.
        </p>

        <div className="hero-buttons">

          <button className="primary-btn">
            Get Started
          </button>

          <button className="secondary-btn">
            GitHub
          </button>

        </div>

      </div>

      <div className="hero-right">

        <div className="hero-card">

          <h3>⚡ AI Hub</h3>

          <p>
            Chat • Image • Video • Code
          </p>

          <div className="status">

            <span className="dot"></span>

            Open Source

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;
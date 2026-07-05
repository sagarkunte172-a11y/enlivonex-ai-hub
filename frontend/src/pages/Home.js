import "./Home.css";

function Home() {
  return (
    <div className="home-page">

      <section className="hero">

        <h1>🚀 Welcome to Enlivonex AI Hub</h1>

        <p>
          Your all-in-one AI platform for chatting, coding,
          image generation and productivity.
        </p>

        <button className="hero-btn">
          Explore Features
        </button>

      </section>

      <section className="home-features">

        <h2>Why Choose Enlivonex?</h2>

        <div className="feature-grid">

          <div className="feature-card">
            <h3>🤖 AI Chat</h3>
            <p>
              Chat with multiple AI models from one platform.
            </p>
          </div>

          <div className="feature-card">
            <h3>💻 Coding Assistant</h3>
            <p>
              Generate, debug and improve your code faster.
            </p>
          </div>

          <div className="feature-card">
            <h3>🎨 AI Images</h3>
            <p>
              Create stunning AI-generated images instantly.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;
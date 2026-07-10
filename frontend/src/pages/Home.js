import "./Home.css";
import Hero from "../components/Hero";

function Home() {
  return (
    <div className="home-page">

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="home-features">

        <h2>Why Choose Enlivonex AI Hub?</h2>

        <div className="feature-grid">

          <div className="feature-card">
            <h3>🤖 AI Chat</h3>
            <p>
              Chat with multiple AI models in one place with fast responses.
            </p>
          </div>

          <div className="feature-card">
            <h3>💻 Code Assistant</h3>
            <p>
              Generate, debug and optimize code using powerful AI.
            </p>
          </div>

          <div className="feature-card">
            <h3>🎨 Image Generator</h3>
            <p>
              Create high-quality AI images from simple text prompts.
            </p>
          </div>

          <div className="feature-card">
            <h3>📝 Script Generator</h3>
            <p>
              Generate YouTube scripts, blogs, stories and social media content.
            </p>
          </div>

          <div className="feature-card">
            <h3>🚀 Fast Performance</h3>
            <p>
              Built with React, Node.js and modern technologies for speed.
            </p>
          </div>

          <div className="feature-card">
            <h3>🌍 Community Driven</h3>
            <p>
              Join developers and creators building the future with AI.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;
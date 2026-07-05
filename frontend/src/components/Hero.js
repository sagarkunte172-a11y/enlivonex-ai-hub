import Features from "./Features";

function Hero() {

  function showMessage() {
    alert(
      "🚀 Welcome to Enlivonex AI Hub!\n\nVersion 0.1 Alpha\n\nCreated by Sagar\n\nMore exciting features are coming soon!"
    );
  }

  return (
    <div className="App">
      <div className="container">

        <h1>🚀 Enlivonex AI Hub</h1>

        <h2>Build. Learn. Create.</h2>

        <p>
          An AI platform built by students,
          for creators, developers and innovators.
        </p>

        <Features />

        <button onClick={showMessage}>
          Coming Soon
        </button>

      </div>
    </div>
  );
}

export default Hero;
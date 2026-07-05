import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-section">
          <h2>🚀 Enlivonex AI Hub</h2>
          <p>
            Building the future of AI for students,
            developers and creators.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>

          <ul>
            <li>Home</li>
            <li>About</li>
            <li>Features</li>
            <li>Contact</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Upcoming</h3>

          <ul>
            <li>🤖 AI Chat</li>
            <li>🎨 Image Generator</li>
            <li>💻 Coding Assistant</li>
            <li>🧠 Local AI Models</li>
          </ul>
        </div>

      </div>

      <hr />

      <p className="copyright">
        © 2026 Enlivonex AI Hub | Developed by Sagar Kunte ❤️
      </p>

    </footer>
  );
}

export default Footer;
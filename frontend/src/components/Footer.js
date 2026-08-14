import { NavLink } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* ===================== */}
        {/* Company */}
        {/* ===================== */}

        <div className="footer-section">

          <h2>🚀 Enlivonex AI Hub</h2>

          <p>
            Building the future of AI for students,
            developers and creators.
          </p>

        </div>

        {/* ===================== */}
        {/* Quick Links */}
        {/* ===================== */}

        <div className="footer-section">

          <h3>Quick Links</h3>

          <ul>

            <li>
              <NavLink to="/">Home</NavLink>
            </li>

            <li>
              <NavLink to="/about">About</NavLink>
            </li>

            <li>
              <NavLink to="/features">AI Tools</NavLink>
            </li>

            <li>
              <NavLink to="/contact">Contact</NavLink>
            </li>

          </ul>

        </div>

        {/* ===================== */}
        {/* Upcoming */}
        {/* ===================== */}

        <div className="footer-section">

          <h3>Upcoming</h3>

          <ul>

            <li>
              <NavLink to="/chat">
                🤖 AI Chat
              </NavLink>
            </li>

            <li>
              <NavLink to="/image">
                🎨 Image Generator
              </NavLink>
            </li>

            <li>
              <NavLink to="/code">
                💻 Coding Assistant
              </NavLink>
            </li>

            <li>
              <NavLink to="/dashboard">
                🧠 Local AI Models
              </NavLink>
            </li>

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
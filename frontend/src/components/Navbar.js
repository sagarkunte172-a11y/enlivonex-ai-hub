import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo">
        <span className="logo-icon">🚀</span>
        <span className="logo-text">ENLIVONEX AI HUB</span>
      </div>

      <ul className="nav-links">

        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? "active-link" : ""}>
            Home
          </NavLink>
        </li>

        <li>
          <NavLink to="/features" className={({ isActive }) => isActive ? "active-link" : ""}>
            AI Tools
          </NavLink>
        </li>

        <li>
          <NavLink to="/about" className={({ isActive }) => isActive ? "active-link" : ""}>
            Community
          </NavLink>
        </li>

        <li>
          <NavLink to="/contact" className={({ isActive }) => isActive ? "active-link" : ""}>
            About
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "dashboard-btn dashboard-active"
                : "dashboard-btn"
            }
          >
            Dashboard →
          </NavLink>
        </li>

      </ul>

    </nav>
  );
}

export default Navbar;
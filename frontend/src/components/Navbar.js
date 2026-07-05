import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo">
        🚀 ENLIVONEX AI HUB
      </div>

      <ul>

        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            Home
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/features"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            Features
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            About
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? "active-link" : ""
            }
          >
            Contact
          </NavLink>
        </li>

      </ul>

    </nav>
  );
}

export default Navbar;
import { NavLink, Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {

    const isAuthenticated = Boolean(
        localStorage.getItem("auth_token")
    );

    return (

        <nav className="navbar">

            {/* Logo */}

            <Link
                to="/"
                className="logo"
            >

                <span className="logo-icon">
                    🚀
                </span>

                <span className="logo-text">
                    ENLIVONEX AI HUB
                </span>

            </Link>

            {/* Navigation */}

            <ul className="nav-links">

                <li>

                    <NavLink
                        to="/"
                        end
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
                        AI Tools
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

            {/* Right Side */}

            <div className="navbar-right">

                {isAuthenticated ? (

                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            isActive
                                ? "profile-nav-btn profile-nav-active"
                                : "profile-nav-btn"
                        }
                    >
                        My Profile
                    </NavLink>

                ) : (

                    <>

                        <NavLink
                            to="/login"
                            className="auth-nav-link"
                        >
                            Login
                        </NavLink>

                        <NavLink
                            to="/register"
                            className="auth-register-btn"
                        >
                            Register
                        </NavLink>

                    </>

                )}

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

            </div>

        </nav>

    );

}

export default Navbar;
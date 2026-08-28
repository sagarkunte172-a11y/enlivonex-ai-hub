import "./App.css";

import {
    BrowserRouter,
    Routes,
    Route,
    useLocation
} from "react-router-dom";

/*
==================================
Layout
==================================
*/

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import EnlivonexCursor from "./components/enlivonexCursor.js";

/*
==================================
Pages
==================================
*/

import Home from "./pages/Home";
import About from "./pages/About";
import FeaturesPage from "./pages/Features";
import Contact from "./pages/Contact";

import Dashboard from "./pages/Dashboard";

import Chat from "./pages/Chat";
import CodeAssistant from "./pages/CodeAssistant";
import ImageGenerator from "./pages/ImageGenerator";
import ScriptGenerator from "./pages/ScriptGenerator";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import WorkspaceDashboard from "./pages/WorkspaceDashboard";

/*
==================================
App Layout
==================================
*/

function AppContent() {

    const location = useLocation();

    /*
    ==================================
    Hide Navbar/Footer Pages
    ==================================
    */

    const hideLayout = [
        "/login",
        "/register",
        "/workspace"
    ].includes(location.pathname);

    return (

        <div className="app">

            {/* 
            ==================================
            ENLIVONEX CUSTOM CURSOR
            ==================================
            
            Mounted globally so the E / Enlivonex
            cursor works across the entire application.
            */}

            <EnlivonexCursor />

            {
                !hideLayout &&
                <Navbar />
            }

            <main className="page-container">

                <Routes>

                    {/* ==================================
                        HOME
                    ================================== */}

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    {/* ==================================
                        WEBSITE PAGES
                    ================================== */}

                    <Route
                        path="/about"
                        element={<About />}
                    />

                    <Route
                        path="/features"
                        element={<FeaturesPage />}
                    />

                    <Route
                        path="/contact"
                        element={<Contact />}
                    />

                    {/* ==================================
                        AUTHENTICATION
                    ================================== */}

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                    {/* ==================================
                        WORKSPACE
                    ================================== */}

                    <Route
                        path="/workspace"
                        element={<WorkspaceDashboard />}
                    />

                    {/* ==================================
                        DASHBOARD
                    ================================== */}

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    {/* ==================================
                        AI TOOLS
                    ================================== */}

                    <Route
                        path="/chat"
                        element={<Chat />}
                    />

                    <Route
                        path="/code"
                        element={<CodeAssistant />}
                    />

                    <Route
                        path="/image"
                        element={<ImageGenerator />}
                    />

                    <Route
                        path="/script"
                        element={<ScriptGenerator />}
                    />

                </Routes>

            </main>

            {
                !hideLayout &&
                <Footer />
            }

        </div>

    );
}

/*
==================================
APP
==================================
*/

function App() {

    return (

        <BrowserRouter>

            <AppContent />

        </BrowserRouter>

    );

}

export default App;
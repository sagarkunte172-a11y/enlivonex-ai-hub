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
        "/register"

    ].includes(location.pathname);

    return (

        <div className="app">

            {

                !hideLayout &&

                <Navbar />

            }

            <main className="page-container">

                <Routes>

                    {/* Home */}

                    <Route

                        path="/"

                        element={<Home />}

                    />

                    {/* Website */}

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

                    {/* Authentication */}

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

                    {/* Dashboard */}

                    <Route

                        path="/dashboard"

                        element={<Dashboard />}

                    />

                    {/* AI Tools */}

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
App
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
import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

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

function AppContent() {

  const location = useLocation();

  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/profile";

  return (
    <>

      {!hideLayout && <Navbar />}

      <Routes>

        {/* Public Pages */}

        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/features" element={<FeaturesPage />} />

        <Route path="/contact" element={<Contact />} />

        {/* Authentication */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* User */}

        <Route path="/profile" element={<Profile />} />

        <Route path="/dashboard" element={<Dashboard />} />

        {/* AI Tools */}

        <Route path="/chat" element={<Chat />} />

        <Route path="/code" element={<CodeAssistant />} />

        <Route path="/image" element={<ImageGenerator />} />

        <Route path="/script" element={<ScriptGenerator />} />

      </Routes>

      {!hideLayout && <Footer />}

    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
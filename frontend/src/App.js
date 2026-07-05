import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

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

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/features" element={<FeaturesPage />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/chat" element={<Chat />} />

        <Route path="/code" element={<CodeAssistant />} />

        <Route path="/image" element={<ImageGenerator />} />

        <Route path="/script" element={<ScriptGenerator />} />

      </Routes>

      <Footer />

    </BrowserRouter>
  );
}

export default App;
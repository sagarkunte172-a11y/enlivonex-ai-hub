import "./App.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import FeaturesPage from "./pages/Features";
import Contact from "./pages/Contact";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/features" element={<FeaturesPage />} />

        <Route path="/contact" element={<Contact />} />

      </Routes>

      <Footer />

    </BrowserRouter>
  );
}

export default App;
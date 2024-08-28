import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Services from "./pages/Services";
import About from "./pages/About";
import "bootstrap/dist/css/bootstrap.min.css";

function AppContent() {
  const location = useLocation();

  return (
    <>
      {/* Rendera NavBar om den aktuella sökvägen inte är '/' */}
      {location.pathname !== "/" && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

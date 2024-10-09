import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Bookings from "./pages/Bookings";
import Home from "./pages/Home";
import Services from "./pages/Services";
import About from "./pages/About";
import PreAppointment from "./pages/PreAppointment";
import Aftercare from "./pages/Aftercare";
import AdminPage from "./pages/AdminPage";
import AdminCalendar from "./pages/AdminCalendar";
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
                <Route path="/pre-appointment-info" element={<PreAppointment />} />
                <Route path="/aftercare-tips" element={<Aftercare />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/admin/calendar" element={<AdminCalendar />} />
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

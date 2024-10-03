import React, { useRef, useState } from "react";
import { Navbar, Nav, Offcanvas, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import styles from "../styles/NavBar.module.css";
import logo from "../assets/images/nc-logo-black.png";

function NavBar() {
    const [show, setShow] = useState(false);
    const offcanvasRef = useRef(null);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // Kontrollera om anv�ndaren �r inloggad
    const isAuthenticated = () => {
        const token = localStorage.getItem("access");
        return token !== null;
    };

    // Hantera utloggning
    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.reload(); // Ladda om sidan f�r att till�mpa �ndringarna
    };

    return (
        <div className={styles.navbarContainer}>
            <Navbar expand="lg" className={`${styles.navbar}`}>
                <Container fluid>
                    <Row className="w-100 align-items-center">
                        {/* Hamburger menu toggle and logo visible on small screens */}
                        <Col xs={2} className="text-start d-lg-none">
                            <Navbar.Toggle aria-controls="offcanvasNavbar" onClick={handleShow} />
                        </Col>
                        <Col xs={8} className="d-lg-none text-center">
                            <Link to="/" className={styles.logoLink}>
                                <img src={logo} alt="Logo" className={styles.logo} />
                            </Link>
                        </Col>

                        <Col xs={2} className="d-lg-none"></Col>

                        {/* Navigation Links visible on large screens */}
                        <Col xs={10} className="d-none d-lg-flex justify-content-start">
                            <Nav className="flex-grow-1 pe-3">
                                <Nav.Link as={Link} to="/" className={styles.logoLink}>
                                    <img src={logo} alt="Logo" className={styles.logo} />
                                </Nav.Link>
                                <Nav.Link as={Link} to="/" className={styles.navLink}>
                                    Home
                                </Nav.Link>
                                <Nav.Link as={Link} to="/services" className={styles.navLink}>
                                    Services
                                </Nav.Link>

                                {/* Appointment is always visible */}
                                <Nav.Link
                                    as={Link}
                                    to={isAuthenticated() ? "/bookings" : "/login"}
                                    className={styles.navLink}
                                >
                                    Booking
                                </Nav.Link>
                                {/*Commented out to add for future development*/}
                                {/*<Nav.Link as={Link} to="/shop" className={styles.navLink}>*/}
                                {/*    Shop*/}
                                {/*</Nav.Link>*/}
                                <Nav.Link as={Link} to="/about" className={styles.navLink}>
                                    About Us
                                </Nav.Link>
                                <Nav.Link as={Link} to="/contact" className={styles.navLink}>
                                    Contact
                                </Nav.Link>

                                {/* Show Pre Appointment and Aftercare Tips only if authenticated */}
                                {isAuthenticated() && (
                                    <>
                                        <Nav.Link
                                            as={Link}
                                            to="/pre-appointment-info"
                                            className={styles.navLink}
                                        >
                                            Pre Appointment
                                        </Nav.Link>
                                        <Nav.Link
                                            as={Link}
                                            to="/aftercare-tips"
                                            className={styles.navLink}
                                        >
                                            Aftercare Tips
                                        </Nav.Link>
                                    </>
                                )}

                                {/* Visa Login/Register eller Logout beroende p� inloggningsstatus */}
                                {!isAuthenticated() ? (
                                    <>
                                        <Nav.Link as={Link} to="/login" className={styles.navLink}>
                                            Login
                                        </Nav.Link>
                                        <Nav.Link as={Link} to="/register" className={styles.navLink}>
                                            Register
                                        </Nav.Link>
                                    </>
                                ) : (
                                    <Nav.Link as={Link} to="/" onClick={handleLogout} className={`${styles.logOutHover} ${styles.navLink}`}>
                                        Logout
                                    </Nav.Link>
                                )}
                            </Nav>
                        </Col>
                    </Row>

                    <Navbar.Offcanvas
                        id="offcanvasNavbar"
                        aria-labelledby="offcanvasNavbarLabel"
                        placement="end"
                        className="d-lg-none customOffcanvas"
                        ref={offcanvasRef}
                        show={show}
                        onHide={handleClose}
                        style={{ backgroundColor: "#bbc0b5" }}
                    >
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title className={styles.menuTitle} id="offcanvasNavbarLabel">
                                Meny
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Nav className="flex-column">
                                <Nav.Link
                                    as={Link}
                                    to="/"
                                    className={styles.burgerNavLink}
                                    onClick={handleClose}
                                >
                                    Home
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to="/services"
                                    className={styles.burgerNavLink}
                                    onClick={handleClose}
                                >
                                    Services
                                </Nav.Link>

                                {/* Book Appointment is always visible */}
                                <Nav.Link
                                    as={Link}
                                    to={isAuthenticated() ? "/book-appointment" : "/login"}
                                    className={styles.burgerNavLink}
                                    onClick={handleClose}
                                >
                                    Book Appointment
                                </Nav.Link>

                                <Nav.Link
                                    as={Link}
                                    to="/shop"
                                    className={styles.burgerNavLink}
                                    onClick={handleClose}
                                >
                                    Shop Products
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to="/about"
                                    className={styles.burgerNavLink}
                                    onClick={handleClose}
                                >
                                    About Us
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to="/contact"
                                    className={styles.burgerNavLink}
                                    onClick={handleClose}
                                >
                                    Contact
                                </Nav.Link>

                                {/* Show Pre Appointment and Aftercare Tips only if authenticated */}
                                {isAuthenticated() && (
                                    <>
                                        <Nav.Link
                                            as={Link}
                                            to="/pre-appointment-info"
                                            className={styles.burgerNavLink}
                                            onClick={handleClose}
                                        >
                                            Pre Appointment
                                        </Nav.Link>
                                        <Nav.Link
                                            as={Link}
                                            to="/aftercare-tips"
                                            className={styles.burgerNavLink}
                                            onClick={handleClose}
                                        >
                                            Aftercare Tips
                                        </Nav.Link>
                                    </>
                                )}

                                {/* Visa Login/Register eller Logout beroende p� inloggningsstatus */}
                                {!isAuthenticated() ? (
                                    <>
                                        <Nav.Link as={Link} to="/login" className={styles.burgerNavLink} onClick={handleClose}>
                                            Login
                                        </Nav.Link>
                                        <Nav.Link as={Link} to="/register" className={styles.burgerNavLink} onClick={handleClose}>
                                            Register
                                        </Nav.Link>
                                    </>
                                ) : (
                                    <Nav.Link as={Link} to="/" onClick={handleLogout} className={`${styles.customBurgerLogout} ${styles.burgerNavLink}`}>
                                        Logout
                                    </Nav.Link>
                                )}
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>
        </div>
    );
}

export default NavBar;

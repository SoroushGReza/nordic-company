import React from "react";
import { Navbar, Nav, Offcanvas, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom"; // Importera Link från react-router-dom
import styles from "../styles/NavBar.module.css";

function NavBar() {
  return (
    <div className={styles.navbarContainer}>
      <Navbar expand="lg" className={`${styles.navbar}`}>
        <Container fluid>
          <Row className="w-100 align-items-center">
            {/* Navigation Links visible on large screens */}
            <Col xs={10} className="d-none d-lg-flex justify-content-start">
              <Nav className="flex-grow-1 pe-3">
                <Nav.Link as={Link} to="/" className={styles.navLink}>
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to="/services" className={styles.navLink}>
                  Services
                </Nav.Link>
                <Nav.Link as={Link} to="/book-appointment" className={styles.navLink}>
                  Book Appointment
                </Nav.Link>
                <Nav.Link as={Link} to="/shop" className={styles.navLink}>
                  Shop
                </Nav.Link>
                <Nav.Link as={Link} to="/about" className={styles.navLink}>
                  About Us
                </Nav.Link>
                <Nav.Link as={Link} to="/contact" className={styles.navLink}>
                  Contact
                </Nav.Link>
                <Nav.Link as={Link} to="/pre-appointment-info" className={styles.navLink}>
                  Pre Appointment Info
                </Nav.Link>
                <Nav.Link as={Link} to="/aftercare-tips" className={styles.navLink}>
                  Aftercare Tips
                </Nav.Link>
              </Nav>
            </Col>
            {/* Hamburger menu toggle visible only on small screens */}
            <Col xs={2} className="text-end d-lg-none">
              <Navbar.Toggle aria-controls="offcanvasNavbar" />
            </Col>
          </Row>

          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="end"
            className="d-lg-none"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel">
                Meny
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="flex-column">
                <Nav.Link as={Link} to="/" className={styles.navLink}>
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to="/services" className={styles.navLink}>
                  Services
                </Nav.Link>
                <Nav.Link as={Link} to="/book-appointment" className={styles.navLink}>
                  Book Appointment
                </Nav.Link>
                <Nav.Link as={Link} to="/shop" className={styles.navLink}>
                  Shop
                </Nav.Link>
                <Nav.Link as={Link} to="/about" className={styles.navLink}>
                  About Us
                </Nav.Link>
                <Nav.Link as={Link} to="/contact" className={styles.navLink}>
                  Contact
                </Nav.Link>
                <Nav.Link as={Link} to="/pre-appointment-info" className={styles.navLink}>
                  Pre Appointment Info
                </Nav.Link>
                <Nav.Link as={Link} to="/aftercare-tips" className={styles.navLink}>
                  Aftercare Tips
                </Nav.Link>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </div>
  );
}

export default NavBar;

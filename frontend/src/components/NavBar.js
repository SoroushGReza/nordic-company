import React, { useRef, useState, useEffect } from "react";
import {
  Navbar,
  Nav,
  Offcanvas,
  Container,
  Row,
  Col,
  Image,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/NavBar.module.css";
import logo from "../assets/images/nc-logo-black.png";
import useAuthStatus from "../hooks/useAuthStatus";
import { axiosReq } from "../api/axiosDefaults";

function NavBar() {
  const [show, setShow] = useState(false);
  const { isAdmin, isAuthenticated } = useAuthStatus();
  const navigate = useNavigate();
  const offcanvasRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/home");
  };

  // Fetch profile image if logged in
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const { data } = await axiosReq.get("/accounts/profile/");
        setProfileImage(data.profile_image);
      } catch (err) {
        console.error("Error fetching profile image:", err);
      }
    };

    if (isAuthenticated) {
      fetchProfileImage();
    }
  }, [isAuthenticated]);

  return (
    <div className={styles.navbarContainer}>
      <Navbar expand="lg" className={`${styles.navbar}`}>
        <Container fluid>
          <Row className="w-100 align-items-center">
            {/* Hamburger menu toggle and logo visible on small screens */}
            <Col xs={2} className="text-start d-lg-none">
              <Navbar.Toggle
                aria-controls="offcanvasNavbar"
                onClick={handleShow}
              />
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

                <Nav.Link
                  as={Link}
                  to={
                    isAuthenticated
                      ? isAdmin
                        ? "/admin/bookings"
                        : "/bookings"
                      : "/login"
                  }
                  className={styles.navLink}
                >
                  Booking
                </Nav.Link>
                <Nav.Link as={Link} to="/about" className={styles.navLink}>
                  About Us
                </Nav.Link>
                <Nav.Link as={Link} to="/contact" className={styles.navLink}>
                  Contact
                </Nav.Link>

                {/* Show Pre Appointment and Aftercare Tips only if authenticated */}
                {isAuthenticated && (
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

                {/* Show Login/Register or Logout based on user status */}
                {!isAuthenticated ? (
                  <>
                    <Nav.Link as={Link} to="/login" className={styles.navLink}>
                      Login
                    </Nav.Link>
                    <Nav.Link
                      as={Link}
                      to="/register"
                      className={styles.navLink}
                    >
                      Register
                    </Nav.Link>
                  </>
                ) : (
                  <Nav.Link
                    as={Link}
                    to="/"
                    onClick={handleLogout}
                    className={`${styles.logOutHover} ${styles.navLink}`}
                  >
                    Logout
                  </Nav.Link>
                )}
              </Nav>
              {/* Profile image link for loged in user */}
              {isAuthenticated && profileImage && (
                <Nav.Link
                  as={Link}
                  to="/profile"
                  className={styles.profileNavLink}
                >
                  <Image
                    src={profileImage}
                    roundedCircle
                    width={55}
                    height={55}
                    alt="Profile"
                    className={styles.profileImage}
                  />
                </Nav.Link>
              )}
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
              <Offcanvas.Title
                className={styles.menuTitle}
                id="offcanvasNavbarLabel"
              >
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

                <Nav.Link
                  as={Link}
                  to={
                    isAuthenticated
                      ? isAdmin
                        ? "/admin/bookings"
                        : "/bookings"
                      : "/login"
                  }
                  className={styles.burgerNavLink}
                  onClick={handleClose}
                >
                  Booking
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
                {isAuthenticated && (
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

                {/* Profile link on mobile */}
                {isAuthenticated && (
                  <Nav.Link
                    as={Link}
                    to="/profile"
                    className={styles.burgerNavLink}
                    onClick={handleClose}
                  >
                    Profile
                  </Nav.Link>
                )}

                {/* Show Login/Register or Logout based on user status */}
                {!isAuthenticated ? (
                  <>
                    <Nav.Link
                      as={Link}
                      to="/login"
                      className={styles.burgerNavLink}
                      onClick={handleClose}
                    >
                      Login
                    </Nav.Link>
                    <Nav.Link
                      as={Link}
                      to="/register"
                      className={styles.burgerNavLink}
                      onClick={handleClose}
                    >
                      Register
                    </Nav.Link>
                  </>
                ) : (
                  <Nav.Link
                    as={Link}
                    to="/"
                    onClick={handleLogout}
                    className={`${styles.customBurgerLogout} ${styles.burgerNavLink}`}
                  >
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

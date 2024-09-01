import React from "react";
import { Button, Container } from "react-bootstrap";
import styles from "../styles/Menu.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Link, useNavigate } from "react-router-dom";

const Menu = () => {
    const navigate = useNavigate();

    const isAuthenticated = () => {
        const token = localStorage.getItem("access");
        return token !== null;
    };

    const handleBookAppointmentClick = () => {
        if (isAuthenticated()) {
            navigate("/book");
        } else {
            navigate("/login");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.reload(); // Ladda om sidan för att tillämpa ändringarna
    };

    return (
        <Container className={styles.menu}>
            <Link to="/services" className={styles.link}>
                <Button variant="outline-dark" className={styles.menuButtonTop}>
                    SERVICES
                </Button>
            </Link>
            <Link to="/about" className={styles.link}>
                <Button variant="outline-dark" className={styles.menuButton}>
                    About us
                </Button>
            </Link>
            <Link to="/shop" className={styles.link}>
                <Button variant="outline-dark" className={styles.menuButton}>
                    Shop
                </Button>
            </Link>

            {/* Book Appointment Button */}
            <Button
                variant="outline-dark"
                className={styles.menuButton}
                onClick={handleBookAppointmentClick}
            >
                Book appointment
            </Button>
            {isAuthenticated() && (
                <>
                    <Link to="/pre-appointment-info" className={styles.link}>
                        <Button variant="outline-dark" className={styles.menuButton}>
                            Pre appointment
                        </Button>
                    </Link>
                    <Link to="/aftercare-tips" className={styles.link}>
                        <Button variant="outline-dark" className={styles.menuButton}>
                            Aftercare tips
                        </Button>
                    </Link>
                </>
            )}


            {!isAuthenticated() && (
                <>
                    <Link to="/login" className={styles.link}>
                        <Button variant="outline-dark" className={styles.menuButton}>
                            Login
                        </Button>
                    </Link>
                    <Link to="/register" className={styles.link}>
                        <Button variant="outline-dark" className={styles.menuButton}>
                            Register
                        </Button>
                    </Link>
                </>
            )}

            {isAuthenticated() && (
                <Button
                    variant="outline-dark"
                    className={styles.menuButton}
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            )}

            {/* Instagram Link */}
            <a
                href="https://www.instagram.com/facebykristine/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
            >
                <FontAwesomeIcon className={styles.instagram} icon={faInstagram} />
            </a>
        </Container>
    );
};

export default Menu;

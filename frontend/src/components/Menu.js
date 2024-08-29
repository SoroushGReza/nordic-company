import React from "react";
import { Button, Container } from "react-bootstrap";
import styles from "../styles/Menu.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";

const Menu = () => {
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
      <Link to="/aftercare" className={styles.link}>
        <Button variant="outline-dark" className={styles.menuButton}>
          Aftercare tips
        </Button>
      </Link>
      <Link to="/shop" className={styles.link}>
        <Button variant="outline-dark" className={styles.menuButton}>
          Shop products
        </Button>
      </Link>
      <Link to="/pre-appointment" className={styles.link}>
        <Button variant="outline-dark" className={styles.menuButton}>
          Pre appointment
        </Button>
      </Link>
      <Link to="/book" className={styles.link}>
        <Button variant="outline-dark" className={styles.menuButton}>
          Book appointment
        </Button>
      </Link>
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

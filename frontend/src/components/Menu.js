import React from "react";
import { Button, Container } from "react-bootstrap";
import styles from "../styles/Menu.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';


const Menu = () => {
  return (
    <Container className={styles.menu}>
      <Button
        variant="outline-dark"
        className={styles.menuButton}
        href="#services"
      >
        SERVICES
      </Button>
      <Button
        variant="outline-dark"
        className={styles.menuButton}
        href="#about"
      >
        About us
      </Button>
      <Button
        variant="outline-dark"
        className={styles.menuButton}
        href="#aftercare"
      >
        Aftercare tips
      </Button>
      <Button variant="outline-dark" className={styles.menuButton} href="#shop">
        Shop products
      </Button>
      <Button
        variant="outline-dark"
        className={styles.menuButton}
        href="#pre-appointment"
      >
        Pre appointment info
      </Button>
      <Button variant="outline-dark" className={styles.menuButton} href="#book">
        Book appointment
      </Button>
      <FontAwesomeIcon className={styles.instagram} icon={faInstagram} />

    </Container>
  );
};

export default Menu;

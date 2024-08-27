import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../styles/Services.module.css";
import servicesImage from "../assets/services-header.png";

const Services = () => {
  return (
    <div className={styles.servicesPage}>
      <Container className={styles.contentContainer}>
        <Row className="align-items-center pt-5">
          <Col xs={12} className="text-center">
            <img
              src={servicesImage}
              alt="Profile"
              className={styles.servicesImage}
            />
            <h1 className={styles.mainHeading}>Our Services</h1>
            <p className={styles.subText}>
              Add content when the princess is ready! :D
            </p>
          </Col>
        </Row>
        {/* Här kan du lägga till fler Row och Col-komponenter för mer innehåll */}
      </Container>
    </div>
  );
};

export default Services;

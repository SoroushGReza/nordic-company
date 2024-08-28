import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../styles/Services.module.css";
import HairServicesImg from "../assets/images/HairServices.png";
import HairServicesImgTxt from "../assets/images/HairServicesImgTxt.png";
import LashServicesImgTxt from "../assets/images/LashServices.png";
import BrowServicesImgTxt from "../assets/images/BrowServices.png";
import LashImage from "../assets/images/lashes.png";
import BrowImage from "../assets/images/brows.png";

const Services = () => {
  return (
    <Container fluid className={styles.servicesContainer}>
      <Row className={styles.heroRow}>
        <Col xs={5} className={styles.imageCol}>
          <img
            src={HairServicesImg}
            alt="Hair services"
            className={styles.heroImage}
          />
        </Col>
      </Row>

      <Row className={styles.servicesRow}>
        <Col xs={12} md={8} className={styles.servicesContent}>
          <div className={styles.servicesBox}>
            <img
              src={HairServicesImgTxt}
              alt="Hair Services Title"
              className={styles.ServicesTitle}
            />
            <ul className={styles.servicesList}>
              <li>
                CUT INC. HAIRWASH & STYLING<span>45 EUR</span>
              </li>
              <li>
                WASH & DRY (hairwash, blowdry,styling)<span>35 EUR</span>
              </li>
              <li>
                HIGHLIGHTS/BALAYAGE FULL HEAD - SHORT INCL. TONER{" "}
                <span>110 EUR</span>
              </li>
              <li>
                FULL COLOR SHORT <span>100 EUR</span>
              </li>
              <li>
                ROOT COVERING <span>90 EUR</span>
              </li>
              <li>
                TONE REFRESH <span>80 EUR</span>
              </li>
              <li>
                COLOR CORRECTION <span>FROM 90 EUR</span>
              </li>
            </ul>
          </div>
        </Col>
      </Row>

      <Row className={styles.servicesRow}>
        <Col xs={12} md={8} className={styles.servicesContent}>
          <div className={styles.servicesBox}>
            <img
              src={LashServicesImgTxt}
              alt="Lash Services Title"
              className={styles.ServicesTitle}
            />
            <img
              src={LashImage}
              alt="Lash Services"
              className={styles.lashImage}
            />
            <ul className={styles.servicesList}>
              <li>
                CUT INC. HAIRWASH & STYLING<span>45 EUR</span>
              </li>
              <li>
                WASH & DRY (hairwash, blowdry,styling)<span>35 EUR</span>
              </li>
              <li>
                HIGHLIGHTS/BALAYAGE FULL HEAD - SHORT INCL. TONER{" "}
                <span>110 EUR</span>
              </li>
              <li>
                FULL COLOR SHORT <span>100 EUR</span>
              </li>
              <li>
                ROOT COVERING <span>90 EUR</span>
              </li>
              <li>
                TONE REFRESH <span>80 EUR</span>
              </li>
              <li>
                COLOR CORRECTION <span>FROM 90 EUR</span>
              </li>
            </ul>
          </div>
        </Col>
      </Row>

      <Row className={styles.servicesRow}>
        <Col xs={12} md={8} className={styles.servicesContentLast}>
          <div className={styles.servicesBox}>
            <img
              src={BrowServicesImgTxt}
              alt="Brow Services Title"
              className={styles.ServicesTitle}
            />
            <img
              src={BrowImage}
              alt="Brow Services"
              className={styles.browImage}
            />
            <ul className={styles.servicesList}>
              <li>
                CUT INC. HAIRWASH & STYLING<span>45 EUR</span>
              </li>
              <li>
                WASH & DRY (hairwash, blowdry,styling)<span>35 EUR</span>
              </li>
              <li>
                HIGHLIGHTS/BALAYAGE FULL HEAD - SHORT INCL. TONER{" "}
                <span>110 EUR</span>
              </li>
              <li>
                FULL COLOR SHORT <span>100 EUR</span>
              </li>
              <li>
                ROOT COVERING <span>90 EUR</span>
              </li>
              <li>
                TONE REFRESH <span>80 EUR</span>
              </li>
              <li>
                COLOR CORRECTION <span>FROM 90 EUR</span>
              </li>
            </ul>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Services;

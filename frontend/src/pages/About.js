import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../styles/About.module.css";
import AboutUs from "../assets/images/AboutUs.png";
import BjorkProducts from "../assets/images/BjorksProducts.png";

const About = () => {
  return (
    <Container fluid className={styles.aboutContainer}>
      <Row className={styles.aboutRow}>
        <Col xs={12} className={styles.aboutContent}>
          <img src={AboutUs} alt="About us" className={styles.AboutUsImgTxt} />
        </Col>
      </Row>

      <Row className={styles.aboutRow}>
        <Col xs={12} md={8} className={styles.aboutContent}>
          <h1 className={styles.aboutHeadingTitle}>A WARM WELCOME!</h1>
          <h4 className={styles.aboutHeadingTxtContent}>
            A nordic Company’s vision is a salon that provides a personal and
            calming environment for everyone. With us you can focus on you, wind
            down and leave feeling confident and energized. As a Scandinavian
            native, we have brought along a Swedish product line enriched with
            natural extracts from the Swedish forests but with a clear purpose &
            result. Sleek design, vegan, sustainable throughout, and with scents
            you fall for. Coming in to fix your hair or lashes means a moment to
            focus on you. Enjoy a lovely coffee from our coffee bar, have a nap
            on our super comfortable lash bed, and with every hair service, we
            provide a deep clean & scalp massage. We make time for you.
          </h4>

        </Col>
      </Row>

      <Row className={styles.aboutRow}>
        <Col xs={12} className={styles.aboutContent}>
          <img src={BjorkProducts} alt="Products" className={styles.bjorkProducts} />
        </Col>
      </Row>
    </Container>
  );
};

export default About;

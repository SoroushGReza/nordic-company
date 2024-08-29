import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../styles/Aftercare.module.css";
import AfterCareImg from "../assets/images/AfterCare.png";
import LogoBlack from "../assets/images/nc-logo-black.png";
import Blueberry from "../assets/images/Blueberry.png";

const Aftercare = () => {
  return (
    <Container fluid className={styles.afterCareContainer}>
      <Row className={styles.afterCareRow}>
        <Col xs={12} className={styles.afterCareContent}>
          <img
            src={AfterCareImg}
            alt="After care"
            className={styles.afterCareImgTxt}
          />
        </Col>
      </Row>

      <Row className={styles.afterCareRow}>
        <Col xs={12} md={8} className={styles.afterCareContent}>
          <h1 className={styles.afterCareHeadingTitle}>Hair Services</h1>
          <h4 className={styles.afterCareHeadingTxtContent}>
            We recommend always using a schampoo, hair mask and conditioner to
            your hair routine & haircolor maintenance. After a blonding service
            aftercare is key. Use a silver schampoo 3 times a week + conditioner
            to maintain & reduce yellow tones. Always use heatprotection before
            styling your hair. we offer both a wet & dry heatprotection. A great
            oil benefit any hair. we offer 2 lights options that won’t feel
            greasy or heavy. Any colored or blonde hair needs uv protection to
            prolong the color from fading- specially during a sunny holiday or
            summertime. Between bigger appointments you can book a “toning”
            service just to refresh your blonde or colored hair and add some
            gloss back.
          </h4>
        </Col>
      </Row>

      <Row className={styles.preAppointmentRow}>
        <Col xs={12} className={styles.preAppointmentContent}>
          <img src={Blueberry} alt="White Logo" className={styles.blueberry} />
        </Col>
      </Row>

      <Row className={styles.afterCareRow}>
        <Col xs={12} className={styles.afterCareContent}>
          <img
            src={AfterCareImg}
            alt="After care"
            className={styles.afterCareImgTxt}
          />
        </Col>
      </Row>

      <Row className={styles.afterCareRow}>
        <Col xs={12} md={8} className={styles.afterCareContent}>
          <h1 className={styles.afterCareHeadingTitle}>Lashes / Brows</h1>
          <h4 className={styles.afterCareHeadingTxtContent}>
            Wash your lashes minimum once a day. Believe it or not but clean
            lashes is both healthier but also lasts better- but not forever.
            Don’t use heavy face creams/serums/sunscreen/oil based products
            around your eye area as they shorten the lashes lasting. Following a
            lashlift/browlift- avoid heat and water for the first 24h. After
            that makeup/products etc can be used as normal. When you have been
            swimming in pool or seawater- wash of your lashes right away with
            clean water. Please, dont try to remove lashes at home since oil or
            other products don’t actually dissolve the glue. You will most
            likely end up with damaged or even gaps in your lashline. Come to us
            for a much quicker and damage free removal.
          </h4>
        </Col>
      </Row>

      <Row className={styles.afterCareRow}>
        <Col xs={12} className={styles.afterCareContent}>
          <img
            src={LogoBlack}
            alt="Nordic Company"
            className={styles.logoBlack}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Aftercare;

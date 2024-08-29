import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../styles/PreAppointment.module.css";
import PreAppointmentImg from "../assets/images/PreAppointment.png";
import Schampoo from "../assets/images/Schampoo.png";
import LogoWhite from "../assets/images/nc-logo-white.png";

const PreAppointment = () => {
  return (
    <Container fluid className={styles.preAppointmentContainer}>
      <Row className={styles.preAppointmentRow}>
        <Col xs={12} className={styles.preAppointmentContent}>
          <img
            src={PreAppointmentImg}
            alt="Pre Appointment"
            className={styles.PreAppointmentImgTxt}
          />
        </Col>
      </Row>

      <Row className={styles.preAppointmentRow}>
        <Col xs={12} md={8} className={styles.preAppointmentContent}>
          <h1 className={styles.preAppointmentHeadingTitle}>Hair Services</h1>
          <h4 className={styles.preAppointmentHeadingTxtContent}>
            No need to wash your hair prior to appointment. it’s included in all
            our services. If you have a long sitting you can bring something to
            snack on or a favorite drink. However we do have a coffee and
            snackbar for all our bigger services for ex. highlights. Please
            bring at least 3 inspo photos so we can chat about your
            expectations. We have included toning in all blonding services
            because we want the best result. We provide package deals- it should
            be transparant what you get and not have to option out.You can
            always opt for a “silent appointment” if you don’t feel like
            talking.
          </h4>
        </Col>
      </Row>

      <Row className={styles.preAppointmentRow}>
        <Col xs={12} className={styles.preAppointmentContent}>
          <img src={Schampoo} alt="Products" className={styles.Schampoo} />
        </Col>
      </Row>

      <Row className={styles.preAppointmentRow}>
        <Col xs={12} className={styles.preAppointmentContent}>
          <img
            src={PreAppointmentImg}
            alt="Pre Appointment"
            className={styles.PreAppointmentImgTxt}
          />
        </Col>
      </Row>

      <Row className={styles.verticalLine}></Row>

      <Row className={styles.preAppointmentRow}>
        <Col xs={12} md={8} className={styles.preAppointmentContent}>
          <h1 className={styles.preAppointmentHeadingTitle}>Lashes / Brows</h1>
          <h4 className={styles.preAppointmentHeadingTxtContent}>
            PLease avoid any makeup/face creams around the eye/brow area. We
            wash your lashes prior to every lash service. We play podcasts and
            audiobooks during our services for relaxation. We encourage bringing
            earplugs if you prefer to listen to something of your own choice. We
            have a heated soft lashbed waiting for you- dont be shy to fall
            asleep. We love that! You can always opt for a “silent appointment”
            if you don’t feel like talking. Do not be afraid to openly discuss
            any questions or fears you might have coming into your appointment.
          </h4>
        </Col>
      </Row>

      <Row className={styles.preAppointmentRow}>
        <Col xs={12} className={styles.preAppointmentContent}>
          <img
            src={LogoWhite}
            alt="White Logo"
            className={styles.logoWhite}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default PreAppointment;

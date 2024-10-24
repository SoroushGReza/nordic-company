import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import styles from "../styles/Services.module.css";
import HairServicesImg from "../assets/images/HairServices.png";
import HairServicesImgTxt from "../assets/images/HairServicesImgTxt.png";
import LashServicesImgTxt from "../assets/images/LashServices.png";
import BrowServicesImgTxt from "../assets/images/BrowServices.png";
import LashImage from "../assets/images/lashes.png";
import BrowImage from "../assets/images/brows.png";
import { axiosReq } from "../api/axiosDefaults";

const Services = () => {
  const [hairServices, setHairServices] = useState([]);
  const [lashServices, setLashServices] = useState([]);
  const [browServices, setBrowServices] = useState([]); // State for Brow services
  const [loadingHair, setLoadingHair] = useState(true);
  const [loadingLashes, setLoadingLashes] = useState(true);
  const [loadingBrows, setLoadingBrows] = useState(true); // Loading state for Brows

  // Fetch Hair services on component mount
  useEffect(() => {
    const fetchHairServices = async () => {
      try {
        const response = await axiosReq.get("/categories/2/services/"); // Assume category ID 2 is "Hair"
        setHairServices(response.data);
      } catch (error) {
        console.error("Error fetching Hair services:", error);
      } finally {
        setLoadingHair(false);
      }
    };

    fetchHairServices();
  }, []);

  // Fetch Lashes services on component mount
  useEffect(() => {
    const fetchLashServices = async () => {
      try {
        const response = await axiosReq.get("/categories/3/services/"); // Assume category ID 3 is "Lashes"
        setLashServices(response.data);
      } catch (error) {
        console.error("Error fetching Lashes services:", error);
      } finally {
        setLoadingLashes(false);
      }
    };

    fetchLashServices();
  }, []);

  // Fetch Brow services on component mount
  useEffect(() => {
    const fetchBrowServices = async () => {
      try {
        const response = await axiosReq.get("/categories/4/services/"); // Assume category ID 4 is "Brows"
        setBrowServices(response.data);
      } catch (error) {
        console.error("Error fetching Brow services:", error);
      } finally {
        setLoadingBrows(false);
      }
    };

    fetchBrowServices();
  }, []);

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

      {/* Hair Services Section */}
      <Row className={styles.servicesRow}>
        <Col xs={12} md={8} className={styles.servicesContent}>
          <div className={styles.servicesBox}>
            <img
              src={HairServicesImgTxt}
              alt="Hair Services Title"
              className={styles.ServicesTitle}
            />
            {loadingHair ? (
              <div className="d-flex justify-content-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <ul className={styles.servicesList}>
                {hairServices.map((service) => (
                  <li key={service.id}>
                    {service.name}
                    <span>{parseInt(service.price)} EUR</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Col>
      </Row>

      {/* Lashes Services Section */}
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
            {loadingLashes ? (
              <div className="d-flex justify-content-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <ul className={styles.servicesList}>
                {lashServices.map((service) => (
                  <li key={service.id}>
                    {service.name}
                    <span>{parseInt(service.price)} EUR</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Col>
      </Row>

      {/* Brows Services Section */}
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
            {loadingBrows ? (
              <div className="d-flex justify-content-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <ul className={styles.servicesList}>
                {browServices.map((service) => (
                  <li key={service.id}>
                    {service.name}
                    <span>{parseInt(service.price)} EUR</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Services;

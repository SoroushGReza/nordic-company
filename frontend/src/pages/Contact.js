import React, { useState, useEffect } from "react";
// API 
import { axiosReq } from "../api/axiosDefaults";
// Utils
import { sendEmail } from "../utils/sendEmail";
// Hooks
import useAuthStatus from "../hooks/useAuthStatus";
// Styling & Images
import { Container, Row, Col, Button } from "react-bootstrap";
import styles from "../styles/Contact.module.css";
import ContactImgText from "../assets/images/Contact.png";
import PalmImg from "../assets/images/palm.png";
import LogoBlack from "../assets/images/nc-logo-black.png";
// Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const Contact = () => {
  const { isAuthenticated } = useAuthStatus();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          const { data: user } = await axiosReq.get("/accounts/profile/");
          setFormData((prevData) => ({
            ...prevData,
            name: `${user.name} ${user.surname}`,
            email: user.email,
          }));
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendEmail(formData);
      setEmailSent(true); // Visa bekräftelsen
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Error sending email:", error);
      alert("There was an error sending your message. Please try again later.");
    }
  };

  return (
    <div className={styles.contactPage}>
      {/* Palm Image */}
      <img src={PalmImg} alt="Palm Shadow" className={styles.palmImg} />

      <Container fluid>
        <Row className="justify-content-center">
          {/* Contact Image Text */}
          <Col
            xs={12}
            md={10}
            lg={8}
            className="text-center justify-content-center"
          >
            <img
              src={ContactImgText}
              alt="Contact Title"
              className={styles.ContactImgText}
            />
          </Col>
        </Row>
        {emailSent ? (
          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6} className="text-center">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className={styles.confirmationIcon}
              />
              <h3>Email sent successfully!</h3>
              <p>
                We will get back to you as soon as possible. Normally 24-48
                hours.
              </p>
            </Col>
          </Row>
        ) : (
          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6} className={styles.emailFormContainer}>
              <form onSubmit={handleSubmit} className={styles.contactForm}>
                <h2>Email</h2>
                <label>
                  Name:
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isAuthenticated}
                    placeholder="Your name here"
                  />
                </label>
                <label>
                  Email:
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required={!isAuthenticated}
                    placeholder="Your email here"
                  />
                </label>
                <label>
                  Phone (Optional):
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Your phone number (optional)"
                  />
                </label>
                <label>
                  Message:
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Your message here"
                  />
                </label>
                <Button type="submit" className={styles.sendButton}>
                  Send
                </Button>
              </form>
            </Col>
          </Row>
        )}

        <Row className="justify-content-center contact-footer">
          <Col xs={10} md={6} lg={4} className="text-center">
            <img
              src={LogoBlack}
              alt="Nordic Company"
              className={styles.LogoBlack}
            />
          </Col>
        </Row>

        <Row className="justify-content-center contact-footer">
          <Col xs={12} md={10} lg={6} className="text-center">
            <div className={styles.phoneInstagramContainer}>
              {/* Phone Section */}
              <div className={styles.phoneSection}>
                <h4>Phone</h4>
                <a href="tel:+46708480032" className={styles.contactPhone}>
                  +46 708 48 00 32
                </a>
                <p className={styles.whatsappText}>
                  <FontAwesomeIcon
                    icon={faWhatsapp}
                    className={styles.whatsappIcon}
                  />{" "}
                  Available on WhatsApp
                </p>
              </div>

              {/* Divider */}
              <div className={styles.divider}></div>

              {/* Instagram Section */}
              <div className={styles.instagramSection}>
                <h4>Instagram</h4>
                <a
                  href="https://www.instagram.com/facebykristine/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.instaLink}
                >
                  <FontAwesomeIcon
                    className={styles.instagram}
                    icon={faInstagram}
                  />
                </a>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Contact;

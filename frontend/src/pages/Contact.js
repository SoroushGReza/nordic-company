import React, { useState, useEffect } from "react";
import useAuthStatus from "../hooks/useAuthStatus";
import { Container, Row, Col, Button } from "react-bootstrap";
import styles from "../styles/Contact.module.css";
import ContactImg from "../assets/images/Contact.png";
import PalmImg from "../assets/images/palm.png";
import LogoBlack from "../assets/images/nc-logo-black.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { sendEmail } from "../utils/sendEmail";
import { axiosReq } from "../api/axiosDefaults";

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
          <Col xs={12} md={10} lg={8} className="text-center">
            <img
              src={ContactImg}
              alt="Contact Title"
              className={styles.contactTitle}
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
            <Col xs={12} md={8} lg={6} className={styles.contactFormContainer}>
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
          <Col xs={12} md={6} lg={4} className="text-center">
            <img
              src={LogoBlack}
              alt="Nordic Company"
              className={styles.contactLogo}
            />
            <div className={styles.contactFormContainer}>
              <h4>Phone</h4>
              <a href="tel:+46708234455" className={styles.contactPhone}>
                +46 708 23 44 55
              </a>
              <p className={styles.whatsappText}>Available on WhatsApp</p>
            </div>
          </Col>
          {/* Instagram Link */}
          <a
            href="https://www.instagram.com/facebykristine/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles["link"]} text-center mt-4`}
          >
            <FontAwesomeIcon className={styles.instagram} icon={faInstagram} />
          </a>
        </Row>
      </Container>
    </div>
  );
};

export default Contact;

import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { axiosReq } from "../api/axiosDefaults";
import styles from "../styles/Register.module.css";
import inputStyles from "../styles/ServiceManagement.module.css";
import RegisterTxtImg from "../assets/images/Register.png";
import PalmImg3 from "../assets/images/palm3.png";
import AccountAlerts from "../components/AccountAlerts";

const Register = () => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      setErrorMessage("Passwords do not match");
      return;
    }
    try {
      await axiosReq.post("/accounts/register/", {
        name,
        surname,
        phone_number: phoneNumber,
        email,
        password,
      });

      setSuccessMessage("Account created successfully!");
      const response = await axiosReq.post("/accounts/login/", {
        email,
        password,
      });

      localStorage.setItem("refresh", response.data.refresh);
      localStorage.setItem("access", response.data.access);

      navigate("/");
    } catch (error) {
      setErrorMessage("Registration failed. Please try again.");
    }
  };

  return (
    <Container fluid className={styles.registerContainer}>
      <AccountAlerts
        successMessage={successMessage}
        setSuccessMessage={setSuccessMessage}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
      <img src={PalmImg3} alt="Palm Shadow" className={styles.palmImg3} />
      <Row className="justify-content-center">
        <Col md={6} className={styles.formCol}>
          <div className={styles.formWrapper}>
            <Row className="justify-content-center">
              <Col xs={12} className="d-flex justify-content-center">
                <img
                  src={RegisterTxtImg}
                  alt="Register"
                  className={styles.pageImgTxt}
                />
              </Col>
            </Row>

            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formName">
                <Form.Label className={styles.customLabel}>Name</Form.Label>
                <Form.Control
                  className={`${inputStyles["form-input"]} ${styles["customInput"]}`}
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formSurname">
                <Form.Label className={styles.customLabel}>Surname</Form.Label>
                <Form.Control
                  className={`${inputStyles["form-input"]} ${styles["customInput"]}`}
                  type="text"
                  placeholder="Enter your surname"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formPhoneNumber">
                <Form.Label className={styles.customLabel}>
                  Phone Number
                </Form.Label>
                <Form.Control
                  className={`${inputStyles["form-input"]} ${styles["customInput"]}`}
                  type="text"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formEmail">
                <Form.Label className={styles.customLabel}>Email</Form.Label>
                <Form.Control
                  className={`${inputStyles["form-input"]} ${styles["customInput"]}`}
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formPassword">
                <Form.Label className={styles.customLabel}>Password</Form.Label>
                <Form.Control
                  className={`${inputStyles["form-input"]} ${styles["customInput"]}`}
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formPassword2">
                <Form.Label className={styles.customLabel}>
                  Confirm Password
                </Form.Label>
                <Form.Control
                  className={`${inputStyles["form-input"]} ${styles["customInput"]}`}
                  type="password"
                  placeholder="Confirm Password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                />
              </Form.Group>

              <div className="d-flex justify-content-center">
                <Button
                  className={styles.customButton}
                  variant="primary"
                  type="submit"
                >
                  Register
                </Button>
              </div>
              <Row className="justify-content-center">
                <Col className={`${styles.msgLinkTxt} text-center`} md={12}>
                  <h3>
                    {" "}
                    Already a member?{" "}
                    <Link className={styles.msgLink} to="/login">
                      Login
                    </Link>
                  </h3>
                </Col>
              </Row>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;

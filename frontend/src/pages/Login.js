import React, { useState, useRef, useEffect } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { axiosReq } from "../api/axiosDefaults";
import styles from "../styles/Register.module.css";
import inputStyles from "../styles/ServiceManagement.module.css";
import LoginTxtImg from "../assets/images/Login.png";
import PalmImg2 from "../assets/images/palm2.png";
import AccountAlerts from "../components/AccountAlerts";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (emailRef.current) emailRef.current.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosReq.post("/accounts/login/", {
        email,
        password,
      });

      // Save JWT token in localStorage
      localStorage.setItem("refresh", response.data.refresh);
      localStorage.setItem("access", response.data.access);

      // Navigate to home page
      navigate("/");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Failed to login. Please check your credentials and try again."
      );
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
      <img src={PalmImg2} alt="Palm Shadow" className={styles.palmImg2} />
      <Row className="justify-content-center">
        <Col md={6} className={styles.formCol}>
          <div className={styles.formWrapper}>
            <Row className="justify-content-center">
              <Col xs={12} className="d-flex justify-content-center">
                <img
                  src={LoginTxtImg}
                  alt="Register"
                  className={styles.pageImgTxt}
                />
              </Col>
            </Row>
            <Form onSubmit={handleSubmit} autoComplete="on">
              <Form.Group controlId="formEmail">
                <Form.Label className={styles.customLabel}>
                  Email address
                </Form.Label>
                <Form.Control
                  ref={emailRef}
                  className={`${inputStyles["form-input"]} ${styles["customInput"]}`}
                  type="email"
                  name="email"
                  autoComplete="username"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formPassword">
                <Form.Label className={styles.customLabel}>Password</Form.Label>
                <Form.Control
                  ref={passwordRef}
                  className={`${inputStyles["form-input"]} ${styles["customInput"]}`}
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <div className="d-flex justify-content-center">
                <Button
                  variant="primary"
                  type="submit"
                  className={styles.customButton}
                >
                  Login
                </Button>
              </div>
              <Row className="justify-content-center">
                <Col className={`${styles.msgLinkTxt} text-center`} md={12}>
                  <h3>
                    {" "}
                    Don't have an account?{" "}
                    <Link className={styles.msgLink} to="/register">
                      Register
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

export default Login;

import React, { useState, useRef, useEffect } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { axiosReq } from "../api/axiosDefaults";
import styles from "../styles/Register.module.css";
import LoginTxtImg from "../assets/images/Login.png";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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

            // Spara JWT-token i localStorage
            localStorage.setItem("refresh", response.data.refresh);
            localStorage.setItem("access", response.data.access);

            // Navigera till hemsidan
            navigate("/");
        } catch (error) {
            console.error(error);
            alert("Failed to login. Please check your credentials and try again.");
        }
    };

    return (
        <Container fluid className={styles.registerContainer}>
            <Row className="justify-content-center">
                <Col md={6} className={styles.formCol}>
                    <div className={styles.formWrapper}>
                        <Row className="justify-content-center">
                            <Col xs={12} className="d-flex justify-content-center">
                                <img src={LoginTxtImg} alt="Register" className={styles.pageImgTxt} />
                            </Col>
                        </Row>
                        <Form onSubmit={handleSubmit} autoComplete="on">
                            <Form.Group controlId="formEmail">
                                <Form.Label className={styles.customLabel}>Email address</Form.Label>
                                <Form.Control
                                    ref={emailRef}
                                    className={styles.customInput}
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
                                    className={styles.customInput}
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
                                <Button variant="primary" type="submit" className={styles.customButton}>
                                    Login
                                </Button>
                            </div>
                            <Row className="justify-content-center">
                                <Col className={`${styles.msgLinkTxt} text-center`} md={12}>
                                    <h3> Don't have an account? <Link className={styles.msgLink} to="/register">Register</Link></h3>
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

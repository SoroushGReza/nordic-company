import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { axiosReq } from "../api/axiosDefaults";
import styles from "../styles/Register.module.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

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
            <Row>
                <Col md={{ span: 6, offset: 3 }}>
                    <h2 className={styles.registerHeader}>Login</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formEmail">
                            <Form.Label className={styles.customLabel}>Email address</Form.Label>
                            <Form.Control
                                className={styles.customInput}
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
                                className={styles.customInput}
                                type="password"
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
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;

import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { axiosReq } from "../api/axiosDefaults";
import styles from "../styles/Register.module.css";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== password2) {
            alert("Passwords do not match");
            return;
        }
        try {
            await axiosReq.post("/accounts/register/", {
                email,
                password,
                password2,
                name,            
                surname,
                phone_number: phoneNumber
            });

            navigate("/login");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Container fluid className={styles.registerContainer}>
            <Row>
                <Col md={{ span: 6, offset: 3 }}>
                    <h2 className={styles.registerHeader}>Register</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formEmail">
                            <Form.Label className={styles.customLabel}>Email</Form.Label>
                            <Form.Control
                                className={styles.customInput}
                                type="email"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                            />
                        </Form.Group>

                        <Form.Group controlId="formPassword2">
                            <Form.Label className={styles.customLabel}>Confirm Password</Form.Label>
                            <Form.Control
                                className={styles.customInput}
                                type="password"
                                placeholder="Confirm Password"
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId="formName">
                            <Form.Label className={styles.customLabel}>Name</Form.Label>
                            <Form.Control
                                className={styles.customInput}
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId="formSurname">
                            <Form.Label className={styles.customLabel}>Surname</Form.Label>
                            <Form.Control
                                className={styles.customInput}
                                type="text"
                                placeholder="Enter your surname"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId="formPhoneNumber">
                            <Form.Label className={styles.customLabel}>Phone Number</Form.Label>
                            <Form.Control
                                className={styles.customInput}
                                type="text"
                                placeholder="Enter your phone number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Register
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;

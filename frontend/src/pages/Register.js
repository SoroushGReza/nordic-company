import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { axiosReq } from "../api/axiosDefaults";
import styles from "../styles/Register.module.css";
import RegisterTxtImg from "../assets/images/Register.png";

const Register = () => {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== password2) {
            alert("Passwords do not match");
            return;
        }
        try {
            // Registrera användaren
            await axiosReq.post("/accounts/register/", {
                name,
                surname,
                phone_number: phoneNumber,
                email,
                password,
            });

            // Logga in användaren automatiskt efter registrering
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
            alert("Registration failed. Please try again.");
        }
    };


    return (
        <Container fluid className={styles.registerContainer}>
            <Row className="justify-content-center">
                <Col md={6} className={styles.formCol}>
                    <div className={styles.formWrapper}>
                        <Row className="justify-content-center">
                            <Col xs={12} className="d-flex justify-content-center">
                                <img src={RegisterTxtImg} alt="Register" className={styles.pageImgTxt} />
                            </Col>
                        </Row>
                        {/*<h2 className={styles.registerHeader}>Register</h2>*/}
                        <Form onSubmit={handleSubmit}>

                            <Form.Group controlId="formName">
                                <Form.Label className={styles.customLabel}>Name</Form.Label>
                                <Form.Control
                                    className={styles.customInput}
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
                                    className={styles.customInput}
                                    type="text"
                                    placeholder="Enter your surname"
                                    value={surname}
                                    onChange={(e) => setSurname(e.target.value)}
                                    required
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
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formEmail">
                                <Form.Label className={styles.customLabel}>Email</Form.Label>
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

                            <Form.Group controlId="formPassword2">
                                <Form.Label className={styles.customLabel}>Confirm Password</Form.Label>
                                <Form.Control
                                    className={styles.customInput}
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <div className="d-flex justify-content-center">
                                <Button className={styles.customButton} variant="primary" type="submit">
                                    Register
                                </Button>
                            </div>
                            <Row className="justify-content-center">
                                <Col className={`${styles.msgLinkTxt} text-center`} md={12}>
                                    <h3> Already a member? <Link className={styles.msgLink} to="/login">Login</Link></h3>
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

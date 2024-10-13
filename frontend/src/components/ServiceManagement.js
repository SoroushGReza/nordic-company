import React, { useState, useEffect } from "react";
import { Button, Form, Alert, Row, Col } from "react-bootstrap";
import { axiosReq } from "../api/axiosDefaults";
import styles from "../styles/ServiceManagement.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

const ServiceManagement = ({ services = [], setServices, onEditService, onDeleteService }) => {
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false); // Form visibility state
    const [showInformation, setShowInformation] = useState(false);


    // Handle clicks outside the form to hide it and show "Add Service" button again
    useEffect(() => {
        const handleClickOutside = (event) => {
            const formElement = document.getElementById("service-form");
            if (formElement && !formElement.contains(event.target)) {
                closeServiceForm();
            }
        };

        if (showForm) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showForm]);

    // Clear error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null); // Clear the error after 5 seconds
            }, 5000);

            return () => clearTimeout(timer); // Cleanup timer on unmount
        }
    }, [error]);

    // ADD SERVICE
    const toggleInformationField = () => {
        setShowInformation(!showInformation);
    };

    const handleAddService = async (newService) => {
        try {
            const response = await axiosReq.post(`/admin/services/`, newService);
            setServices((prevServices) => [...prevServices, response.data]); // Append new service
            setShowForm(false); // Close form after adding
            setError(null); // Clear error if successful
        } catch (err) {
            setError("Error adding service");
        }
    };

    const handleServiceSubmit = (event) => {
        event.preventDefault();
        const form = event.target;

        // Security checks with optional chaining and fallback values
        const serviceData = {
            name: form.name?.value || "",
            worktime: form.worktime?.value || "",
            price: parseFloat(form.price?.value) || 0,
            information: form.information?.value || "",
        };

        handleAddService(serviceData); // Add Service directly
    };

    const openServiceForm = () => {
        setShowForm(true); // Show form
    };

    const closeServiceForm = () => {
        setShowForm(false); // Hide form and reset state
    };

    return (
        <div>
            {!showForm && ( // Show "Add Service" button when form is not visible
                <Button onClick={openServiceForm} className={`${styles["add-service-btn"]}`}>
                    Add Service <FontAwesomeIcon icon={faCaretDown} />
                </Button>
            )}

            {showForm && (
                <Form id="service-form" onSubmit={handleServiceSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Row className="justify-content-center">
                        {/* Service name field */}
                        <Col md={4} className="d-flex justify-content-center">
                            <Form.Group controlId="name">
                                <Form.Label className={styles["form-label"]}>Service Name</Form.Label>
                                <Form.Control className={styles["form-input"]} type="text" name="name" required />
                            </Form.Group>
                        </Col>
                        {/* Worktime field */}
                        <Col md={4} className="d-flex justify-content-center">
                            <Form.Group controlId="worktime">
                                <Form.Label className={styles["form-label"]}>Work Time <span className={styles["label-span"]}>(HH:MM:SS)</span></Form.Label>
                                <Form.Control className={styles["form-input"]} type="text" name="worktime" required />
                            </Form.Group>
                        </Col>
                        {/* Price field */}
                        <Col md={4} className="d-flex justify-content-center">
                            <Form.Group controlId="price">
                                <Form.Label className={styles["form-label"]}>Price</Form.Label>
                                <Form.Control className={styles["form-input"]} type="number" step="0.01" name="price" required />
                            </Form.Group>
                        </Col>
                    </Row>
                    {/* Show Information field when button is klicked */}
                    {!showInformation && (
                        <Row className="justify-content-center mt-3">
                            <Col md={8} className="d-flex justify-content-center">
                                <Button onClick={toggleInformationField} className={styles["more-fields-btn"]}>
                                    More <FontAwesomeIcon icon={faCaretDown} />
                                </Button>
                            </Col>
                        </Row>
                    )}
                    {/* Information field */}
                    {showInformation && (
                        <Row className="justify-content-center mt-3">
                            <Col md={8} className="d-flex flex-column align-items-center"> {/* Flex column för vertikal centrering */}
                                <Form.Group controlId="information" className="w-100 text-center"> {/* Center align i form-group */}
                                    <Form.Label className={`${styles["form-label"]}`}>Information</Form.Label> {/* Label är centrerad */}
                                    <Form.Control
                                        className={`${styles["form-input"]} ${styles["information-input"]}`} // 60% bredd, centrerad
                                        as="textarea"
                                        rows={3}
                                        name="information"
                                        style={{ width: '60%', margin: '0 auto' }} // Inline styling för att centrera
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    )}

                    <Button type="submit" className={`${styles["add-service-btn"]} mt-3`}>
                        Add Service
                    </Button>
                </Form>
            )}
        </div>
    );
};

export default ServiceManagement;

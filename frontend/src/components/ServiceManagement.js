import React, { useState, useEffect } from "react";
import { Button, Form, Alert, Row, Col, Spinner } from "react-bootstrap";
import { axiosReq } from "../api/axiosDefaults";
import styles from "../styles/ServiceManagement.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

const ServiceManagement = ({ services = [], setServices, onEditService, onDeleteService }) => {
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false); // Form visibility state
    const [showInformation, setShowInformation] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Fetch categories from backend
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosReq.get("/categories/");
                setCategories(response.data);

                const generalCategory = response.data.find(cat => cat.name === "General");
                if (generalCategory) {
                    setSelectedCategory(generalCategory.id);
                } else if (response.data.length > 0) {
                    setSelectedCategory(response.data[0].id);
                }

                setLoadingCategories(false);
            } catch (err) {
                setError("Error fetching categories");
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

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

    // Toggle information field visibility
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

        // Collect form data
        const serviceData = {
            name: form.name?.value || "",
            worktime: form.worktime?.value || "",
            price: parseFloat(form.price?.value) || 0,
            information: form.information?.value || "",
            category: selectedCategory,
        };

        handleAddService(serviceData);
    };

    const openServiceForm = () => {
        setShowForm(true); 
    };

    const closeServiceForm = () => {
        setShowForm(false); 
    };

    return (
        <div>
            {!showForm && (
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

                    {/* Category dropdown */}
                    <Row className="justify-content-center mt-3">
                        <Col md={8} className="d-flex justify-content-center">
                            <Form.Group controlId="category" className="w-100">
                                <Form.Label className={styles["form-label"]}>Category</Form.Label>
                                {loadingCategories ? (
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                ) : (
                                    <Form.Select
                                        className={styles["form-input"]}
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        required
                                    >
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>

                    {!showInformation && (
                        <Row className="justify-content-center mt-3">
                            <Col md={8} className="d-flex justify-content-center">
                                <Button onClick={toggleInformationField} className={styles["more-fields-btn"]}>
                                    More <FontAwesomeIcon icon={faCaretDown} />
                                </Button>
                            </Col>
                        </Row>
                    )}
                    {showInformation && (
                        <Row className="justify-content-center mt-3">
                            <Col md={8} className="d-flex flex-column align-items-center">
                                <Form.Group controlId="information" className="w-100 text-center">
                                    <Form.Label className={`${styles["form-label"]}`}>Information</Form.Label>
                                    <Form.Control
                                        className={`${styles["form-input"]} ${styles["information-input"]}`}
                                        as="textarea"
                                        rows={3}
                                        name="information"
                                        style={{ width: '60%', margin: '0 auto' }}
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

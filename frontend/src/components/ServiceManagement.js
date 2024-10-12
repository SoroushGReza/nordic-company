import React, { useState } from "react";
import {
    Dropdown,
    DropdownButton,
    Button,
    Form,
    Alert,
    Row,
    Col,
} from "react-bootstrap";
import { axiosReq } from "../api/axiosDefaults";

const ServiceManagement = ({ services = [], setServices }) => {
    const [error, setError] = useState(null);
    const [currentService, setCurrentService] = useState(null);

    // Form state
    const [showForm, setShowForm] = useState(false);

    const handleServiceUpdate = async (serviceId, updatedData) => {
        try {
            const response = await axiosReq.put(
                `/admin/services/${serviceId}/`,
                updatedData
            );
            setServices(
                services.map((service) =>
                    service.id === serviceId ? response.data : service
                )
            );
            setCurrentService(null);
            setShowForm(false);
        } catch (err) {
            setError("Error updating service");
        }
    };

    const handleDeleteService = async (serviceId) => {
        try {
            await axiosReq.delete(`/admin/services/${serviceId}/`);
            setServices(
                services.filter((service) => service.id !== serviceId)
            );
        } catch (err) {
            setError("Error deleting service");
        }
    };

    const handleAddService = async (newService) => {
        try {
            const response = await axiosReq.post(`/admin/services/`, newService);
            setServices([...services, response.data]);
            setShowForm(false);
        } catch (err) {
            setError("Error adding service");
        }
    };

    const handleServiceSubmit = (event) => {
        event.preventDefault();
        const form = event.target;
        const serviceData = {
            name: form.name.value,
            worktime: form.worktime.value,
            price: parseFloat(form.price.value),
        };

        if (currentService) {
            handleServiceUpdate(currentService.id, serviceData);
        } else {
            handleAddService(serviceData);
        }
    };

    const openServiceForm = (service = null) => {
        setCurrentService(service);
        setShowForm(true);
    };

    const closeServiceForm = () => {
        setCurrentService(null);
        setShowForm(false);
    };

    return (
        <div>
            <DropdownButton id="dropdown-basic-button" title="Manage Services">
                <Dropdown.Item onClick={() => openServiceForm()}>
                    Add Service
                </Dropdown.Item>
                {services && services.length > 0 ? (
                    services.map((service) => (
                        <Dropdown.Item key={service.id}>
                            {service.name}{" "}
                            <Button
                                variant="link"
                                onClick={() => openServiceForm(service)}
                            >
                                Edit
                            </Button>{" "}
                            <Button
                                variant="link"
                                className="text-danger"
                                onClick={() => handleDeleteService(service.id)}
                            >
                                Delete
                            </Button>
                        </Dropdown.Item>
                    ))
                ) : (
                    <Dropdown.Item>No services available</Dropdown.Item>
                )}
            </DropdownButton>

            {showForm && (
                <Form onSubmit={handleServiceSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Row>
                        <Col>
                            <Form.Group controlId="name">
                                <Form.Label>Service Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    defaultValue={currentService?.name || ""}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="worktime">
                                <Form.Label>Work Time (HH:MM:SS)</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="worktime"
                                    defaultValue={currentService?.worktime || ""}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="price">
                                <Form.Label>Price</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    name="price"
                                    defaultValue={currentService?.price || ""}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button type="submit" variant="primary">
                        {currentService ? "Update Service" : "Add Service"}
                    </Button>{" "}
                    <Button
                        variant="secondary"
                        onClick={closeServiceForm}
                    >
                        Cancel
                    </Button>
                </Form>
            )}
        </div>
    );
};

export default ServiceManagement;

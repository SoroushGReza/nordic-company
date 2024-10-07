import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Modal, Form, Alert } from "react-bootstrap";
import { axiosReq } from "../api/axiosDefaults";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
    const [services, setServices] = useState([]);
    const [error, setError] = useState(null);
    const [isSuperuser, setIsSuperuser] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axiosReq.get("/accounts/profile/");
                if (response.data.is_superuser) {
                    setIsSuperuser(true);
                    fetchAdminData();  // Call the admin data fetching function
                } else {
                    navigate("/");
                }
            } catch (err) {
                setError("Error checking admin status");
            }
        };

        // Fetch admin data, services only
        const fetchAdminData = async () => {
            try {
                const servicesRes = await axiosReq.get("/admin/services/");
                setServices(servicesRes.data);
            } catch (err) {
                setError("Error fetching services data");
            }
        };

        fetchUserProfile();  // Initiate user profile fetching, which leads to admin data fetching
    }, [navigate]);

    const handleServiceUpdate = async (serviceId, updatedData) => {
        try {
            const response = await axiosReq.put(`/admin/services/${serviceId}/`, updatedData);
            setServices(services.map(service => (service.id === serviceId ? response.data : service)));
            setShowServiceModal(false);
        } catch (err) {
            setError("Error updating service");
        }
    };

    const handleDeleteService = async (serviceId) => {
        try {
            await axiosReq.delete(`/admin/services/${serviceId}/`);
            setServices(services.filter(service => service.id !== serviceId));
        } catch (err) {
            setError("Error deleting service");
        }
    };

    const handleAddService = async (newService) => {
        try {
            const response = await axiosReq.post(`/admin/services/`, newService);
            setServices([...services, response.data]);
            setShowServiceModal(false);
        } catch (err) {
            setError("Error adding service");
        }
    };

    const openServiceModal = (service = null) => {
        setCurrentService(service);
        setShowServiceModal(true);
    };

    const closeServiceModal = () => {
        setCurrentService(null);
        setShowServiceModal(false);
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

    if (!isSuperuser) {
        return <div>Loading...</div>;
    }

    return (
        <Container>
            <h1>Admin Page</h1>
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Services Section */}
            <Row>
                <Col>
                    <h2>Manage Services</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Work Time</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(service => (
                                <tr key={service.id}>
                                    <td>{service.name}</td>
                                    <td>{service.worktime}</td>
                                    <td>{service.price}</td>
                                    <td>
                                        <Button onClick={() => openServiceModal(service)}>Edit</Button>
                                        <Button variant="danger" onClick={() => handleDeleteService(service.id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Button onClick={() => openServiceModal()}>Add Service</Button>
                </Col>
            </Row>

            {/* Modal for adding/editing services */}
            <Modal show={showServiceModal} onHide={closeServiceModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentService ? "Edit Service" : "Add Service"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleServiceSubmit}>
                        <Form.Group controlId="name">
                            <Form.Label>Service Name</Form.Label>
                            <Form.Control type="text" name="name" defaultValue={currentService?.name || ""} required />
                        </Form.Group>
                        <Form.Group controlId="worktime">
                            <Form.Label>Work Time (format: HH:MM:SS)</Form.Label>
                            <Form.Control type="text" name="worktime" defaultValue={currentService?.worktime || ""} required />
                        </Form.Group>
                        <Form.Group controlId="price">
                            <Form.Label>Price</Form.Label>
                            <Form.Control type="number" step="0.01" name="price" defaultValue={currentService?.price || ""} required />
                        </Form.Group>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={closeServiceModal}>Cancel</Button>
                            <Button type="submit" variant="primary">
                                {currentService ? "Update Service" : "Add Service"}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default AdminPage;

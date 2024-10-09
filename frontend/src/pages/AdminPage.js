import React, { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Table,
    Button,
    Modal,
    Form,
    Alert,
} from "react-bootstrap";
import { axiosReq } from "../api/axiosDefaults";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
    const [services, setServices] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [isSuperuser, setIsSuperuser] = useState(false);

    // Modals state
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [currentService, setCurrentService] = useState(null);

    const [showBookingModal, setShowBookingModal] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axiosReq.get("/accounts/profile/");
                if (response.data.is_superuser) {
                    setIsSuperuser(true);
                    fetchAdminData(); // Fetch services, bookings, and users
                } else {
                    navigate("/");
                }
            } catch (err) {
                setError("Error checking admin status");
            }
        };

        const fetchAdminData = async () => {
            try {
                // Fetch Services
                const servicesRes = await axiosReq.get("/admin/services/");
                setServices(servicesRes.data);

                // Fetch Bookings
                const bookingsRes = await axiosReq.get("/admin/bookings/");
                setBookings(bookingsRes.data);

                // Fetch Users
                const usersRes = await axiosReq.get("/accounts/users/");
                setUsers(usersRes.data);
            } catch (err) {
                setError("Error fetching admin data");
            }
        };

        fetchUserProfile();
    }, [navigate]);

    // Service Handlers
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
            setShowServiceModal(false);
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

    // Booking Handlers
    const handleBookingUpdate = async (bookingId, updatedData) => {
        try {
            const response = await axiosReq.put(
                `/admin/bookings/${bookingId}/`,
                updatedData
            );
            setBookings(
                bookings.map((booking) =>
                    booking.id === bookingId ? response.data : booking
                )
            );
            setShowBookingModal(false);
        } catch (err) {
            setError(
                err.response?.data?.error || "Error updating booking"
            );
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        try {
            await axiosReq.delete(`/admin/bookings/${bookingId}/`);
            setBookings(
                bookings.filter((booking) => booking.id !== bookingId)
            );
        } catch (err) {
            setError("Error deleting booking");
        }
    };

    const handleAddBooking = async (newBooking) => {
        try {
            const response = await axiosReq.post(
                `/admin/bookings/`,
                newBooking
            );
            setBookings([...bookings, response.data]);
            setShowBookingModal(false);
        } catch (err) {
            setError(
                err.response?.data?.error || "Error adding booking"
            );
        }
    };

    const openBookingModal = (booking = null) => {
        setCurrentBooking(booking);
        setShowBookingModal(true);
    };

    const closeBookingModal = () => {
        setCurrentBooking(null);
        setShowBookingModal(false);
    };

    const handleBookingSubmit = (event) => {
        event.preventDefault();
        const form = event.target;
        const bookingData = {
            user: parseInt(form.user.value),
            service_ids: Array.from(form.services.options)
                .filter((option) => option.selected)
                .map((option) => parseInt(option.value)),
            date_time: form.date_time.value,
        };

        if (currentBooking) {
            handleBookingUpdate(currentBooking.id, bookingData);
        } else {
            handleAddBooking(bookingData);
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
                            {services.map((service) => (
                                <tr key={service.id}>
                                    <td>{service.name}</td>
                                    <td>{service.worktime}</td>
                                    <td>{service.price}</td>
                                    <td>
                                        <Button
                                            onClick={() =>
                                                openServiceModal(service)
                                            }
                                        >
                                            Edit
                                        </Button>{" "}
                                        <Button
                                            variant="danger"
                                            onClick={() =>
                                                handleDeleteService(service.id)
                                            }
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Button onClick={() => openServiceModal()}>
                        Add Service
                    </Button>
                </Col>
            </Row>

            {/* Bookings Section */}
            <Row>
                <Col>
                    <h2>Manage Bookings</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Services</th>
                                <th>Date & Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>
                                        {users.find(
                                            (user) => user.id === booking.user
                                        )?.email || booking.user}
                                    </td>
                                    <td>
                                        {booking.services
                                            .map((service) => service.name)
                                            .join(", ")}
                                    </td>
                                    <td>{new Date(booking.date_time).toLocaleString()}</td>
                                    <td>
                                        <Button
                                            onClick={() =>
                                                openBookingModal(booking)
                                            }
                                        >
                                            Edit
                                        </Button>{" "}
                                        <Button
                                            variant="danger"
                                            onClick={() =>
                                                handleDeleteBooking(booking.id)
                                            }
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Button onClick={() => openBookingModal()}>
                        Add Booking
                    </Button>
                </Col>
            </Row>

            {/* Modal for adding/editing services */}
            <Modal show={showServiceModal} onHide={closeServiceModal}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {currentService ? "Edit Service" : "Add Service"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleServiceSubmit}>
                        <Form.Group controlId="name">
                            <Form.Label>Service Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                defaultValue={currentService?.name || ""}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="worktime">
                            <Form.Label>Work Time (format: HH:MM:SS)</Form.Label>
                            <Form.Control
                                type="text"
                                name="worktime"
                                defaultValue={currentService?.worktime || ""}
                                required
                            />
                        </Form.Group>
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
                        <Modal.Footer>
                            <Button
                                variant="secondary"
                                onClick={closeServiceModal}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                {currentService
                                    ? "Update Service"
                                    : "Add Service"}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal for adding/editing bookings */}
            <Modal show={showBookingModal} onHide={closeBookingModal}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {currentBooking ? "Edit Booking" : "Add Booking"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleBookingSubmit}>
                        <Form.Group controlId="user">
                            <Form.Label>User</Form.Label>
                            <Form.Control
                                as="select"
                                name="user"
                                defaultValue={currentBooking?.user || ""}
                                required
                            >
                                <option value="">Select User</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.email}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="services">
                            <Form.Label>Services</Form.Label>
                            <Form.Control
                                as="select"
                                name="services"
                                multiple
                                defaultValue={
                                    currentBooking
                                        ? currentBooking.services.map(
                                            (service) => service.id
                                        )
                                        : []
                                }
                                required
                            >
                                {services.map((service) => (
                                    <option
                                        key={service.id}
                                        value={service.id}
                                    >
                                        {service.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="date_time">
                            <Form.Label>Date & Time</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                name="date_time"
                                defaultValue={
                                    currentBooking
                                        ? new Date(
                                            currentBooking.date_time
                                        )
                                            .toISOString()
                                            .slice(0, 16)
                                        : ""
                                }
                                required
                            />
                        </Form.Group>
                        <Modal.Footer>
                            <Button
                                variant="secondary"
                                onClick={closeBookingModal}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                {currentBooking
                                    ? "Update Booking"
                                    : "Add Booking"}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default AdminPage;

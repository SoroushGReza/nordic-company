import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Alert, Modal, Tooltip } from "react-bootstrap";
import { Calendar, luxonLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { axiosReq } from "../api/axiosDefaults";
import styles from "../styles/Bookings.module.css";
import modalStyles from "../styles/Modals.module.css"
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from "react-router-dom";
import ServiceManagement from "../components/ServiceManagement";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import ServiceInfo from "../components/ServiceInfo";
import { DateTime } from 'luxon';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useBookingEvents from "../hooks/useBookingEvents";


const localizer = luxonLocalizer(DateTime);

// Show Date and day / Date based on screen size
const CustomHeader = ({ date }) => {
    const isMobile = useMediaQuery({ query: '(max-width: 992px)' });
    const day = date.getDay();

    // Determine the class based on the day
    const headerClass =
        day === 0 || day === 6 // Sunday or Saturday
            ? styles['weekend-header']
            : styles['weekday-header'];

    // Format date based on screen size using Luxon
    const formattedDate = isMobile
        ? DateTime.fromJSDate(date).toFormat('dd')
        : DateTime.fromJSDate(date).toFormat('dd EEE'); // Show only day for mobile

    return (
        <div className={`${headerClass} rbc-button-link`}>
            <span role="columnheader" aria-sort="none">{formattedDate}</span>
        </div>
    );
};

// Function to convert "HH:MM:SS" to minutes
const parseWorktimeToMinutes = (worktime) => {
    const [hours, minutes, seconds] = worktime.split(':').map(Number);
    return hours * 60 + minutes + seconds / 60;
};

// Calculate total duration of selected services
const calculateBookingDuration = (services) => {
    const totalMinutes = services.reduce((total, service) => {
        return total + parseWorktimeToMinutes(service.worktime);
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    return `${hours}h ${minutes > 0 ? `${minutes}min` : ''}`.trim();
};

// Convert Worktime to Readable Format 
const convertWorktimeToReadableFormat = (worktime) => {
    const [hours, minutes] = worktime.split(':').map(Number);
    return `${hours > 0 ? `${hours}h` : ''} ${minutes > 0 ? `${minutes} minutes` : ''}`.trim();
}

// Calculate total price for chosen services
const calculateTotalPrice = (services) => {
    return services.reduce((total, service) => total + parseFloat(service.price), 0);
};

// Info Tooltip
const renderTooltip = (service) => (
    <Tooltip id={`tooltip-${service.id}`}>
        <div>
            <strong>Price:</strong> {service.price} EUR <br />
            {service.information && (
                <>
                    <strong>Information:</strong> <br />
                    <span>{service.information}</span>
                </>
            )}
        </div>
    </Tooltip>
);

const AdminBookings = () => {
    const { events, refreshEvents } = useBookingEvents(true);
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [selectedTime, setSelectedTime] = useState(null);
    const [totalWorktime, setTotalWorktime] = useState(0); // Storing total worktime
    const [totalDuration, setTotalDuration] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [timezoneMessage, setTimezoneMessage] = useState("");
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);
    const [users, setUsers] = useState([]);
    const [modalSelectedServices, setModalSelectedServices] = useState([]);
    const navigate = useNavigate();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const todayMin = DateTime.local().setZone('Europe/Dublin').set({ hour: 8, minute: 0, second: 0, millisecond: 0 }).toJSDate();
    todayMin.setHours(8, 0, 0, 0);
    const todayMax = DateTime.local().setZone('Europe/Dublin').set({ hour: 20, minute: 30, second: 0, millisecond: 0 }).toJSDate();
    todayMax.setHours(20, 30, 0, 0);
    const [bookingDateTime, setBookingDateTime] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [overlappingAvailableEvents, setOverlappingAvailableEvents] = useState([]);
    const [showDeleteAvailabilityModal, setShowDeleteAvailabilityModal] = useState(false);

    // Check admin status of user 
    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const { data: user } = await axiosReq.get("/accounts/profile/");

                // Check id user is NOT admin, if NOT redirect
                if (!user.is_staff && !user.is_superuser) {
                    navigate("/bookings");
                }
            } catch (err) {
                console.error("Error fetching user status:", err);
                // Redirect in case of error
                navigate("/login");
            }
        };

        checkAdminStatus();
    }, [navigate]);

    // Handle selection/deselection of a service and update the total work time
    const handleServiceChange = (serviceId) => {
        let updatedSelectedServices;
        if (selectedServices.includes(serviceId)) {
            // Remove the service if it is already selected
            updatedSelectedServices = selectedServices.filter((id) => id !== serviceId);
        } else {
            // Add the service if it is not already selected
            updatedSelectedServices = [...selectedServices, serviceId];
        }

        setSelectedServices(updatedSelectedServices);

        // Summarize working time for all chosen services
        const selectedServiceTimes = services
            .filter((service) => updatedSelectedServices.includes(service.id))
            .reduce((total, service) => total + parseWorktimeToMinutes(service.worktime), 0);

        setTotalWorktime(selectedServiceTimes);
    };

    // Edit a service in the list of services
    const handleEditService = async (serviceId, updatedServiceData) => {
        try {
            const response = await axiosReq.put(`/admin/services/${serviceId}/`, updatedServiceData);
            setServices((prevServices) =>
                prevServices.map((service) =>
                    service.id === serviceId ? response.data : service
                )
            );
            setShowEditModal(false); // Close the edit modal
        } catch (err) {
            console.error("Error updating service:", err);
        }
    };

    // Delete a service from the list of services
    const handleDeleteService = async (serviceId) => {
        try {
            await axiosReq.delete(`/admin/services/${serviceId}/`);
            setServices((prevServices) => prevServices.filter((service) => service.id !== serviceId));
            setShowDeleteModal(false); // Close the delete modal
        } catch (err) {
            console.error("Error deleting service:", err);
        }
    };

    const handleOpenEditModal = (service) => {
        setSelectedService(service);
        setShowEditModal(true);
    };

    const handleOpenDeleteModal = (service) => {
        setSelectedService(service);
        setShowDeleteModal(true);
    };

    // Open Booking Modal
    const openBookingModal = (booking = null) => {
        setCurrentBooking(booking);
        if (booking) {
            // When editing, initialize with services and date_time from the booking
            setModalSelectedServices(booking.services.map(service => service.id));
            const dateTime = DateTime.fromISO(booking.date_time, { zone: 'Europe/Dublin' }).toJSDate();
            setBookingDateTime(dateTime);
        } else {
            // When adding, initialize with currently selected services and time
            setModalSelectedServices(selectedServices);
            if (selectedTime) {
                const dateTime = DateTime.fromJSDate(selectedTime.start).setZone('Europe/Dublin').toJSDate();
                setBookingDateTime(dateTime);
            }
        }
        setShowBookingModal(true);
    };

    // Close Booking Modal
    const closeBookingModal = () => {
        setCurrentBooking(null);
        setShowBookingModal(false);
        setSelectedTime(null);
    };

    // Edit Booking
    const handleBookingUpdate = async (bookingId, updatedData) => {
        try {
            await axiosReq.put(`/admin/bookings/${bookingId}/`, updatedData);
            refreshEvents();
            closeBookingModal();
        } catch (err) {
            if (err.response) {
                console.error("Error updating booking:", err.response.data);
            } else {
                console.error("Error updating booking:", err);
            }
        }
    };

    // Add Booking
    const handleAddBooking = async (newBooking) => {
        try {
            await axiosReq.post(`/admin/bookings/`, newBooking);

            refreshEvents();
            setBookingSuccess(true);
            closeBookingModal();
            setSelectedTime(null);
        } catch (err) {
            // Detailed error message
            const errorMessages = err.response?.data?.non_field_errors || Object.values(err.response?.data || {}).flat().join(', ') || "Could not add booking. Please try again.";
            setBookingError(errorMessages);
        }
    };

    // Delete Booking
    const handleDeleteBooking = async (bookingId) => {
        try {
            // Confirm before deleting
            const confirmDelete = window.confirm("Are you sure you want to delete this booking?");
            if (!confirmDelete) {
                return; // Exit if the user cancels
            }

            await axiosReq.delete(`/admin/bookings/${bookingId}/`);

            // Remove the deleted booking from the calendar events
            refreshEvents();

            closeBookingModal();
        } catch (err) {
            console.error("Error deleting booking:", err);
            setBookingError("Could not delete booking. Please try again.");
        }
    };

    // Confirm availability creation
    const handleConfirmAvailability = () => {
        createAvailability(selectedTime.start, selectedTime.end);
        setShowConfirmModal(false);
    };

    // Confirm availability deletion
    const deleteAvailability = async (availabilityIds) => {
        try {
            // Remove duplicate IDs
            const uniqueIds = [...new Set(availabilityIds)];

            await Promise.all(uniqueIds.map(id =>
                axiosReq.delete(`/admin/availability/${id}/`)
            ));

            refreshEvents();
            setSelectedTime(null);
            setOverlappingAvailableEvents([]);
            setShowDeleteAvailabilityModal(false);
        } catch (err) {
            console.error("Error deleting availability:", err);
            setBookingError("Could not delete availability. Please try again.");
        }
    };

    // Cancel availability creation
    const handleCancelAvailability = () => {
        setSelectedTime(null);
        setShowConfirmModal(false);
    };

    // Create availability for a specific time slot
    const createAvailability = async (start, end) => {
        try {
            const response = await axiosReq.post(`/admin/availability/`, {
                date: start.toISOString().split('T')[0],  // Datum i YYYY-MM-DD format
                start_time: start.toTimeString().split(' ')[0],  // Tid i HH:MM:SS format
                end_time: end.toTimeString().split(' ')[0],  // Tid i HH:MM:SS format
            });

            refreshEvents();

            console.log("Availability created successfully:", response.data);
        } catch (err) {
            console.error("Error creating availability:", err);
            setBookingError("Could not create availability. Please try again.");
        }
    };


    useEffect(() => {
        const fetchTimes = async () => {
            try {
                const { data: allBookings } = await axiosReq.get("/admin/bookings/");
                const { data: servicesData } = await axiosReq.get("/admin/services/");

                console.log("Fetched Bookings:", allBookings);

                setServices(servicesData);

            } catch (err) {
                console.error("Error fetching times:", err);
            }
        };
        fetchTimes();

        const checkTimezone = () => {
            const irelandTimezone = 'Europe/Dublin';

            const irelandDate = DateTime.now().setZone(irelandTimezone);
            const currentUserDate = DateTime.local();

            // Calculate timezone difference in hours 
            const timezoneDifference = Math.round((currentUserDate.offset - irelandDate.offset) / 60);

            if (currentUserDate.zoneName !== irelandTimezone) {
                setTimezoneMessage(
                    <>
                        You are currently in timezone <strong>{currentUserDate.zoneName}</strong>, which is <strong>{timezoneDifference > 0 ? "+" : ""}{timezoneDifference} hours</strong> {timezoneDifference > 0 ? "ahead" : "behind"} Ireland time.
                    </>
                );
            } else {
                setTimezoneMessage("Please note that all bookings are made in Irish time. (GMT+1).");
            }
        };
        checkTimezone();

        const fetchUsers = async () => {
            try {
                const usersRes = await axiosReq.get("/accounts/users/");
                setUsers(usersRes.data);
            } catch (err) {
                console.error("Error fetching users:", err);
            }
        };
        fetchUsers();
    }, []);

    const [bookingError, setBookingError] = useState("");
    const [showAlert, setShowAlert] = useState(false);

    // Error Alert
    useEffect(() => {
        if (bookingError) {
            setShowAlert(true); // Show the alert

            // Automatically close the alert after 5 seconds
            const timer = setTimeout(() => {
                setShowAlert(false);
            }, 5000);

            // Cleanup the timer when the component unmounts or when bookingError changes
            return () => clearTimeout(timer);
        }
    }, [bookingError]);

    // Bookings SUccess Alert 
    useEffect(() => {
        if (bookingSuccess) {
            const timer = setTimeout(() => {
                setBookingSuccess(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [bookingSuccess]);

    useEffect(() => {
        const selectedServiceDetails = services.filter(service =>
            modalSelectedServices.includes(service.id)
        );

        // Calculate total duration of booking
        const duration = calculateBookingDuration(selectedServiceDetails);
        setTotalDuration(duration);

        // Calculate total price
        const price = calculateTotalPrice(selectedServiceDetails);
        setTotalPrice(price);

        // Update totalWorktime (in minutes)
        const totalWorkMinutes = selectedServiceDetails.reduce((total, service) => {
            return total + parseWorktimeToMinutes(service.worktime);
        }, 0);
        setTotalWorktime(totalWorkMinutes);

    }, [modalSelectedServices, services]);

    const handleBookingSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            if (!bookingDateTime) {
                console.error("No date and time selected.");
                setIsSubmitting(false);
                return;
            }

            // Convert bookingDateTime to UTC before sending to backend
            const dateTimeUTC = DateTime.fromJSDate(bookingDateTime)
                .setZone('Europe/Dublin')
                .toUTC()
                .toISO();

            const bookingData = {
                user_id: parseInt(event.target.user.value),
                service_ids: modalSelectedServices,
                date_time: dateTimeUTC,
            };

            if (currentBooking) {
                // Editing an existing booking
                await handleBookingUpdate(currentBooking.id, bookingData);
            } else {
                // Adding a new booking
                await handleAddBooking(bookingData);
            }
        } catch (err) {
            console.error("Error submitting booking:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show different colours for different events in the calendar
    const eventPropGetter = (event) => {
        let className = "";

        if (event.title === "Selected Time") {
            // Selected time slot
            className = styles["selected-time"];
            return {
                className,
                children: (
                    <div>
                        <span>Selected Time</span>
                    </div>
                ),
            };
        }
        if (event.booked) {
            className = styles["user-booking"]; // Blue
        } else if (event.available) {
            className = styles["available-event"]; // Green
        } else {
            className = styles["unavailable-event"];
        }

        return { className };
    };

    return (
        <div className={styles["page-container"]}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={12}>
                        <h2 className={`${styles["choose-services-heading"]} mt-4`}>
                            Choose Services
                        </h2>

                        <Row className="justify-content-center mb-4">
                            <Col md={8} className={`${styles["services-to-choose"]} ${styles["services-forms"]}`}>
                                <Form className="mb-2">
                                    {services.map((service) => (
                                        <div key={service.id} className="d-flex justify-content-between align-items-center">
                                            <Form.Check
                                                className={styles["service-checkbox"]}
                                                type="checkbox"
                                                label={`${service.name} (${convertWorktimeToReadableFormat(service.worktime)})`}
                                                checked={selectedServices.includes(service.id)}
                                                onChange={() => handleServiceChange(service.id)}
                                            />
                                            <div className="d-flex justify-content-start align-items-center">

                                                {/* Info-ikon med Tooltip */}
                                                <ServiceInfo service={service} renderTooltip={renderTooltip} />

                                                {/* Edit Service Button */}
                                                <Button className={`${styles["edit-service-button"]}`} onClick={() => handleOpenEditModal(service)}>
                                                    <FontAwesomeIcon icon={faPenToSquare} />
                                                </Button>

                                                {/* Delete Service Button */}
                                                <Button className={`${styles["delete-service-button"]}`} onClick={() => handleOpenDeleteModal(service)}>
                                                    <FontAwesomeIcon icon={faTrashCan} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </Form>

                                {/* Add Service Button */}
                                <div className="mt-3 text-center">
                                    {/* ServiceManagement Component */}
                                    <ServiceManagement
                                        services={services}
                                        setServices={setServices}
                                        onEditService={handleEditService}
                                        onDeleteService={handleDeleteService}
                                    />
                                </div>

                            </Col>
                        </Row>


                        <h2 className={`${styles["choose-date-time-heading"]} mt-2`}>
                            Choose Date / Time
                        </h2>

                        <Row className="justify-content-center">
                            <Col
                                xs={12}
                                md={12}
                                className="px-0 d-flex justify-content-center"
                            >
                                {timezoneMessage && (
                                    <Alert
                                        variant="warning"
                                        className={`mt-3 ${styles["alert-custom"]}`}
                                    >
                                        {timezoneMessage}
                                    </Alert>
                                )}
                            </Col>
                        </Row>

                        {/* ALERTS */}
                        {bookingSuccess && (
                            <Alert
                                variant="success"
                                onClose={() => setShowAlert(false)}
                                dismissible
                                className={`position-fixed top-0 start-50 translate-middle-x ${styles["custom-success-alert"]}`}
                            >
                                <p>Booking Successful!</p>
                            </Alert>
                        )}

                        {showAlert && (
                            <Alert
                                variant="danger"
                                onClose={() => setShowAlert(false)}
                                dismissible
                                className={`position-fixed top-0 start-50 translate-middle-x ${styles["booking-fail-alert"]}`}
                            >
                                <p>{bookingError}</p>
                            </Alert>
                        )}

                        <Row className="justify-content-center">
                            <Col xs={12} md={12} className="px-0">
                                <div className="w-100 calendar-container">
                                    <Calendar
                                        className={`${styles["custom-calendar"]}`}
                                        localizer={localizer}
                                        events={selectedTime ? events.concat([{
                                            start: selectedTime.start,
                                            end: selectedTime.end,
                                            title: "Selected Time",
                                            available: true,
                                        }]) : events}
                                        step={30}
                                        timeslots={2}
                                        defaultView="week"
                                        views={["week", "day"]}
                                        components={{
                                            allDaySlot: false,
                                            header: CustomHeader,
                                        }}
                                        min={todayMin}
                                        max={todayMax}
                                        style={{ height: "auto", width: "100%" }}
                                        selectable={true}
                                        eventPropGetter={eventPropGetter}
                                        onSelectSlot={(slotInfo) => {
                                            const selectedStartTime = slotInfo.start;
                                            const selectedEndTime = slotInfo.end;

                                            // Check if opverlapping bookings
                                            const isOverlappingBooked = events.some(event =>
                                                event.booked && (
                                                    (selectedStartTime >= event.start && selectedStartTime < event.end) ||
                                                    (selectedEndTime > event.start && selectedEndTime <= event.end) ||
                                                    (selectedStartTime <= event.start && selectedEndTime >= event.end)
                                                )
                                            );

                                            if (isOverlappingBooked) {
                                                return;  // Cancel if overlap
                                            }

                                            // Calculate overlapping available events
                                            const overlappingAvailableEvents = events.filter(event =>
                                                event.available && (
                                                    (selectedStartTime >= event.start && selectedStartTime < event.end) ||
                                                    (selectedEndTime > event.start && selectedEndTime <= event.end) ||
                                                    (selectedStartTime <= event.start && selectedEndTime >= event.end)
                                                )
                                            );

                                            if (overlappingAvailableEvents.length > 0) {
                                                if (selectedServices.length === 0) {
                                                    // Prompt for deletion
                                                    setSelectedTime({ start: selectedStartTime, end: selectedEndTime });
                                                    setOverlappingAvailableEvents(overlappingAvailableEvents);
                                                    setShowDeleteAvailabilityModal(true);
                                                    return;
                                                } else {
                                                    // Proceed to booking creation (if applicable)
                                                }
                                            } else {
                                                // Proceed to create new availability
                                                setSelectedTime({ start: selectedStartTime, end: selectedEndTime });
                                                setShowConfirmModal(true);
                                            }
                                        }}
                                        onSelectEvent={async (event) => {
                                            if (event.booked) {
                                                if (!event.id) {
                                                    console.error("No booking ID found for this event.");
                                                    return;
                                                }

                                                try {
                                                    // Get Booking Details to open Modal for Edit of Booking
                                                    const response = await axiosReq.get(`/admin/bookings/${event.id}/`);
                                                    const bookingData = response.data;

                                                    // Open Modal to Edit Booking
                                                    openBookingModal({
                                                        ...event,
                                                        date_time: bookingData.date_time,
                                                        end_time: bookingData.end_time,
                                                        services: bookingData.services,
                                                        user: bookingData.user.id,
                                                    });
                                                } catch (error) {
                                                    console.error("Error fetching booking details:", error);
                                                }
                                            } else if (event.title === "Selected Time") {
                                                // Deselect the time slot
                                                setSelectedTime(null);
                                            } else if (event.available) {
                                                if (selectedServices.length === 0) {
                                                    // Prompt for deletion
                                                    setSelectedTime({ start: event.start, end: event.end });
                                                    setOverlappingAvailableEvents([event]);
                                                    setShowDeleteAvailabilityModal(true);
                                                } else {
                                                    // Proceed to booking creation
                                                    const startTime = event.start;
                                                    const endTime = new Date(startTime.getTime() + totalWorktime * 60000);
                                                    setSelectedTime({ start: startTime, end: endTime });
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </Col>
                        </Row>
                        {/* Add/Edit Bookings Modal */}
                        <Modal className={`${modalStyles["addEditDeleteModal"]}`} show={showBookingModal} onHide={closeBookingModal}>
                            <Modal.Header className={`${modalStyles["modalHeader"]}`} closeButton>
                                <Modal.Title className={`${modalStyles["modalTitle"]}`}>
                                    {currentBooking ? "Edit Booking" : "Add Booking"}
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body className={`${modalStyles["modalBody"]}`}>
                                <Form onSubmit={handleBookingSubmit}>
                                    {/* Select User */}
                                    <Form.Group controlId="user">
                                        <Form.Label className={`${modalStyles["formLabel"]}`}>User</Form.Label>
                                        <Form.Control
                                            className={`${modalStyles["formControl"]}`}
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

                                    {/* Services */}
                                    <Form.Group controlId="services" className={`${modalStyles["servicesForUpdate"]}`}>
                                        <Form.Label className={`${modalStyles["formLabel"]}`}>Services</Form.Label>
                                        {currentBooking ? (
                                            // Editable when editing a booking
                                            <Form.Control
                                                className={`${modalStyles["formControl"]}`}
                                                as="select"
                                                name="services"
                                                multiple
                                                value={modalSelectedServices}
                                                onChange={(e) => {
                                                    const selectedOptions = Array.from(e.target.selectedOptions).map(option => parseInt(option.value));
                                                    setModalSelectedServices(selectedOptions);
                                                }}
                                                required
                                            >
                                                {services.map((service) => (
                                                    <option key={service.id} value={service.id}>
                                                        {service.name}
                                                    </option>
                                                ))}
                                            </Form.Control>
                                        ) : (
                                            // Display selected services when adding a booking
                                            <div className={`${modalStyles["fieldValueServices"]}`}>
                                                {modalSelectedServices
                                                    .map((serviceId) => services.find((s) => s.id === serviceId)?.name)
                                                    .filter(Boolean)
                                                    .join(", ")}
                                            </div>
                                        )}
                                    </Form.Group>

                                    {/* Total Duration */}
                                    <Form.Group controlId="total_duration">
                                        <Form.Label className={`${modalStyles["formLabel"]}`}>Total Duration</Form.Label>
                                        <p className={`${modalStyles["fieldValues"]}`}>{totalDuration || 'N/A'}</p>
                                    </Form.Group>

                                    {/* Date & Time */}
                                    <Form.Group controlId="date_time">
                                        <Form.Label className={`${modalStyles["formLabel"]}`}>Date & Start Time</Form.Label>
                                        {currentBooking ? (
                                            // Editable when editing a booking
                                            <DatePicker
                                                selected={bookingDateTime}
                                                onChange={(date) => setBookingDateTime(date)}
                                                showTimeSelect
                                                timeFormat="HH:mm"
                                                timeIntervals={15}
                                                dateFormat="yyyy-MM-dd HH:mm"
                                                timeCaption="Time"
                                                required
                                                className={`${modalStyles["datePicker"]} form-control`}
                                                timeZone="Europe/Dublin"
                                                placeholderText="Select date and time"
                                                minDate={new Date()}
                                                maxDate={DateTime.local().plus({ months: 6 }).toJSDate()} // Example: limit booking to 6 months ahead
                                            />
                                        ) : (
                                            // Display selected date & time when adding a booking
                                            <p className={`${modalStyles["fieldValues"]}`}>
                                                {selectedTime
                                                    ? DateTime.fromJSDate(selectedTime.start)
                                                        .setZone('Europe/Dublin', { keepLocalTime: true }) // Convert to Irish time
                                                        .toFormat('yyyy-MM-dd HH:mm')
                                                    : 'No time selected'}
                                            </p>
                                        )}
                                    </Form.Group>

                                    {/* Total Price */}
                                    <Form.Group controlId="total_price" className={`${modalStyles["lastFormGroup"]}`}>
                                        <Form.Label className={`${modalStyles["formLabel"]}`}>Total Price</Form.Label>
                                        <div className={`${modalStyles["priceContainer"]}`}>
                                            <span className={`${modalStyles["priceFrom"]}`}>from</span>
                                            <p className={`${modalStyles["fieldValues"]}`}>{totalPrice ? `${totalPrice} Euro` : 'N/A'}</p>
                                        </div>
                                    </Form.Group>

                                    {/* Modal Footer */}
                                    <Modal.Footer className={`${modalStyles["modalFooter"]}`}>
                                        <Button variant="secondary" onClick={closeBookingModal} className={`${modalStyles["modalCancelBtn"]}`}>
                                            Cancel
                                        </Button>
                                        {currentBooking && (
                                            <Button
                                                variant="danger"
                                                onClick={() => handleDeleteBooking(currentBooking.id)}
                                                className={`${modalStyles["deleteBookingBtn"]}`}
                                            >
                                                Delete Booking
                                            </Button>
                                        )}
                                        <Button type="submit" variant="primary" className={`${modalStyles["addUpdateBtn"]}`}>
                                            {currentBooking ? "Update Booking" : "Add Booking"}
                                        </Button>
                                    </Modal.Footer>
                                </Form>
                            </Modal.Body>
                        </Modal>

                        {/* Add Availabilitys Modal */}
                        <Modal className={`${modalStyles["addEditDeleteModal"]}`} show={showConfirmModal} onHide={handleCancelAvailability}>
                            <Modal.Header className={`${modalStyles["modalHeader"]}`} closeButton>
                                <Modal.Title className={`${modalStyles["modalTitle"]}`}>Add Availability</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className={`${modalStyles["modalBody"]}`}>
                                <p className={`${modalStyles["corfirmAddingAvailability"]}`}>Do you want to add this area as available?</p>
                                <Modal.Footer className={`${modalStyles["modalFooter"]}`}>
                                    <Button
                                        variant="secondary"
                                        onClick={handleCancelAvailability}
                                        className={`${modalStyles["modalCancelBtn"]}`}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleConfirmAvailability}
                                        className={`${modalStyles["addUpdateBtn"]}`}
                                    >
                                        Yes
                                    </Button>
                                </Modal.Footer>
                            </Modal.Body>
                        </Modal>

                        {/* Delete Availability Modal */}
                        <Modal className={`${modalStyles["deleteModal"]}`} show={showDeleteAvailabilityModal} onHide={() => setShowDeleteAvailabilityModal(false)}>
                            <Modal.Header className={`${modalStyles["deleteModalHeader"]}`} closeButton>
                                <Modal.Title className={`${modalStyles["deleteModalTitle"]}`}>Delete Availability</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className={`${modalStyles["corfirmDeleteModalBody"]}`}>
                                Do you want to delete the selected available times?
                            </Modal.Body>
                            <Modal.Footer className={`${modalStyles["deleteModalFooter"]}`}>
                                <Button className={`${modalStyles["modalCancelBtn"]}`} variant="secondary" onClick={() => setShowDeleteAvailabilityModal(false)}>
                                    Cancel
                                </Button>
                                <Button className={`${modalStyles["deleteBookingBtn"]}`} variant="danger" onClick={() => {
                                    const availabilityIds = overlappingAvailableEvents.map(event => event.availabilityId);
                                    deleteAvailability(availabilityIds);
                                }}>
                                    Delete
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </Col>
                </Row>
            </Container>
            <div className={styles["sticky-button"]}>
                <Button
                    onClick={() => openBookingModal()}
                    disabled={isSubmitting || !selectedServices.length || !selectedTime}
                    className={`mt-3 ${styles["book-services-btn"]}`}
                >
                    {isSubmitting ? "Booking..." : "Book Clients"}
                </Button>
            </div>
            {/* Edit Service Modal */}
            <Modal className={`${modalStyles["addEditDeleteModal"]}`} show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header className={`${modalStyles["modalHeader"]}`} closeButton>
                    <Modal.Title className={`${modalStyles["modalTitle"]}`}>Edit Service</Modal.Title>
                </Modal.Header>
                <Modal.Body className={`${modalStyles["modalBody"]}`}>
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleEditService(selectedService.id, {
                                name: e.target.name.value,
                                worktime: e.target.worktime.value,
                                price: parseFloat(e.target.price.value),
                                information: e.target.information.value || "",
                            });
                            setShowEditModal(false); // Close modal after submitting
                        }}
                    >
                        <Form.Group controlId="name">
                            <Form.Label className={`${modalStyles["formLabel"]}`}>Service Name</Form.Label>
                            <Form.Control
                                className={`${modalStyles["formControl"]}`}
                                type="text"
                                defaultValue={selectedService?.name}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="worktime">
                            <Form.Label className={`${modalStyles["formLabel"]}`}>Work Time <span className={`${modalStyles["labelSpan"]}`}>(HH:MM:SS)</span></Form.Label>
                            <Form.Control
                                className={`${modalStyles["formControl"]}`}
                                type="text"
                                defaultValue={selectedService?.worktime}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="price">
                            <Form.Label className={`${modalStyles["formLabel"]}`}>Price</Form.Label>
                            <Form.Control
                                className={`${modalStyles["formControl"]}`}
                                type="number"
                                step="0.01"
                                defaultValue={selectedService?.price}
                                required
                            />
                        </Form.Group>
                        {/* Information Field*/}
                        <Form.Group controlId="information">
                            <Form.Label className={`${modalStyles["formLabel"]}`}>Information</Form.Label>
                            <Form.Control
                                className={`${modalStyles["formControl"]}`}
                                as="textarea"
                                rows={3}
                                defaultValue={selectedService?.information || ""}
                                placeholder="Optional service information"
                            />
                        </Form.Group>
                        <div className="text-end mt-3">
                            <Button className={`${modalStyles["addUpdateBtn"]}`} type="submit">Save Changes</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Delete Service Modal */}
            <Modal className={`${modalStyles["deleteModal"]}`} show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header className={`${modalStyles["deleteModalHeader"]}`} closeButton>
                    <Modal.Title className={`${modalStyles["deleteModalTitle"]}`}>Delete Service</Modal.Title>
                </Modal.Header>
                <Modal.Body className={`${modalStyles["corfirmDeleteModalBody"]}`}>
                    Are you sure you want to delete this service?
                    <br />
                    <span className={`${modalStyles["deleteModalServiceName"]}`}>
                        {selectedService?.name}
                    </span>
                </Modal.Body>
                <Modal.Footer className={`${modalStyles["deleteModalFooter"]}`}>
                    <Button className={`${modalStyles["modalCancelBtn"]}`} variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        className={`${modalStyles["deleteBookingBtn"]}`}
                        variant="danger"
                        onClick={() => {
                            handleDeleteService(selectedService.id);
                            setShowDeleteModal(false); // Close modal after deleting
                        }}
                    >
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminBookings;
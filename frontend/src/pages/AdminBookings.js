import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Form, Modal } from "react-bootstrap";
import { Calendar, luxonLocalizer } from "react-big-calendar";
import { axiosReq } from "../api/axiosDefaults";
import { DateTime } from "luxon";
import DatePicker from "react-datepicker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
// Styles
import "react-datepicker/dist/react-datepicker.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import styles from "../styles/Bookings.module.css";
import modalStyles from "../styles/Modals.module.css";
import inputStyles from "../styles/ServiceManagement.module.css";
import BookingImage from "../assets/images/Bookings.png";
// Components
import ServiceManagement from "../components/ServiceManagement";
import ServiceInfo from "../components/ServiceInfo";
import CustomHeader from "../components/CustomHeader";
import BookingAlerts from "../components/BookingAlerts";
import TimezoneInfo from "../components/TimezoneInfo";
// Hooks
import useBookingEvents from "../hooks/useBookingEvents";
import useStickyButton from "../hooks/useStickyButton";
import useAdminCheck from "../hooks/useAdminCheck";
// Utils
import {
  parseWorktimeToMinutes,
  convertWorktimeToReadableFormat,
  calculateBookingDuration,
} from "../utils/timeUtils";
import { calculateTotalPrice } from "../utils/priceUtils";

const localizer = luxonLocalizer(DateTime);

const AdminBookings = () => {
  useAdminCheck();
  const { events, refreshEvents } = useBookingEvents(true);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [totalWorktime, setTotalWorktime] = useState(0); // Storing total worktime
  const [totalDuration, setTotalDuration] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [users, setUsers] = useState([]);
  const [modalSelectedServices, setModalSelectedServices] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const todayMin = DateTime.local()
    .setZone("Europe/Stockholm")
    .set({ hour: 8, minute: 0, second: 0, millisecond: 0 })
    .toJSDate();
  todayMin.setHours(8, 0, 0, 0);
  const todayMax = DateTime.local()
    .setZone("Europe/Stockholm")
    .set({ hour: 20, minute: 30, second: 0, millisecond: 0 })
    .toJSDate();
  todayMax.setHours(20, 30, 0, 0);
  const [bookingDateTime, setBookingDateTime] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [overlappingAvailableEvents, setOverlappingAvailableEvents] = useState(
    []
  );
  const [showDeleteAvailabilityModal, setShowDeleteAvailabilityModal] =
    useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookingIdToDelete, setBookingIdToDelete] = useState(null);
  const [categories, setCategories] = useState([]);
  const [notes, setNotes] = useState("");
  const calendarRef = useRef(null);
  const isStickyVisible = useStickyButton(calendarRef);

  // Handle selection/deselection of a service and update the total work time
  const handleServiceChange = (serviceId) => {
    let updatedSelectedServices;
    if (selectedServices.includes(serviceId)) {
      // Remove the service if it is already selected
      updatedSelectedServices = selectedServices.filter(
        (id) => id !== serviceId
      );
    } else {
      // Add the service if it is not already selected
      updatedSelectedServices = [...selectedServices, serviceId];
    }

    setSelectedServices(updatedSelectedServices);

    // Summarize working time for all chosen services
    const selectedServiceTimes = services
      .filter((service) => updatedSelectedServices.includes(service.id))
      .reduce(
        (total, service) => total + parseWorktimeToMinutes(service.worktime),
        0
      );

    setTotalWorktime(selectedServiceTimes);
  };

  // Edit a service in the list of services
  const handleEditService = async (serviceId, updatedServiceData) => {
    try {
      const finalServiceData = {
        ...updatedServiceData,
        category: selectedService?.category?.id,
      };

      const response = await axiosReq.put(
        `/admin/services/${serviceId}/`,
        finalServiceData
      );
      setServices((prevServices) =>
        prevServices.map((service) =>
          service.id === serviceId ? response.data : service
        )
      );
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating service:", err);
    }
  };

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosReq.get("/categories/");
        setCategories(response.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Close Edit Modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedService(null);
  };

  // Delete a service from the list of services
  const handleDeleteService = async (serviceId) => {
    try {
      await axiosReq.delete(`/admin/services/${serviceId}/`);
      setServices((prevServices) =>
        prevServices.filter((service) => service.id !== serviceId)
      );
      setShowDeleteModal(false); // Close the delete modal
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  };

  const handleOpenEditModal = (service) => {
    if (categories.length === 0) {
      console.error("Categories are not loaded yet.");
      return;
    }

    setSelectedService(service);
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  // Open Booking Modal
  const openBookingModal = (booking = null) => {
    if (booking) {
      setCurrentBooking({
        ...booking,
        user_name: booking.user_name,
        user_id: booking.user_id || booking.user,
        notes: booking.notes || "",
      });
      setModalSelectedServices(booking.services.map((service) => service.id));
      const dateTime = DateTime.fromISO(booking.date_time, {
        zone: "Europe/Stockholm",
      }).toJSDate();
      setBookingDateTime(dateTime);

      if (booking.notes !== undefined && booking.notes !== null) {
        setNotes(booking.notes);
      } else {
        setNotes("");
      }
    } else {
      setModalSelectedServices(selectedServices);
      if (selectedTime) {
        const dateTime = DateTime.fromJSDate(selectedTime.start)
          .setZone("Europe/Stockholm")
          .toJSDate();
        setBookingDateTime(dateTime);
      }
      setNotes("");
    }
    setShowBookingModal(true);
  };

  // Close Booking Modal
  const closeBookingModal = () => {
    setCurrentBooking(null);
    setShowBookingModal(false);
    setSelectedTime(null);
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
      const errorMessages =
        err.response?.data?.non_field_errors ||
        Object.values(err.response?.data || {})
          .flat()
          .join(", ") ||
        "Could not add booking. Please try again.";
      setBookingError(errorMessages);
    }
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

  // Delete Booking
  const handleDeleteBooking = async (bookingId) => {
    try {
      await axiosReq.delete(`/admin/bookings/${bookingId}/`);

      refreshEvents();
      setShowDeleteConfirm(false);
      setShowBookingModal(false);
      setCurrentBooking(null);
    } catch (err) {
      console.error("Error deleting booking:", err);
      setBookingError("Could not delete booking. Please try again.");
    }
  };

  // Create availability for a specific time slot
  const createAvailability = async (start, end) => {
    try {
      await axiosReq.post(`/admin/availability/`, {
        date: start.toISOString().split("T")[0], // YYYY-MM-DD
        start_time: start.toTimeString().split(" ")[0], // HH:MM:SS
        end_time: end.toTimeString().split(" ")[0], // HH:MM:SS
      });

      refreshEvents();
    } catch (err) {
      console.error("Error creating availability:", err);
      setBookingError("Could not create availability. Please try again.");
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

      await Promise.all(
        uniqueIds.map((id) => axiosReq.delete(`/admin/availability/${id}/`))
      );

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

  // Fetch Times
  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const { data: servicesData } = await axiosReq.get("/admin/services/");

        setServices(servicesData);
      } catch (err) {
        console.error("Error fetching times:", err);
      }
    };
    fetchTimes();

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

  // Update total booking duration, price, and work time based on selected services
  useEffect(() => {
    const selectedServiceDetails = services.filter((service) =>
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

  // Handle Booking Submit
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
        .setZone("Europe/Stockholm")
        .toUTC()
        .toISO();

      const bookingData = {
        service_ids: modalSelectedServices,
        date_time: dateTimeUTC,
        notes: notes || "",
      };

      if (currentBooking) {
        // Editing an existing booking
        bookingData.user_id = currentBooking.user_id;
        await handleBookingUpdate(currentBooking.id, bookingData);
      } else {
        // Adding a new booking
        bookingData.user_id = parseInt(event.target.user.value);
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
      <Container fluid>
        {/* Booking Header Image */}
        <Row className="justify-content-center mt-5">
          <Col xs="auto">
            <img
              src={BookingImage}
              alt="Bookings"
              className={styles.bookingImage}
            />
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md={12}>
            <h2 className={`${styles["choose-services-heading"]} mt-4`}>
              Manage Services
            </h2>

            {/* Booking Alerts Component */}
            <BookingAlerts
              bookingSuccess={bookingSuccess}
              setBookingSuccess={setBookingSuccess}
              bookingError={bookingError}
              setBookingError={setBookingError}
            />

            <Row className="justify-content-center mb-4">
              <Col
                md={8}
                className={`${styles["services-to-choose"]} ${styles["services-forms"]}`}
              >
                <Form className="mb-2">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <Form.Check
                        id={`main-service-${service.id}`}
                        className={styles["service-checkbox"]}
                        type="checkbox"
                        label={`${
                          service.name
                        } (${convertWorktimeToReadableFormat(
                          service.worktime
                        )})`}
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleServiceChange(service.id)}
                      />
                      <div className="d-flex justify-content-start align-items-center">
                        {/* Info-ikon med Tooltip */}
                        <ServiceInfo service={service} />

                        {/* Edit Service Button */}
                        <Button
                          className={`${styles["edit-service-button"]}`}
                          onClick={() => handleOpenEditModal(service)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </Button>

                        {/* Delete Service Button */}
                        <Button
                          className={`${styles["delete-service-button"]}`}
                          onClick={() => handleOpenDeleteModal(service)}
                        >
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

            {/* Timezone Information */}
            <Row className="justify-content-center mt-3">
              <Col xs="auto">
                <TimezoneInfo /> {/* Use the component here */}
              </Col>
            </Row>

            <Row className="justify-content-center">
              <Col xs={12} md={12} className="px-0">
                <div className="w-100 calendar-container" ref={calendarRef}>
                  <Calendar
                    className={`${styles["custom-calendar"]}`}
                    localizer={localizer}
                    events={
                      selectedTime
                        ? events.concat([
                            {
                              start: selectedTime.start,
                              end: selectedTime.end,
                              title: "Selected Time",
                              available: true,
                            },
                          ])
                        : events
                    }
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
                      const isOverlappingBooked = events.some(
                        (event) =>
                          event.booked &&
                          ((selectedStartTime >= event.start &&
                            selectedStartTime < event.end) ||
                            (selectedEndTime > event.start &&
                              selectedEndTime <= event.end) ||
                            (selectedStartTime <= event.start &&
                              selectedEndTime >= event.end))
                      );

                      if (isOverlappingBooked) {
                        return; // Cancel if overlap
                      }

                      // Calculate overlapping available events
                      const overlappingAvailableEvents = events.filter(
                        (event) =>
                          event.available &&
                          ((selectedStartTime >= event.start &&
                            selectedStartTime < event.end) ||
                            (selectedEndTime > event.start &&
                              selectedEndTime <= event.end) ||
                            (selectedStartTime <= event.start &&
                              selectedEndTime >= event.end))
                      );

                      if (overlappingAvailableEvents.length > 0) {
                        if (selectedServices.length === 0) {
                          // Prompt for deletion
                          setSelectedTime({
                            start: selectedStartTime,
                            end: selectedEndTime,
                          });
                          setOverlappingAvailableEvents(
                            overlappingAvailableEvents
                          );
                          setShowDeleteAvailabilityModal(true);
                          return;
                        } else {
                          // Proceed to booking creation (if applicable)
                        }
                      } else {
                        // Proceed to create new availability
                        setSelectedTime({
                          start: selectedStartTime,
                          end: selectedEndTime,
                        });
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
                          const response = await axiosReq.get(
                            `/admin/bookings/${event.id}/`
                          );
                          const bookingData = response.data;

                          openBookingModal({
                            ...event,
                            date_time: bookingData.date_time,
                            end_time: bookingData.end_time,
                            services: bookingData.services,
                            user_name: bookingData.user_name,
                            user_id: bookingData.user,
                            notes: bookingData.notes,
                          });
                        } catch (error) {
                          console.error(
                            "Error fetching booking details:",
                            error
                          );
                        }
                      } else if (event.title === "Selected Time") {
                        setSelectedTime(null);
                      } else if (event.available) {
                        if (selectedServices.length === 0) {
                          setSelectedTime({
                            start: event.start,
                            end: event.end,
                          });
                          setOverlappingAvailableEvents([event]);
                          setShowDeleteAvailabilityModal(true);
                        } else {
                          const startTime = event.start;
                          const endTime = new Date(
                            startTime.getTime() + totalWorktime * 60000
                          );
                          setSelectedTime({ start: startTime, end: endTime });
                        }
                      }
                    }}
                  />
                </div>
              </Col>
            </Row>

            {/* Book Client's Button */}
            {isStickyVisible && (
              <div className={styles["sticky-button"]}>
                <Button
                  onClick={() => openBookingModal()}
                  disabled={
                    isSubmitting || !selectedServices.length || !selectedTime
                  }
                  className={`mt-3 ${styles["book-services-btn"]}`}
                >
                  {isSubmitting ? "Booking..." : "Book Clients"}
                </Button>
              </div>
            )}

            {/* Edit Service Modal */}
            <Modal
              className={`${modalStyles["addEditDeleteModal"]}`}
              show={showEditModal}
              onHide={closeEditModal}
            >
              <Modal.Header
                className={`${modalStyles["modalHeader"]}`}
                closeButton
              >
                <Modal.Title className={`${modalStyles["modalTitle"]}`}>
                  Edit Service
                </Modal.Title>
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
                    setShowEditModal(false);
                  }}
                >
                  <Form.Group controlId="name">
                    <Form.Label className={`${modalStyles["formLabel"]}`}>
                      Service Name
                    </Form.Label>
                    <Form.Control
                      className={`${modalStyles["formControl"]}`}
                      type="text"
                      defaultValue={selectedService?.name}
                      required
                    />
                  </Form.Group>

                  {/* Divider Line */}
                  <div className="text-center">
                    <hr className={modalStyles["thin-line"]} />
                  </div>

                  <Form.Group controlId="worktime">
                    <Form.Label className={`${modalStyles["formLabel"]}`}>
                      Work Time{" "}
                      <span className={`${modalStyles["labelSpan"]}`}>
                        (HH:MM:SS)
                      </span>
                    </Form.Label>
                    <Form.Control
                      className={`${modalStyles["formControl"]}`}
                      type="text"
                      defaultValue={selectedService?.worktime}
                      required
                    />
                  </Form.Group>

                  {/* Divider Line */}
                  <div className="text-center">
                    <hr className={modalStyles["thin-line"]} />
                  </div>

                  <Form.Group controlId="price">
                    <Form.Label className={`${modalStyles["formLabel"]}`}>
                      Price
                    </Form.Label>
                    <Form.Control
                      className={`${modalStyles["formControl"]}`}
                      type="number"
                      step="0.01"
                      defaultValue={selectedService?.price}
                      required
                    />
                  </Form.Group>

                  {/* Divider Line */}
                  <div className="text-center">
                    <hr className={modalStyles["thin-line"]} />
                  </div>

                  {/* Information Field */}
                  <Form.Group controlId="information">
                    <Form.Label className={`${modalStyles["formLabel"]}`}>
                      Information
                    </Form.Label>
                    <Form.Control
                      className={`${modalStyles["formControl"]}`}
                      as="textarea"
                      rows={3}
                      defaultValue={selectedService?.information || ""}
                      placeholder="Optional service information"
                    />
                  </Form.Group>
                  <div className="text-end mt-3">
                    <Button
                      className={`${modalStyles["addUpdateBtn"]}`}
                      type="submit"
                    >
                      Save Changes
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal>

            {/* Delete Service Modal */}
            <Modal
              className={`${modalStyles["deleteModal"]}`}
              show={showDeleteModal}
              onHide={() => setShowDeleteModal(false)}
            >
              <Modal.Header
                className={`${modalStyles["deleteModalHeader"]}`}
                closeButton
              >
                <Modal.Title className={`${modalStyles["deleteModalTitle"]}`}>
                  Delete Service
                </Modal.Title>
              </Modal.Header>
              <Modal.Body
                className={`${modalStyles["confirmDeleteModalBody"]}`}
              >
                Are you sure you want to delete this service?
                <br />
                <span className={`${modalStyles["deleteModalServiceName"]}`}>
                  {selectedService?.name}
                </span>
              </Modal.Body>
              <Modal.Footer className={`${modalStyles["deleteModalFooter"]}`}>
                <Button
                  className={`${modalStyles["modalCancelBtn"]}`}
                  variant="secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
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

            {/* Add/Edit/Delete Bookings Modal */}
            <Modal
              className={`${modalStyles["addEditDeleteModal"]}`}
              show={showBookingModal}
              onHide={closeBookingModal}
            >
              <Modal.Header
                className={`${modalStyles["modalHeader"]}`}
                closeButton
              >
                <Modal.Title className={`${modalStyles["modalTitle"]}`}>
                  {currentBooking ? "Edit Booking" : "Add Booking"}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className={`${modalStyles["modalBody"]}`}>
                <Form onSubmit={handleBookingSubmit}>
                  {/* User Information */}
                  {currentBooking ? (
                    <Form.Group controlId="user">
                      <Form.Label className={`${modalStyles["formLabel"]}`}>
                        User
                      </Form.Label>
                      <p className={`${modalStyles["fieldValues"]}`}>
                        {currentBooking.user_name || "Loading..."}
                      </p>
                    </Form.Group>
                  ) : (
                    <Form.Group controlId="user">
                      <Form.Label className={`${modalStyles["formLabel"]}`}>
                        User
                      </Form.Label>
                      <Form.Control
                        className={`${inputStyles["form-input"]} ${modalStyles["formControl"]}`}
                        as="select"
                        name="user"
                        defaultValue=""
                        required
                      >
                        <option value="">Select User</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} {user.surname}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  )}

                  {/* Divider Line */}
                  <div className="text-center">
                    <hr className={modalStyles["thin-line"]} />
                  </div>

                  {/* Date & Time */}
                  <Form.Group controlId="date_time">
                    <Form.Label className={`${modalStyles["formLabel"]}`}>
                      Date & Start Time
                    </Form.Label>
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
                        className={`${inputStyles["form-input"]} ${modalStyles["datePicker"]} form-control`}
                        timeZone="Europe/Stockholm"
                        placeholderText="Select date and time"
                        minDate={new Date()}
                        maxDate={DateTime.local()
                          .plus({ months: 6 })
                          .toJSDate()} // Example: limit booking to 6 months ahead
                      />
                    ) : (
                      // Display selected date & time when adding a booking
                      <p className={`${modalStyles["fieldValues"]}`}>
                        {selectedTime
                          ? DateTime.fromJSDate(selectedTime.start)
                              .setZone("Europe/Stockholm", {
                                keepLocalTime: true,
                              }) // Convert to Swedish time
                              .toFormat("yyyy-MM-dd HH:mm")
                          : "No time selected"}
                      </p>
                    )}
                  </Form.Group>

                  {/* Divider Line */}
                  <div className="text-center">
                    <hr className={modalStyles["thin-line"]} />
                  </div>

                  {/* Services */}
                  <Form.Label className={`${modalStyles["formLabel"]}`}>
                    Services
                  </Form.Label>
                  <div className={`${modalStyles["formControl"]}`}>
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className={styles["service-checkbox"]}
                      >
                        <Form.Check
                          id={`modal-service-${service.id}`}
                          type="checkbox"
                          label={service.name}
                          value={service.id}
                          checked={modalSelectedServices.includes(service.id)}
                          onChange={(e) => {
                            const selectedServiceId = parseInt(e.target.value);
                            let updatedSelectedServices;

                            if (e.target.checked) {
                              // Add service to list
                              updatedSelectedServices = [
                                ...modalSelectedServices,
                                selectedServiceId,
                              ];
                            } else {
                              // Remove service from list
                              updatedSelectedServices =
                                modalSelectedServices.filter(
                                  (id) => id !== selectedServiceId
                                );
                            }

                            setModalSelectedServices(updatedSelectedServices);
                          }}
                          className={styles["service-checkbox"]}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Divider Line */}
                  <div className="text-center">
                    <hr className={modalStyles["thin-line"]} />
                  </div>

                  {/* Total Duration */}
                  <Form.Group controlId="total_duration">
                    <Form.Label className={`${modalStyles["formLabel"]}`}>
                      Total Duration
                    </Form.Label>
                    <p className={`${modalStyles["fieldValues"]}`}>
                      {totalDuration || "N/A"}
                    </p>
                  </Form.Group>

                  {/* Divider Line */}
                  <div className="text-center">
                    <hr className={modalStyles["thin-line"]} />
                  </div>

                  {/* Notes */}
                  <Form.Group controlId="notes">
                    <Form.Label className={`${modalStyles["formLabel"]}`}>
                      Notes
                    </Form.Label>
                    <Form.Control
                      className={`${inputStyles["form-input"]} ${modalStyles["formControl"]}`}
                      as="textarea"
                      rows={1}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional"
                    />
                  </Form.Group>

                  {/* Divider Line */}
                  <div className="text-center">
                    <hr className={modalStyles["thin-line"]} />
                  </div>

                  {/* Total Price */}
                  <Form.Group
                    controlId="total_price"
                    className={`${modalStyles["lastFormGroup"]}`}
                  >
                    <Form.Label className={`${modalStyles["formLabel"]}`}>
                      Total Price
                    </Form.Label>
                    <div className={`${modalStyles["priceContainer"]}`}>
                      <span className={`${modalStyles["priceFrom"]}`}>
                        from
                      </span>
                      <p className={`${modalStyles["fieldValues"]}`}>
                        {totalPrice ? `${totalPrice} Euro` : "N/A"}
                      </p>
                    </div>
                  </Form.Group>

                  {/* Modal Footer */}
                  <Modal.Footer className={`${modalStyles["modalFooter"]}`}>
                    <Button
                      variant="secondary"
                      onClick={closeBookingModal}
                      className={`${modalStyles["modalCancelBtn"]}`}
                    >
                      Cancel
                    </Button>
                    {currentBooking && (
                      <Button
                        variant="danger"
                        onClick={() => {
                          setBookingIdToDelete(currentBooking.id);
                          setShowDeleteConfirm(true);
                        }}
                        className={`${modalStyles["deleteBookingBtn"]}`}
                      >
                        Delete Booking
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="primary"
                      className={`${modalStyles["addUpdateBtn"]}`}
                    >
                      {currentBooking ? "Update Booking" : "Add Booking"}
                    </Button>
                  </Modal.Footer>
                </Form>
              </Modal.Body>
            </Modal>

            {/* Confirm Delete Bookings Modal */}
            <Modal
              className={`${modalStyles["deleteModal"]}`}
              show={showDeleteConfirm}
              onHide={() => setShowDeleteConfirm(false)}
              centered
            >
              <Modal.Header
                className={`${modalStyles["deleteModalHeader"]}`}
                closeButton
              >
                <Modal.Title className={`${modalStyles["deleteModalTitle"]}`}>
                  Confirm Deletion
                </Modal.Title>
              </Modal.Header>
              <Modal.Body
                className={`${modalStyles["confirmDeleteModalBody"]}`}
              >
                Are you sure you want to delete this booking?
              </Modal.Body>
              <Modal.Footer className={`${modalStyles["deleteModalFooter"]}`}>
                <Button
                  className={`${modalStyles["modalCancelBtn"]}`}
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className={`${modalStyles["deleteBookingBtn"]}`}
                  variant="danger"
                  onClick={async () => {
                    await handleDeleteBooking(bookingIdToDelete); // Call delete booking
                    setShowDeleteConfirm(false); // Close the confirmation modal
                  }}
                >
                  Delete
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Add Availabilitys Modal */}
            <Modal
              className={`${modalStyles["addEditDeleteModal"]}`}
              show={showConfirmModal}
              onHide={handleCancelAvailability}
            >
              <Modal.Header
                className={`${modalStyles["modalHeader"]}`}
                closeButton
              >
                <Modal.Title className={`${modalStyles["modalTitle"]}`}>
                  Add Availability
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className={`${modalStyles["modalBody"]}`}>
                <p className={`${modalStyles["confirmAddingAvailability"]}`}>
                  Do you want to add this area as available?
                </p>
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
            <Modal
              className={`${modalStyles["deleteModal"]}`}
              show={showDeleteAvailabilityModal}
              onHide={() => setShowDeleteAvailabilityModal(false)}
            >
              <Modal.Header
                className={`${modalStyles["deleteModalHeader"]}`}
                closeButton
              >
                <Modal.Title className={`${modalStyles["deleteModalTitle"]}`}>
                  Delete Availability
                </Modal.Title>
              </Modal.Header>
              <Modal.Body
                className={`${modalStyles["confirmDeleteModalBody"]}`}
              >
                Do you want to delete the selected available times?
              </Modal.Body>
              <Modal.Footer className={`${modalStyles["deleteModalFooter"]}`}>
                <Button
                  className={`${modalStyles["modalCancelBtn"]}`}
                  variant="secondary"
                  onClick={() => setShowDeleteAvailabilityModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className={`${modalStyles["deleteBookingBtn"]}`}
                  variant="danger"
                  onClick={() => {
                    const availabilityIds = overlappingAvailableEvents.map(
                      (event) => event.availabilityId
                    );
                    deleteAvailability(availabilityIds);
                  }}
                >
                  Delete
                </Button>
              </Modal.Footer>
            </Modal>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminBookings;

import React, { useState, useEffect, useRef } from "react";
import { axiosReq } from "../api/axiosDefaults";
import { DateTime } from "luxon";
import { Calendar, luxonLocalizer } from "react-big-calendar";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Modal,
  Alert,
  Collapse,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
// Styles
import "react-big-calendar/lib/css/react-big-calendar.css";
import styles from "../styles/Bookings.module.css";
import modalStyles from "../styles/Modals.module.css";
import inputStyles from "../styles/ServiceManagement.module.css";
import "react-datepicker/dist/react-datepicker.css";
import BookingImage from "../assets/images/Bookings.png";
// Components
import ServiceInfo from "../components/ServiceInfo";
import CustomHeader from "../components/CustomHeader";
import BookingAlerts from "../components/BookingAlerts";
import TimezoneInfo from "../components/TimezoneInfo";
// Hooks
import useBookingEvents from "../hooks/useBookingEvents";
import useAdminCheck from "../hooks/useAdminCheck";
import useStickyButton from "../hooks/useStickyButton";
// Utils
import {
  parseWorktimeToMinutes,
  convertWorktimeToReadableFormat,
  calculateBookingDuration,
} from "../utils/timeUtils";
import { calculateTotalPrice } from "../utils/priceUtils";

const localizer = luxonLocalizer(DateTime);

// Booking Instructions
function BookingInfoDropdown() {
  const [open, setOpen] = useState(false);
  const infoRef = useRef(null);

  // Detect click outside of dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (infoRef.current && !infoRef.current.contains(event.target)) {
        setOpen(false); // Close dropdown
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      {!open && (
        <Button
          onClick={() => setOpen(!open)}
          aria-controls="booking-info"
          aria-expanded={open}
          variant="info"
          className={`mt-2 ${styles["booking-info-button"]}`}
        >
          Show booking instructions
        </Button>
      )}

      <Collapse in={open}>
        <div id="booking-info" className="mt-3" ref={infoRef}>
          <Alert variant="info" className={styles["booking-info-alert"]}>
            <strong>How to book:</strong>
            <ul className={styles["booking-info-list"]}>
              <li>1. Select one or more services by checking the boxes.</li>
              <li>
                2. Scroll down to the calendar and choose an available time
                slot.
              </li>
              <li>
                3. Once both steps are completed, click "Book Services" to
                finalize your booking.
              </li>
            </ul>
          </Alert>
        </div>
      </Collapse>
    </>
  );
}

const Bookings = () => {
  useAdminCheck();
  const { events, services, refreshEvents, updateBooking, deleteBooking } =
    useBookingEvents(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [selectedTime, setSelectedTime] = useState(null);
  const [totalDuration, setTotalDuration] = useState("");
  const [totalWorktime, setTotalWorktime] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalSelectedServices, setModalSelectedServices] = useState([]);
  const [bookingDateTime, setBookingDateTime] = useState(new Date());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookingIdToDelete, setBookingIdToDelete] = useState(null);
  const calendarRef = useRef(null);
  const isStickyVisible = useStickyButton(calendarRef);

  const todayMin = new Date();
  todayMin.setHours(8, 0, 0, 0);
  const todayMax = new Date();
  todayMax.setHours(20, 30, 0, 0);

  const handleServiceChange = (serviceId) => {
    let updatedSelectedServices;
    if (selectedServices.includes(serviceId)) {
      updatedSelectedServices = selectedServices.filter(
        (id) => id !== serviceId
      );
    } else {
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

  const [isSubmitting] = useState(false);

  // Update total booking duration, price, and work time based on selected services
  // Update total booking duration, price, and work time based on selected services
  useEffect(() => {
    const selectedServiceDetails = services.filter((service) =>
      selectedServices.includes(service.id)
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
  }, [selectedServices, services]);

  const handleBookingSubmit = async () => {
    if (!selectedTime || selectedServices.length === 0) {
      alert("Please select a time and at least one service.");
      return;
    }
    // Chech that worktime is bigger than 0
    if (totalWorktime === 0) {
      alert("Total worktime is 0. Please select services correctly.");
      return;
    }
    try {
      const dateTimeString = DateTime.fromJSDate(selectedTime.start)
        .setZone("Europe/Stockholm")
        .toISO();
      const bookingData = {
        service_ids: selectedServices,
        date_time: dateTimeString,
      };
      await axiosReq.post("/bookings/", bookingData);
      refreshEvents();
      setBookingSuccess(true);
    } catch (err) {
      console.error(
        "Error creating booking:",
        err.response ? err.response.data : err.message
      );
      setBookingError("Could not create booking. Please try again.");
    }
  };

  // Show different colours for different events in the calendar
  const eventPropGetter = (event) => {
    let className = "";

    if (event.title === "Selected Time") {
      className = styles["selected-time"];
    } else if (event.booked && event.mine) {
      className = styles["user-booking"];
    } else if (event.booked) {
      className = styles["booked-event"];
    } else if (event.available) {
      className = styles["available-event"];
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
          <Col className="d-flex justify-content-center">
            <BookingInfoDropdown />
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col xs={12} md={12}>
            <h2 className={`${styles["choose-services-heading"]}`}>
              Choose Services
            </h2>

            {/* Booking Alerts Component */}
            <BookingAlerts
              bookingSuccess={bookingSuccess}
              setBookingSuccess={setBookingSuccess}
              bookingError={bookingError}
              setBookingError={setBookingError}
            />

            <Form
              className={`${styles["services-to-choose"]} ${styles["services-forms"]}`}
            >
              {services.map((service) => (
                <div
                  key={service.id}
                  className="d-flex justify-content-between align-items-center mb-2"
                >
                  <div className="d-flex align-items-center">
                    <label
                      htmlFor={`service-${service.id}`}
                      className="d-flex align-items-center me-2"
                      style={{ cursor: "pointer" }}
                    >
                      <Form.Check
                        id={`service-${service.id}`}
                        type="checkbox"
                        label={`${
                          service.name
                        } (${convertWorktimeToReadableFormat(
                          service.worktime
                        )})`}
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleServiceChange(service.id)}
                        className={styles["service-checkbox"]}
                      />
                    </label>
                  </div>
                  {/* Info-ikon med Tooltip */}
                  <ServiceInfo service={service} />
                </div>
              ))}

              {/* Total Price For Selected Services */}
              <h3
                className={`${styles["totalPriceInServiceForm"]} text-center mt-3`}
              >
                Total Price: € {totalPrice}
              </h3>
            </Form>

            <h2 className={`${styles["choose-date-time-heading"]}`}>
              Choose Date / Time
            </h2>

            {/* Timezone Information */}
            <Row className="justify-content-center mt-3">
              <Col xs="auto">
                <TimezoneInfo /> {/* Use the component here */}
              </Col>
            </Row>

            {/* Booking Cancelation Warning */}
            <Row className="justify-content-center">
              <Col
                xs={12}
                md={12}
                className="px-0 d-flex justify-content-center"
              >
                <Alert
                  variant="warning"
                  className={`mt-3 ${styles["alert-custom"]}`}
                >
                  Changes or cancellations aren't allowed within 8 hours of the
                  treatment.
                </Alert>
              </Col>
            </Row>

            <Row className="justify-content-center">
              <Col xs={12} md={12} className="px-0">
                <div className="w-100 calendar-container" ref={calendarRef}>
                  <Calendar
                    className={`${styles["custom-calendar"]}`}
                    localizer={localizer}
                    events={
                      selectedTime ? events.concat([selectedTime]) : events
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

                      // Calculate the selected end time based on total worktime
                      const selectedEndTime = DateTime.fromJSDate(
                        selectedStartTime
                      )
                        .plus({ minutes: totalWorktime })
                        .toJSDate();

                      // Find the latest available time (end time) from the available events
                      const availableEndTimes = events
                        .filter((event) => event.available)
                        .map((event) => event.end);

                      // Get the latest available time
                      const latestAvailableTime = availableEndTimes.length
                        ? new Date(
                            Math.max(
                              ...availableEndTimes.map((time) => new Date(time))
                            )
                          )
                        : null;

                      // Check if the selected end time exceeds the latest available time
                      if (
                        latestAvailableTime &&
                        selectedEndTime > latestAvailableTime
                      ) {
                        alert(
                          "The selected time exceeds the available time slots. Please choose an earlier time."
                        );
                        return; // Stop further actions if end time is not within available slots
                      }

                      // Prevent selecting any slot that overlaps with booked time slots
                      const isOverlappingBooked = events.some(
                        (event) =>
                          event.booked &&
                          ((DateTime.fromJSDate(selectedStartTime) >=
                            DateTime.fromJSDate(event.start) &&
                            DateTime.fromJSDate(selectedStartTime) <
                              DateTime.fromJSDate(event.end)) ||
                            (DateTime.fromJSDate(selectedEndTime) >
                              DateTime.fromJSDate(event.start) &&
                              DateTime.fromJSDate(selectedEndTime) <=
                                DateTime.fromJSDate(event.end)) ||
                            (DateTime.fromJSDate(selectedStartTime) <=
                              DateTime.fromJSDate(event.start) &&
                              DateTime.fromJSDate(selectedEndTime) >=
                                DateTime.fromJSDate(event.end)))
                      );

                      // If there is an overlap with booked time slots, do not proceed
                      if (isOverlappingBooked) {
                        return;
                      }

                      // Update the state with the selected time and refresh events
                      refreshEvents();
                      setSelectedTime({
                        start: selectedStartTime,
                        end: selectedEndTime,
                        title: "Selected Time",
                        available: true,
                      });
                    }}
                    onSelectEvent={async (event) => {
                      if (event.booked && !event.mine) {
                        // If the event is booked but not owned by the user
                        alert("This time is already booked!");
                        return;
                      } else if (event.mine) {
                        // If the event is a user's own booking
                        if (!event.id) {
                          console.error("No booking ID found for this event.");
                          return; // Abort if missing ID
                        }

                        try {
                          // Get full booking details for editing
                          const response = await axiosReq.get(
                            `/bookings/${event.id}/edit/`
                          );
                          const bookingData = response.data;

                          // Set modal states for editing
                          setSelectedBooking({
                            ...event,
                            date_time: DateTime.fromISO(
                              bookingData.date_time
                            ).toJSDate(),
                            services: bookingData.services.map(
                              (service) => service.id
                            ),
                          });
                          setBookingDateTime(
                            DateTime.fromISO(bookingData.date_time).toJSDate()
                          );
                          setModalSelectedServices(
                            bookingData.services.map((service) => service.id)
                          );
                        } catch (error) {
                          console.error(
                            "Error fetching booking details:",
                            error
                          );
                          return;
                        }
                      } else if (
                        event.available &&
                        event.title === "Selected Time"
                      ) {
                        // If the event is an available time slot that is currently selected
                        setSelectedTime(null); // Deselect the time slot
                        refreshEvents();
                      } else if (event.available && totalWorktime > 0) {
                        // If the event is an available time slot and a valid total worktime is set
                        const startTime = event.start;
                        const endTime = new Date(
                          startTime.getTime() + totalWorktime * 60000
                        );

                        // Create the selected time range event
                        const selectedRange = {
                          start: startTime,
                          end: endTime,
                          title: "Selected Time",
                          available: true,
                        };

                        setSelectedTime(selectedRange); // Set the selected time
                        refreshEvents();
                      }
                    }}
                  />
                </div>
              </Col>
            </Row>
            {selectedBooking && (
              <Modal
                className={`${modalStyles["addEditDeleteModal"]}`}
                show={true}
                onHide={() => setSelectedBooking(null)}
              >
                <Modal.Header
                  className={`${modalStyles["modalHeader"]}`}
                  closeButton
                >
                  <Modal.Title className={`${modalStyles["modalTitle"]}`}>
                    Edit Booking
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body className={`${modalStyles["modalBody"]}`}>
                  {/* Edit Booking Form */}
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const updatedData = {
                        service_ids: modalSelectedServices,
                        date_time: bookingDateTime.toISOString(),
                      };
                      updateBooking(selectedBooking.id, updatedData);
                    }}
                  >
                    {/* Date & Time */}
                    <Form.Group controlId="date_time">
                      <Form.Label className={`${modalStyles["formLabel"]}`}>
                        Date & Start Time
                      </Form.Label>
                      {selectedBooking ? (
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
                            .toJSDate()} // Limit booking to 6 months ahead
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

                    {/* Services Selection */}
                    <Form.Group controlId="services">
                      <Form.Label className={`${modalStyles["formLabel"]}`}>
                        Services
                      </Form.Label>
                      <div className={`${modalStyles["formControl"]}`}>
                        {services.map((service) => (
                          <div
                            key={service.id}
                            className={`${styles["service-checkbox"]} d-flex align-items-center`}
                            style={{ marginBottom: "8px" }}
                          >
                            <Form.Check
                              id={`modal-service-${service.id}`}
                              type="checkbox"
                              label=""
                              value={service.id}
                              checked={modalSelectedServices.includes(
                                service.id
                              )}
                              onChange={(e) => {
                                const selectedServiceId = parseInt(e.target.value);
                                let updatedSelectedServices;
                              
                                if (e.target.checked) {
                                  // Add selected service to list
                                  updatedSelectedServices = [
                                    ...modalSelectedServices,
                                    selectedServiceId,
                                  ];
                                } else {
                                  // Remove unselected service from list
                                  updatedSelectedServices = modalSelectedServices.filter(
                                    (id) => id !== selectedServiceId
                                  );
                                }
                              
                                setModalSelectedServices(updatedSelectedServices);
                              
                                // Calculate total worktime for selected services
                                const selectedServiceTimes = services
                                  .filter((service) =>
                                    updatedSelectedServices.includes(service.id)
                                  )
                                  .reduce(
                                    (total, service) =>
                                      total + parseWorktimeToMinutes(service.worktime),
                                    0
                                  );
                              
                                setTotalWorktime(selectedServiceTimes);
                              
                                // Calculate new end time based on updated total worktime
                                const newEndTime = DateTime.fromJSDate(
                                  selectedBooking.start
                                )
                                  .plus({ minutes: selectedServiceTimes })
                                  .toJSDate();
                              
                                // Update the selectedBooking state with new end time for duration calculation
                                setSelectedBooking((prev) => ({
                                  ...prev,
                                  end: newEndTime,
                                }));
                              
                                // Calculate total duration of booking
                                const duration = calculateBookingDuration(
                                  services.filter((service) =>
                                    updatedSelectedServices.includes(service.id)
                                  )
                                );
                                setTotalDuration(duration);
                              }}
                              className={styles["service-checkbox"]}
                            />
                            <label
                              htmlFor={`modal-service-${service.id}`}
                              className={`${styles["checkbox-label"]} ms-2`}
                              style={{ cursor: "pointer" }}
                            >
                              {service.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </Form.Group>

                    {/* Divider Line */}
                    <div className="text-center">
                      <hr className={modalStyles["thin-line"]} />
                    </div>

                    {/* Booking Duration */}
                    <p className={`${modalStyles["durationValue"]}`}>
                      <strong className={`${modalStyles["formLabel"]}`}>
                        Duration:
                      </strong>
                      <br />
                      <span className={`${modalStyles["fieldValues"]}`}>
                        {totalDuration || "N/A"}
                      </span>
                    </p>

                    {/* Divider Line */}
                    <div className="text-center">
                      <hr className={modalStyles["thin-line"]} />
                    </div>

                    {/* Display total price for selected services */}
                    <p className={`${modalStyles["totalPriceDisplay"]} mt-3`}>
                      <strong className={`${modalStyles["formLabel"]}`}>
                        Total Price:
                      </strong>
                      <br />
                      <span className={`${styles["priceSpan"]}`}>from </span>
                      <span className={`${modalStyles["fieldValues"]}`}>
                        {calculateTotalPrice(
                          modalSelectedServices.map((serviceId) =>
                            services.find((service) => service.id === serviceId)
                          )
                        )}{" "}
                        EUR
                      </span>
                    </p>
                  </Form>

                  <Modal.Footer className={`${modalStyles["modalFooter"]}`}>
                    <Button
                      className={`${modalStyles["modalCancelBtn"]}`}
                      variant="secondary"
                      onClick={() => setSelectedBooking(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className={`${modalStyles["deleteBookingBtn"]}`}
                      variant="danger"
                      onClick={() => {
                        setBookingIdToDelete(selectedBooking.id);
                        setShowDeleteConfirm(true);
                      }}
                    >
                      Delete
                    </Button>

                    <Button
                      className={`${modalStyles["addUpdateBtn"]}`}
                      type="submit"
                      variant="primary"
                      onClick={async (e) => {
                        e.preventDefault();
                        const updatedData = {
                          service_ids: modalSelectedServices,
                          date_time: bookingDateTime.toISOString(),
                        };
                        const success = await updateBooking(
                          selectedBooking.id,
                          updatedData
                        );
                        if (success) {
                          setSelectedBooking(null); // Close the modal if update was successful
                        }
                      }}
                    >
                      Update Booking
                    </Button>
                  </Modal.Footer>
                </Modal.Body>
              </Modal>
            )}
          </Col>
        </Row>
      </Container>

      {/* Book Services Button */}
      {isStickyVisible && (
        <div className={styles["sticky-button"]}>
          <Button
            onClick={handleBookingSubmit}
            disabled={isSubmitting || !selectedServices.length || !selectedTime}
            className={`mt-3 ${styles["book-services-btn"]}`}
          >
            {isSubmitting ? "Booking..." : "Book Services"}
          </Button>
        </div>
      )}

      {/* Delete Booking  */}
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
        <Modal.Body className={`${modalStyles["confirmDeleteModalBody"]}`}>
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
              const success = await deleteBooking(bookingIdToDelete);
              if (success) {
                setShowDeleteConfirm(false);
                setSelectedBooking(null);
              }
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Bookings;

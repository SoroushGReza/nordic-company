import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Alert, Modal } from "react-bootstrap";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format } from "date-fns-tz";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { axiosReq } from "../api/axiosDefaults";
import styles from "../styles/Bookings.module.css";
import { parseISO } from "date-fns";
import { useMediaQuery } from 'react-responsive';


const locales = {
    "en-IE": require("date-fns/locale/en-IE"),
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const CustomHeader = ({ date }) => {
    const isMobile = useMediaQuery({ query: '(max-width: 992px)' });
    const day = getDay(date);

    // Determine the class based on the day
    const headerClass =
        day === 0 || day === 6 // Sunday or Saturday
            ? styles['weekend-header']
            : styles['weekday-header'];

    // Format date based on screen size
    const formattedDate = isMobile ? format(date, 'dd') : format(date, 'dd EEE'); // Show only day for mobile

    return (
        <div className={headerClass}>
            <button type="button" className="rbc-button-link">
                <span role="columnheader" aria-sort="none">{formattedDate}</span>
            </button>
        </div>
    );
};


const calculateBookingDuration = (start, end) => {
    const diffInMs = new Date(end) - new Date(start);  // Calculate difference in mili-seconds
    const totalMinutes = Math.floor(diffInMs / (1000 * 60));  // Convert to minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes > 0 ? `${minutes}min` : ''}`;  // Return "5h 30min" etc.
};

const convertWorktimeToReadableFormat = (worktime) => {
    const [hours, minutes] = worktime.split(':').map(Number);
    return `${hours > 0 ? `${hours}h` : ''} ${minutes > 0 ? `${minutes} minutes` : ''}`.trim();
}

const calculateTotalPrice = (services) => {
    return services.reduce((total, service) => total + parseFloat(service.price), 0);
};

const Bookings = () => {
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [selectedTime, setSelectedTime] = useState(null);
    const [totalWorktime, setTotalWorktime] = useState(0); // Storing total worktime
    const [allEvents, setAllEvents] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [userTimezoneOffset, setUserTimezoneOffset] = useState(0);
    const [timezoneMessage, setTimezoneMessage] = useState("");


    useEffect(() => {
        const fetchTimes = async () => {
            try {
                // Get availability, all bookings, user's own bookings, services
                const { data: availability } = await axiosReq.get("/availability/");
                const { data: allBookings } = await axiosReq.get("/bookings/all/");
                const { data: myBookings } = await axiosReq.get("/bookings/mine/");
                const { data: servicesData } = await axiosReq.get("/services/");

                setServices(servicesData);

                // create events for ALL booked times
                const bookedEvents = allBookings.map((booking) => {
                    if (!booking.date_time || !booking.end_time) {
                        console.warn("Skipping invalid booking entry (all bookings):", booking);
                        return null;
                    }

                    return {
                        start: parseISO(booking.date_time),
                        end: parseISO(booking.end_time),
                        title: "Booked (Unavailable)",
                        available: false,
                        booked: true,
                        mine: false // NOT user's own booking
                    };
                }).filter(event => event !== null);

                // User's own bookings (interactive)
                const myBookedEvents = myBookings.map((booking) => {
                    if (!booking.date_time || !booking.end_time) {
                        console.warn("Skipping invalid user booking entry (missing date_time or end_time):", booking);
                        return null;
                    }

                    return {
                        start: parseISO(booking.date_time),
                        end: parseISO(booking.end_time),
                        title: "My Booking",
                        available: true,
                        booked: true,
                        id: booking.id,
                        mine: true, // User's own booking
                        className: "user-booking"
                    };
                }).filter(event => event !== null);

                // Filter available times and remove those that overlap bookings
                const availableEvents = availability.flatMap((availability) => {
                    const [year, month, day] = availability.date.split('-').map(Number);
                    const [startHour, startMinute, startSecond] = availability.start_time.split(':').map(Number);
                    const [endHour, endMinute, endSecond] = availability.end_time.split(':').map(Number);

                    const start = new Date(year, month - 1, day, startHour, startMinute, startSecond);
                    const end = new Date(year, month - 1, day, endHour, endMinute, endSecond);


                    const events = [];
                    let current = start;

                    while (current < end) {
                        const next = new Date(current.getTime() + 30 * 60 * 1000); // 30 minutes forward

                        // Create a copy of current and next to avoid ESLint-warning
                        const eventStart = new Date(current);
                        const eventEnd = new Date(next);

                        // Check if there is overlaping booked times
                        const isOverlapping = [...bookedEvents, ...myBookedEvents].some(booked => {
                            return (
                                (booked.start <= eventStart && eventStart < booked.end) ||
                                (booked.start < eventEnd && eventEnd <= booked.end) ||
                                (eventStart <= booked.start && eventEnd >= booked.end)
                            );
                        });

                        // Only add available times that does not overlap with bookings
                        if (!isOverlapping) {
                            events.push({
                                start: eventStart,
                                end: eventEnd,
                                available: true,
                                booked: false,
                                mine: false // NOT User's own booking
                            });
                        }

                        current = next;
                    }

                    return events;
                });

                setAllEvents([...availableEvents, ...bookedEvents, ...myBookedEvents]);

            } catch (err) {
                console.error("Error fetching times:", err);
            }
        };
        fetchTimes();

        const checkTimezone = () => {
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const irelandTimezone = 'Europe/Dublin';
            const currentIrelandTime = new Date().toLocaleString("en-US", { timeZone: irelandTimezone });
            const irelandDate = new Date(currentIrelandTime);
            const currentUserDate = new Date();

            // Calculate the timezone difference and round it to the nearest whole number
            const timezoneDifference = Math.round((currentUserDate - irelandDate) / (1000 * 60 * 60));

            if (userTimezone !== irelandTimezone) {
                setTimezoneMessage(<>You are currently in the <strong>{userTimezone}</strong> timezone, which is <strong>{timezoneDifference > 0 ? "+" : ""}{timezoneDifference} hours </strong>{timezoneDifference > 0 ? "ahead" : "behind"} of Ireland's time.</>);
            } else {
                setTimezoneMessage("Please note that all bookings are made in Irish time (GMT+1).");
            }
        };


        checkTimezone();
    }, []);

    // Function to convert "HH:MM:SS" to minutes
    const parseWorktimeToMinutes = (worktime) => {
        const [hours, minutes, seconds] = worktime.split(':').map(Number); // Convert HH:MM:SS till numbers
        const totalMinutes = (hours * 60) + minutes + (seconds / 60);  // Convert to minutes
        return totalMinutes;
    };


    const handleServiceChange = (serviceId) => {
        let updatedSelectedServices;
        if (selectedServices.includes(serviceId)) {
            updatedSelectedServices = selectedServices.filter((id) => id !== serviceId);
        } else {
            updatedSelectedServices = [...selectedServices, serviceId];
        }

        setSelectedServices(updatedSelectedServices);

        // Summarize working time for all chosen services
        const selectedServiceTimes = services
            .filter((service) => updatedSelectedServices.includes(service.id))
            .reduce((total, service) => total + parseWorktimeToMinutes(service.worktime), 0);

        setTotalWorktime(selectedServiceTimes);
    };

    const [isSubmitting] = useState(false);

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
            const dateTimeString = format(
                selectedTime.start,
                "yyyy-MM-dd'T'HH:mm:ssXXX"
            );
            const bookingData = {
                service_ids: selectedServices,
                date_time: dateTimeString,
            };
            await axiosReq.post("/bookings/", bookingData);
            setBookingSuccess(true);
        } catch (err) {
            console.error("Error creating booking:", err.response ? err.response.data : err.message);
        }
    };

    // Show different colours for different events in the calendar
    const eventPropGetter = (event) => {
        let className = '';

        if (event.booked && event.mine) {
            className = styles['user-booking'];
        } else if (event.booked) {
            className = styles['booked-event'];
        } else if (event.available) {
            className = styles['available-event'];
        } else {
            className = styles['unavailable-event'];
        }

        return { className };
    };

    return (
        <div className={styles["page-container"]}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={12}>
                        <h2 className={`${styles["choose-services-heading"]}`}>Choose Services</h2>
                        {bookingSuccess && <Alert variant="success">Booking Successful!</Alert>}

                        <Form className={`${styles["services-to-choose"]} ${styles["booking-form"]}`}>
                            {services.map((service) => {
                                return (
                                    <div key={service.id} className={styles["service-checkbox"]}>
                                        <Form.Check
                                            type="checkbox"
                                            label={`${service.name} (${convertWorktimeToReadableFormat(service.worktime)})`}
                                            checked={selectedServices.includes(service.id)}
                                            onChange={() => handleServiceChange(service.id)}
                                        />
                                    </div>
                                );
                            })}
                        </Form>

                        <h2 className={`${styles["choose-date-time-heading"]}`}>Choose Date / Time</h2>

                        <Row className="justify-content-center">
                            <Col xs={12} md={12} className="px-0 d-flex justify-content-center">
                                {timezoneMessage && (
                                    <Alert variant="warning" className={`mt-3 ${styles["alert-custom"]}`}>
                                        {timezoneMessage}
                                    </Alert>
                                )}
                            </Col>
                        </Row>


                        <Row className="justify-content-center">
                            <Col xs={12} md={12} className="px-0">
                                <div className="w-100 calendar-container">
                                    <Calendar
                                        className={`${styles["custom-calendar"]}`}
                                        localizer={localizer}
                                        events={allEvents}
                                        step={30}
                                        timeslots={2}
                                        defaultView="week"
                                        views={["week", "day"]}
                                        components={{
                                            allDaySlot: false,
                                            header: CustomHeader,
                                        }}
                                        min={new Date(2024, 9, 6, 8, 0)}
                                        max={new Date(2024, 9, 6, 20, 30)}
                                        style={{ height: 'auto', width: '100%' }}
                                        selectable={true}
                                        eventPropGetter={eventPropGetter}  // Set colour and cursor for events
                                        onSelectSlot={(slotInfo) => {
                                            const selectedStartTime = slotInfo.start;

                                            const selectedEndTime = new Date(
                                                selectedStartTime.getTime() + totalWorktime * 60000
                                            );
                                            // Prevent selecting any slot that overlaps with booked time slots
                                            const isOverlappingBooked = allEvents.some(event =>
                                                event.booked && (
                                                    (selectedStartTime >= event.start && selectedStartTime < event.end) ||  // Selected start overlaps with a booked slot
                                                    (selectedEndTime > event.start && selectedEndTime <= event.end) ||      // Selected end overlaps with a booked slot
                                                    (selectedStartTime <= event.start && selectedEndTime >= event.end)      // Selected time covers an entire booked slot
                                                )
                                            );

                                            if (isOverlappingBooked) {
                                                // Alert should not even trigger because interaction is prevented, but adding just in case.
                                                return;  // Prevent further action if it overlaps
                                            }

                                            // Clear previous selected times
                                            let updatedEvents = allEvents.filter(event => event.title !== "Selected Time");

                                            // Add new selected time
                                            const newEvent = {
                                                start: selectedStartTime,
                                                end: selectedEndTime,
                                                title: "Selected Time",
                                                available: true,
                                            };

                                            updatedEvents = [...updatedEvents, newEvent];

                                            // Update state with new time and events
                                            setAllEvents(updatedEvents);
                                            setSelectedTime({ start: selectedStartTime, end: selectedEndTime });
                                        }}
                                        onSelectEvent={async (event) => {
                                            if (event.booked && !event.mine) {
                                                alert("This time is already booked!");
                                                return;
                                            } else if (event.mine) {
                                                // Needed to capture booking services for event selection.
                                                // eslint-disable-next-line no-unused-vars
                                                const selectedServices = event.services || [];

                                                // Check if event has an id to get details 
                                                if (!event.id) {
                                                    console.error("No booking ID found for this event.");
                                                    return; // Abort if missing id
                                                }

                                                try {
                                                    // Get full booking details
                                                    const response = await axiosReq.get(`/bookings/${event.id}/`);
                                                    const bookingData = response.data;

                                                    // Set booking and add services from backend
                                                    setSelectedBooking({ ...event, services: bookingData.services });
                                                } catch (error) {
                                                    console.error("Error fetching booking details:", error);
                                                }

                                            } else if (event.available && event.title === "Selected Time") {
                                                setAllEvents(allEvents.filter(ev => ev !== event));
                                                setSelectedTime(null);
                                            } else if (event.available && totalWorktime > 0) {
                                                const startTime = event.start;
                                                const endTime = new Date(startTime.getTime() + totalWorktime * 60000);
                                                const selectedRange = {
                                                    start: startTime,
                                                    end: endTime,
                                                    title: "Selected Time",
                                                    available: true,
                                                };

                                                setSelectedTime(selectedRange);

                                                const newEvents = [...allEvents.filter(ev => ev.title !== "Selected Time"), selectedRange];
                                                setAllEvents(newEvents);
                                            }
                                        }}
                                    />
                                </div>
                            </Col>
                        </Row>
                        {selectedBooking && (
                            <Modal show={true} onHide={() => setSelectedBooking(null)}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Booking Details</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <p><strong>Date:</strong> {new Date(selectedBooking.start).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <p><strong>Total Duration:</strong> {calculateBookingDuration(selectedBooking.start, selectedBooking.end)}</p>

                                    <p><strong>Services:</strong></p>
                                    <ul>
                                        {selectedBooking.services && selectedBooking.services.length > 0 ? (
                                            selectedBooking.services.map((service) => (
                                                <li key={service.id}>
                                                    {service.name}
                                                </li>
                                            ))
                                        ) : (
                                            <li>No services booked.</li>
                                        )}
                                    </ul>

                                    {/* Show total price */}
                                    {selectedBooking.services && selectedBooking.services.length > 0 && (
                                        <p><strong>Price from</strong> {calculateTotalPrice(selectedBooking.services)} Euro</p>
                                    )}
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={() => setSelectedBooking(null)}>
                                        Close
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        )}
                    </Col>
                </Row>
            </Container>
            <div className={styles["sticky-button"]}>
                <Button
                    onClick={handleBookingSubmit}
                    disabled={isSubmitting || !selectedServices.length || !selectedTime}
                    className={`mt-3 ${styles["book-services-btn"]}`}
                >
                    {isSubmitting ? "Booking..." : "Book Services"}
                </Button>
            </div>
        </div>
    );
};

export default Bookings;


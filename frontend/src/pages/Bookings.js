import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Alert } from "react-bootstrap";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { axiosReq } from "../api/axiosDefaults";
import "../styles/Bookings.module.css";

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

const Bookings = () => {
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [selectedTime, setSelectedTime] = useState(null);
    const [totalWorktime, setTotalWorktime] = useState(0); // Storing total worktime
    const [allEvents, setAllEvents] = useState([]);


    useEffect(() => {
        const fetchTimes = async () => {
            try {
                // Hämta tillgänglighet, alla bokningar och användarens egna bokningar
                const { data: availability } = await axiosReq.get("/availability/");
                const { data: allBookings } = await axiosReq.get("/bookings/all/");
                const { data: myBookings } = await axiosReq.get("/bookings/mine/");
                const { data: servicesData } = await axiosReq.get("/services/");

                setServices(servicesData);

                // Log för inspektion
                console.log("Full booking data from /bookings/all/:", allBookings);
                console.log("Full booking data from /bookings/mine/:", myBookings);

                // Parse all bookings (block other users' bookings)
                const bookedEvents = allBookings.map((booking) => {
                    if (!booking.date_time || !booking.end_time) {
                        console.warn("Skipping invalid booking entry (all bookings):", booking);
                        return null;
                    }

                    return {
                        start: new Date(booking.date_time),
                        end: new Date(booking.end_time),
                        title: "Booked (Unavailable)",
                        available: false,
                        booked: true,
                        mine: false // Not user's own booking
                    };
                }).filter(event => event !== null);

                // Parse user's own bookings (these will be interactive and visible)
                const myBookedEvents = myBookings.map((booking) => {
                    // Log the entire booking entry to understand what's missing
                    console.log("Inspecting my booking entry:", booking);

                    if (!booking.date_time || !booking.end_time) {
                        console.warn("Skipping invalid user booking entry (missing date_time or end_time):", booking);
                        return null;
                    }

                    return {
                        start: new Date(booking.date_time),
                        end: new Date(booking.end_time),
                        title: "My Booking",
                        available: true,
                        booked: true,
                        mine: true // User's own booking
                    };
                }).filter(event => event !== null);

                // Parse availability into intervals while avoiding overlaps with booked events
                const availableEvents = availability.flatMap((availability) => {
                    const start = new Date(availability.date + 'T' + availability.start_time);
                    const end = new Date(availability.date + 'T' + availability.end_time);

                    const events = [];
                    let current = start;

                    while (current < end) {
                        const next = new Date(current.getTime() + 30 * 60 * 1000); // 30 minutes forward

                        const eventStart = new Date(current);

                        // Check if this available time overlaps with any booked time
                        const isOverlapping = bookedEvents.some(booked =>
                            (eventStart >= booked.start && eventStart < booked.end) ||
                            (next > booked.start && next <= booked.end)
                        );

                        // Only add available times that don't overlap
                        if (!isOverlapping) {
                            events.push({
                                start: eventStart,
                                end: next,
                                available: true,
                                booked: false,
                                mine: false // Not user’s own booking
                            });
                        }

                        current = next;
                    }

                    return events;
                });

                // Combine available, booked events (for blocking times), and user's own bookings (for interaction)
                setAllEvents([...availableEvents, ...bookedEvents, ...myBookedEvents]);

                // Log för verifiering av slutlig lista
                console.log("Combined events (available + booked + mine):", [...availableEvents, ...bookedEvents, ...myBookedEvents]);

            } catch (err) {
                console.error("Error fetching times:", err);
            }
        };
        fetchTimes();
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

        // Control that worktime is bigger than 0
        if (totalWorktime === 0) {
            alert("Total worktime is 0. Please select services correctly.");
            return;
        }

        try {
            const bookingData = {
                service_ids: selectedServices,
                date_time: selectedTime.start.toISOString(),
                end_time: selectedTime.end.toISOString(),
            };

            await axiosReq.post("/bookings/", bookingData);
            setBookingSuccess(true);
        } catch (err) {
            console.error("Error creating booking:", err.response ? err.response.data : err.message);
        }
    };


    // Function to show different colours for different events in the calendar
    const eventPropGetter = (event) => {
        let style = {};

        if (event.booked) {
            // Make booked events completely transparent and unclickable
            style = {
                backgroundColor: 'transparent',
                border: 'none',
                pointerEvents: 'none',
                color: 'transparent',
            };
        } else if (event.available) {
            // Available events, shown as green and clickable
            style = {
                backgroundColor: 'green',
                cursor: 'pointer',
                border: 'none',
                fontSize: 10,
            };
        }

        return { style };
    };



    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={8}>
                    <h2>Choose Services</h2>
                    {bookingSuccess && <Alert variant="success">Booking Successful!</Alert>}

                    <Form>
                        {services.map((service) => {
                            return (
                                <Form.Check
                                    type="checkbox"
                                    key={service.id}
                                    label={`${service.name} (${service.worktime}h)`}
                                    checked={selectedServices.includes(service.id)}
                                    onChange={() => handleServiceChange(service.id)}
                                />
                            );
                        })}
                    </Form>

                    <Button
                        onClick={handleBookingSubmit}
                        disabled={isSubmitting || !selectedServices.length || !selectedTime}
                        className="mt-3"
                    >
                        {isSubmitting ? "Booking..." : "Book Services"}
                    </Button>


                    <h2 className="mt-4">Choose Date / Time</h2>

                    <Calendar
                        localizer={localizer}
                        events={allEvents}
                        step={30}
                        timeslots={2}
                        defaultView="week"
                        views={["week"]}
                        min={new Date(2024, 9, 6, 8, 0)}
                        max={new Date(2024, 9, 6, 20, 30)}
                        style={{ height: 600 }}
                        selectable={true}
                        eventPropGetter={eventPropGetter}  // Set colour and cursor for events
                        onSelectSlot={(slotInfo) => {
                            const selectedStartTime = slotInfo.start;
                            const selectedEndTime = new Date(selectedStartTime.getTime() + totalWorktime * 60000);  // Calculate the end time based on total worktime

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
                                //start: selectedStartTime,
                                //end: selectedEndTime,
                                title: "Selected Time",
                                available: true,
                            };

                            updatedEvents = [...updatedEvents, newEvent];

                            // Update state with new time and events
                            setAllEvents(updatedEvents);
                            setSelectedTime({ start: selectedStartTime, end: selectedEndTime });
                        }}

                        onSelectEvent={(event) => {
                            if (event.booked) {
                                // Prevent clicking on booked events by showing a warning
                                alert("This time is already booked!");
                                return;  // Prevent interaction with booked events
                            } else if (event.available && event.title === "Selected Time") {
                                // Un-select time if already selected
                                setAllEvents(allEvents.filter(ev => ev !== event));
                                setSelectedTime(null);
                            } else if (event.available && totalWorktime > 0) {
                                // Select a new time
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
                </Col>
            </Row>
        </Container>
    );
};

export default Bookings;


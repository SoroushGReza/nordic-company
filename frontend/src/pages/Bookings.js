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
                const { data: availability } = await axiosReq.get("/availability/");
                const { data: bookings } = await axiosReq.get("/bookings/mine/");
                const { data: servicesData } = await axiosReq.get("/services/");

                setServices(servicesData);

                // Parse bookings into intervals with a transparent overlay style
                const bookedEvents = bookings.flatMap((booking) => {
                    const totalWorktimeInMinutes = booking.services.reduce((acc, service) => {
                        const worktimeInMinutes = parseWorktimeToMinutes(service.worktime);
                        return acc + worktimeInMinutes;
                    }, 0);

                    const startTime = new Date(booking.date_time);
                    const endTime = new Date(startTime.getTime() + totalWorktimeInMinutes * 60 * 1000);

                    const events = [];
                    let current = startTime;

                    while (current < endTime) {
                        const next = new Date(current.getTime() + 30 * 60 * 1000); // Add 30 minutes

                        events.push({
                            start: new Date(current),
                            end: next,
                            title: "Booked",
                            available: false,
                            booked: true,
                        });

                        current = next;
                    }

                    return events;
                });

                // Parse availability into intervals while avoiding overlaps with booked events
                const availableEvents = availability.flatMap((availability) => {
                    const start = new Date(availability.date + 'T' + availability.start_time);
                    const end = new Date(availability.date + 'T' + availability.end_time);

                    const events = [];
                    let current = start;

                    while (current < end) {
                        const next = new Date(current.getTime() + 30 * 60 * 1000); // 30 minutes forward

                        // Create a copy of `current` to ensure each loop iteration is independent
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
                            });
                        }

                        current = next;
                    }

                    return events;
                });

                // Combine available and booked events
                setAllEvents([...availableEvents, ...bookedEvents]);
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


    useEffect(() => {
        console.log("Selected Services: ", selectedServices);
        console.log("Selected Time: ", selectedTime);
    }, [selectedServices, selectedTime]);

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
                                console.log("This time is already booked.");
                                return;  // Prevent further action if it overlaps
                            }

                            console.log("Selected time range:", selectedStartTime, "to", selectedEndTime);

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
                                console.log("Time unselected:", event.start);
                            } else if (event.available && totalWorktime > 0) {
                                // Select a new time
                                const startTime = event.start;
                                const endTime = new Date(startTime.getTime() + totalWorktime * 60000);

                                console.log("Selected Time from Event:", startTime);
                                console.log("Calculated End Time:", endTime);

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


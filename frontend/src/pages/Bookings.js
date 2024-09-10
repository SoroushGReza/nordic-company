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

                const availableEvents = availability.flatMap((availability) => {
                    const start = new Date(availability.date + 'T' + availability.start_time);
                    const end = new Date(availability.date + 'T' + availability.end_time);

                    const events = [];
                    let current = start;

                    while (current < end) {
                        const next = new Date(current.getTime() + 30 * 60 * 1000); // 30 minutes forward
                        events.push({
                            start: new Date(current),
                            end: next,
                            title: "Available",
                            available: true,
                            booked: false,
                        });
                        current = next;
                    }

                    return events;
                });

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

                // Combine available events and booked events & update allEvents
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
        console.log(`Parsed worktime: ${worktime} -> ${totalMinutes} minutes`);
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

        console.log("Total Worktime (minutes):", selectedServiceTimes);

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

        console.log("Selected Time:", selectedTime);
        console.log("Total Worktime (minutes):", totalWorktime);

        try {
            const bookingData = {
                service_ids: selectedServices,
                date_time: selectedTime.start.toISOString(),
                end_time: selectedTime.end.toISOString(),
            };

            console.log("Booking data to be sent:", bookingData);

            await axiosReq.post("/bookings/", bookingData);
            setBookingSuccess(true);
        } catch (err) {
            console.error("Error creating booking:", err.response ? err.response.data : err.message);
        }
    };


    // Function to show different colours for different events in the calendar
    const eventPropGetter = (event) => {
        let backgroundColor = "lightgray"; // Unavailable times

        if (event.available && !event.booked) {
            backgroundColor = "green"; // Available times
        } else if (event.booked) {
            backgroundColor = "red"; // Already Booked
        }

        return {
            style: {
                backgroundColor,
                color: "white",
                borderRadius: "0px",
                opacity: 0.8,
                border: "none",
                cursor: event.available ? "pointer" : "default",
            },
        };
    };

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={8}>
                    <h2>Choose Services</h2>
                    {bookingSuccess && <Alert variant="success">Booking Successful!</Alert>}

                    <Form>
                        {services.map((service) => {
                            console.log(`Rendering service: ${service.name} (ID: ${service.id})`);
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
                        events={allEvents}  // Use combined events
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
                            console.log("Slot clicked! Info: ", slotInfo);

                            // Use the exact time user klicks on
                            setSelectedTime(slotInfo.start);
                            console.log("Selected Time:", slotInfo.start);
                        }}
                        onSelectEvent={(event) => {
                            if (event.available) {
                                // Få starttiden
                                const startTime = event.start;

                                // Beräkna sluttiden baserat på total arbetstid (totalWorktime i minuter)
                                const endTime = new Date(startTime.getTime() + totalWorktime * 60000); // Lägg till total worktime till starttiden

                                console.log("Selected Time from Event:", startTime);
                                console.log("Calculated End Time:", endTime);

                                // Skapa ett nytt event för att markera hela intervallet
                                const selectedRange = {
                                    start: startTime,
                                    end: endTime,
                                    title: "Selected Time",
                                    available: true
                                };

                                // Uppdatera selectedTime
                                setSelectedTime(selectedRange);

                                // Uppdatera allEvents för att lägga till det nya valtidsintervallet
                                const newEvents = [...allEvents, selectedRange];
                                setAllEvents(newEvents);

                                console.log("Updated allEvents with selected time range:", newEvents);
                            } else {
                                alert("This time is already booked!");
                            }
                        }}

                    />
                </Col>
            </Row>
        </Container>
    );
};

export default Bookings;


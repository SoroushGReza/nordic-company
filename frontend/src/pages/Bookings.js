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

// Localization for the calendar
const locales = {
    "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const Bookings = () => {
    const [availableTimes, setAvailableTimes] = useState([]); // Tillgängliga tider
    const [bookedTimes, setBookedTimes] = useState([]); // Bokade tider
    const [services, setServices] = useState([]); // Tjänster hämtas från API
    const [selectedServices, setSelectedServices] = useState([]); // Valda tjänster
    const [bookingSuccess, setBookingSuccess] = useState(false); // Hantera framgångsmeddelande

    // Hämtar tillgängliga tider och bokningar från API
    useEffect(() => {
        const fetchTimes = async () => {
            try {
                const { data: availability } = await axiosReq.get("/availability/");
                const { data: bookings } = await axiosReq.get("/bookings/mine/");
                const { data: servicesData } = await axiosReq.get("/services/");

                setAvailableTimes(availability);
                setBookedTimes(bookings);
                setServices(servicesData);
            } catch (err) {
                console.error("Error fetching times:", err);
            }
        };

        fetchTimes();
    }, []);

    // När användaren väljer tjänster
    const handleServiceChange = (serviceId) => {
        if (selectedServices.includes(serviceId)) {
            setSelectedServices(selectedServices.filter((id) => id !== serviceId));
        } else {
            setSelectedServices([...selectedServices, serviceId]);
        }
    };

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={8}>
                    <h2>Choose Services</h2>
                    {bookingSuccess && <Alert variant="success">Booking Successful!</Alert>}

                    <Form>
                        {services.map((service) => (
                            <Form.Check
                                type="checkbox"
                                key={service.id}
                                label={`${service.name} (${service.worktime}h)`}
                                checked={selectedServices.includes(service.id)}
                                onChange={() => handleServiceChange(service.id)}
                            />
                        ))}
                    </Form>

                    <Button
                        onClick={() => {
                            setBookingSuccess(true);
                        }}
                        disabled={!selectedServices.length}
                        className="mt-3"
                    >
                        Book Services
                    </Button>

                    <h2 className="mt-4">Choose Date / Time</h2>

                    <Calendar
                        localizer={localizer}
                        events={bookedTimes.map((booking) => ({
                            start: new Date(booking.date_time),
                            end: new Date(
                                new Date(booking.date_time).getTime() +
                                selectedServices.reduce((acc, serviceId) => {
                                    const service = services.find((s) => s.id === serviceId);
                                    return acc + service.worktime * 60 * 60 * 1000;
                                }, 0)
                            ),
                            title: "Booked",
                        }))}
                        step={30}
                        timeslots={2}
                        defaultView="week"
                        views={["week"]}
                        min={new Date(2024, 9, 6, 8, 0)} // Startar vid 08:00
                        max={new Date(2024, 9, 6, 20, 30)} // Slutar vid 20:30
                        style={{ height: 600 }}
                        selectable={true}
                        onSelectSlot={(slotInfo) => {
                            // Kolla om vald tid är tillgänglig
                            const isAvailable = availableTimes.some((availability) => {
                                const start = new Date(availability.date + 'T' + availability.start_time);
                                const end = new Date(availability.date + 'T' + availability.end_time);
                                return slotInfo.start >= start && slotInfo.end <= end;
                            });

                            if (!isAvailable) {
                                alert("Selected time is not available!");
                            } else {
                                // Hantera bokningslogik här om tiden är tillgänglig
                                setBookingSuccess(true);
                            }
                        }}
                    />

                </Col>
            </Row>
        </Container>
    );
};

export default Bookings;

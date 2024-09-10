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
    const [availableTimes, setAvailableTimes] = useState([]);
    const [bookedTimes, setBookedTimes] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [selectedTime, setSelectedTime] = useState(null);
    const [totalWorktime, setTotalWorktime] = useState(0); // Storing total worktime

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

    // Funktion för att omvandla "HH:MM:SS" till minuter
    const parseWorktimeToMinutes = (worktime) => {
        const [hours, minutes, seconds] = worktime.split(':').map(Number); // Omvandla HH:MM:SS till nummer
        const totalMinutes = (hours * 60) + minutes + (seconds / 60);  // Omvandla till minuter
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

        // Summera arbetstiden för alla valda tjänster
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

    const [isSubmitting] = useState(false);  // Ny state för att hantera knappen

    const handleBookingSubmit = async () => {
        if (!selectedTime || selectedServices.length === 0) {
            alert("Please select a time and at least one service.");
            return;
        }

        // Kontrollera att arbetstiden är större än 0
        if (totalWorktime === 0) {
            alert("Total worktime is 0. Please select services correctly.");
            return;
        }

        console.log("Selected Time:", selectedTime);
        console.log("Total Worktime (minutes):", totalWorktime);

        try {
            const bookingData = {
                service_ids: selectedServices,
                date_time: selectedTime.toISOString(),
                // Beräkna sluttid baserat på total arbetstid
                end_time: new Date(selectedTime.getTime() + totalWorktime * 60000).toISOString(),
            };

            console.log("Booking data to be sent:", bookingData);

            await axiosReq.post("/bookings/", bookingData);
            setBookingSuccess(true);
        } catch (err) {
            console.error("Error creating booking:", err.response ? err.response.data : err.message);
        }
    };



    // Funktion för att ställa in färger på händelser i kalendern
    const eventPropGetter = (event) => {
        let backgroundColor = "lightgray"; // Standard för otillgänglig tid

        if (event.available && !event.booked) {
            backgroundColor = "green"; // Tillgänglig tid
        } else if (event.booked) {
            backgroundColor = "red"; // Bokad tid visas som röd
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


    // Förbered tillgängliga tider som händelser
    const availableEvents = availableTimes.flatMap((availability) => {
        const start = new Date(availability.date + 'T' + availability.start_time);
        const end = new Date(availability.date + 'T' + availability.end_time);

        const events = [];
        let current = start;

        // Gå igenom varje 30-minuters intervall och skapa separata event
        while (current < end) {
            const next = new Date(current.getTime() + 30 * 60 * 1000); // 30 minuter framåt
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


    // Förbered bokade tider som händelser
    const bookedEvents = bookedTimes.map((booking) => {
        const totalWorktimeInMinutes = booking.services.reduce((acc, service) => {
            console.log(`Service: ${service.name}, Worktime: ${service.worktime}`);

            // Konvertera arbetstiden från sekunder till minuter
            const worktimeInMinutes = service.worktime / 60;
            return acc + worktimeInMinutes;
        }, 0);

        // Beräkna sluttiden baserat på 30-minutersintervaller
        const totalWorktimeIn30MinuteBlocks = Math.ceil(totalWorktimeInMinutes / 30);

        return {
            start: new Date(booking.date_time),
            end: new Date(new Date(booking.date_time).getTime() + totalWorktimeIn30MinuteBlocks * 30 * 60 * 1000),
            title: "Booked",
            available: false,
            booked: true,
        };
    });

    const allEvents = [...availableEvents, ...bookedEvents]; // Kombinera alla händelser

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
                        events={allEvents}  // Använd kombinerade händelser
                        step={30}
                        timeslots={2}
                        defaultView="week"
                        views={["week"]}
                        min={new Date(2024, 9, 6, 8, 0)}
                        max={new Date(2024, 9, 6, 20, 30)}
                        style={{ height: 600 }}
                        selectable={true}
                        eventPropGetter={eventPropGetter}  // Ställ in färger och cursor för händelser
                        onSelectSlot={(slotInfo) => {
                            console.log("Slot clicked! Info: ", slotInfo);

                            // Använd den exakta tidpunkten som användaren klickar på
                            setSelectedTime(slotInfo.start);
                            console.log("Selected Time:", slotInfo.start);
                        }}
                        onSelectEvent={(event) => {
                            if (event.available) {
                                // Om en tillgänglig tid klickas, välj den exakta tidpunkten.
                                setSelectedTime(event.start);
                                console.log("Selected Time from Event:", event.start);
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


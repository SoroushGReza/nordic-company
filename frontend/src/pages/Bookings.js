//import React, { useState, useEffect } from "react";
//import { Container, Row, Col, Button, Form, Alert } from "react-bootstrap";
//import { Calendar, dateFnsLocalizer } from "react-big-calendar";
//import format from "date-fns/format";
//import parse from "date-fns/parse";
//import startOfWeek from "date-fns/startOfWeek";
//import getDay from "date-fns/getDay";
//import "react-big-calendar/lib/css/react-big-calendar.css";
//import { axiosReq } from "../api/axiosDefaults";
//import "../styles/Bookings.module.css";

//// Localization for the calendar using Irish locale (en-IE)
//const locales = {
//    "en-IE": require("date-fns/locale/en-IE"),  // Irish Timezone
//};

//const localizer = dateFnsLocalizer({
//    format,
//    parse,
//    startOfWeek,
//    getDay,
//    locales,
//});

//const Bookings = () => {
//    const [availableTimes, setAvailableTimes] = useState([]); // Tillgängliga tider
//    const [bookedTimes, setBookedTimes] = useState([]); // Bokade tider
//    const [services, setServices] = useState([]); // Tjänster hämtas från API
//    const [selectedServices, setSelectedServices] = useState([]); // Valda tjänster
//    const [bookingSuccess, setBookingSuccess] = useState(false); // Hantera framgångsmeddelande
//    const [selectedTime, setSelectedTime] = useState(null); // Vald tid från kalendern

//    // Hämtar tillgängliga tider och bokningar från API
//    useEffect(() => {
//        const fetchTimes = async () => {
//            try {
//                const { data: availability } = await axiosReq.get("/availability/");
//                const { data: bookings } = await axiosReq.get("/bookings/mine/");
//                const { data: servicesData } = await axiosReq.get("/services/");

//                setAvailableTimes(availability);
//                setBookedTimes(bookings);
//                setServices(servicesData);
//            } catch (err) {
//                console.error("Error fetching times:", err);
//            }
//        };

//        fetchTimes();
//    }, []);

//    // När användaren väljer tjänster
//    const handleServiceChange = (serviceId) => {
//        if (selectedServices.includes(serviceId)) {
//            setSelectedServices(selectedServices.filter((id) => id !== serviceId));
//        } else {
//            setSelectedServices([...selectedServices, serviceId]);
//        }
//    };

//    // Funktion för att hantera bokningsbegäran
//    const handleBookingSubmit = async () => {
//        try {
//            const bookingData = {
//                service_ids: selectedServices,
//                date_time: selectedTime ? selectedTime.toISOString() : new Date().toISOString(),
//            };

//            // Skicka POST-begäran för att skapa bokning
//            const response = await axiosReq.post("/bookings/", bookingData);

//            if (response.status === 201) {
//                setBookingSuccess(true); // Visa framgångsmeddelande om bokningen skapades
//            } else {
//                console.error("Booking Failed.");
//            }
//        } catch (error) {
//            console.error("Error creating booking:", error);
//        }
//    };

//    return (
//        <Container>
//            <Row className="justify-content-center">
//                <Col md={8}>
//                    <h2>Choose Services</h2>
//                    {bookingSuccess && <Alert variant="success">Booking Successful!</Alert>}

//                    <Form>
//                        {services.map((service) => (
//                            <Form.Check
//                                type="checkbox"
//                                key={service.id}
//                                label={`${service.name} (${service.worktime}h)`}
//                                checked={selectedServices.includes(service.id)}
//                                onChange={() => handleServiceChange(service.id)}
//                            />
//                        ))}
//                    </Form>

//                    <Button
//                        onClick={handleBookingSubmit} // Skickar bokning till backend
//                        disabled={!selectedServices.length || !selectedTime} // Inaktivera knappen om ingen tjänst eller tid har valts
//                        className="mt-3"
//                    >
//                        Book Services
//                    </Button>

//                    <h2 className="mt-4">Choose Date / Time</h2>

//                    <Calendar
//                        localizer={localizer}
//                        events={bookedTimes.map((booking) => ({
//                            start: new Date(booking.date_time),
//                            end: new Date(
//                                new Date(booking.date_time).getTime() +
//                                selectedServices.reduce((acc, serviceId) => {
//                                    const service = services.find((s) => s.id === serviceId);
//                                    return acc + service.worktime * 60 * 60 * 1000;
//                                }, 0)
//                            ),
//                            title: "Booked",
//                        }))}
//                        step={30}
//                        timeslots={2}
//                        defaultView="week"
//                        views={["week"]}
//                        min={new Date(2024, 9, 6, 8, 0)} // Startar vid 08:00
//                        max={new Date(2024, 9, 6, 20, 30)} // Slutar vid 20:30
//                        style={{ height: 600 }}
//                        selectable={true}
//                        onSelectSlot={(slotInfo) => {
//                            // Kolla om vald tid är tillgänglig
//                            const isAvailable = availableTimes.some((availability) => {
//                                const start = new Date(availability.date + 'T' + availability.start_time);
//                                const end = new Date(availability.date + 'T' + availability.end_time);
//                                return slotInfo.start >= start && slotInfo.end <= end;
//                            });

//                            if (!isAvailable) {
//                                alert("Selected time is not available!");
//                            } else {
//                                setSelectedTime(slotInfo.start);  // Spara vald tid
//                            }
//                        }}
//                    />

//                </Col>
//            </Row>
//        </Container>
//    );
//};

//export default Bookings;

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

    useEffect(() => {
        const fetchTimes = async () => {
            try {
                console.log("Fetching availability, bookings, and services...");
                const { data: availability } = await axiosReq.get("/availability/");
                console.log("Availability data: ", availability);

                const { data: allBookings } = await axiosReq.get("/bookings/all/");  // Använd den nya endpointen
                console.log("Bookings data: ", allBookings);

                const { data: servicesData } = await axiosReq.get("/services/");
                console.log("Services data: ", servicesData);

                setAvailableTimes(availability);
                setBookedTimes(allBookings); // Uppdatera med alla bokningar utan användarinformation
                setServices(servicesData);
            } catch (err) {
                console.error("Error fetching times:", err.response ? err.response.data : err.message);
            }
        };

        fetchTimes();
    }, []);


    const handleServiceChange = (serviceId) => {
        setSelectedServices((prevSelectedServices) => {
            if (prevSelectedServices.includes(serviceId)) {
                return prevSelectedServices.filter((id) => id !== serviceId);
            } else {
                return [...prevSelectedServices, serviceId];
            }
        });
    };

    useEffect(() => {
        console.log("Selected Services: ", selectedServices);
        console.log("Selected Time: ", selectedTime);
    }, [selectedServices, selectedTime]);




    const handleBookingSubmit = async () => {
        if (!selectedTime || !selectedServices.length) {
            alert("Please select a service and a time before booking.");
            return;
        }

        try {
            const bookingData = {
                service_ids: selectedServices,
                date_time: selectedTime.toISOString(),
            };

            const response = await axiosReq.post("/bookings/", bookingData);

            if (response.status === 201) {
                setBookingSuccess(true);
            } else {
                console.error("Booking Failed.");
            }
        } catch (error) {
            console.error("Error creating booking:", error.response ? error.response.data : error.message);
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
            },
        };
    };


    // Förbered tillgängliga tider som händelser
    const availableEvents = availableTimes.map((availability) => {
        const start = new Date(availability.date + 'T' + availability.start_time);
        const end = new Date(availability.date + 'T' + availability.end_time);
        return {
            start,
            end,
            title: "Available",
            available: true,
            booked: false,
        };
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
            end: new Date(new Date(booking.date_time).getTime() + totalWorktimeIn30MinuteBlocks * 30 * 60 * 1000),  // Beräkna sluttiden i 30-minutersblock
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
                        onClick={handleBookingSubmit}
                        disabled={!selectedServices.length || !selectedTime}
                        className="mt-3"
                    >
                        Book Services
                    </Button>

                    <h2 className="mt-4">Choose Date / Time</h2>

                    <Calendar
                        localizer={localizer}
                        events={allEvents} // Använd kombinerade händelser
                        step={30}
                        timeslots={2}
                        defaultView="week"
                        views={["week"]}
                        min={new Date(2024, 9, 6, 8, 0)}
                        max={new Date(2024, 9, 6, 20, 30)}
                        style={{ height: 600 }}
                        selectable={true}
                        eventPropGetter={eventPropGetter} // Ställ in färger för händelser
                        onSelectSlot={(slotInfo) => {
                            const isAvailable = availableTimes.some((availability) => {
                                const start = new Date(availability.date + 'T' + availability.start_time);
                                const end = new Date(availability.date + 'T' + availability.end_time);
                                return slotInfo.start >= start && slotInfo.end <= end;
                            });

                            if (!isAvailable) {
                                alert("Selected time is not available!");
                            } else {
                                setSelectedTime(slotInfo.start);
                                console.log("Updated selectedTime:", slotInfo.start);  // Lägg till detta för att kontrollera att tiden uppdateras
                            }
                        }}



                    />
                </Col>
            </Row>
        </Container>
    );
};

export default Bookings;

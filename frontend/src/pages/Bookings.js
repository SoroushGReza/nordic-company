import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { axiosReq } from "../api/axiosDefaults";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";

const Bookings = () => {
    const [date, setDate] = useState(new Date());
    const [availableTimes, setAvailableTimes] = useState([]);
    const [bookedTimes, setBookedTimes] = useState([]);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Hämtar tillgängliga och bokade tider från API
    useEffect(() => {
        const fetchTimes = async () => {
            try {
                const { data: availability } = await axiosReq.get("/availability/");
                const { data: bookings } = await axiosReq.get("/bookings/mine/");

                // Visa svar i konsolen för felsökning
                console.log('Availability:', availability);
                console.log('Bookings:', bookings);

                // Extrahera tillgängliga tider och bokade tider
                setAvailableTimes(availability.map(item => item.date)); // Lägger till tillgängliga datum
                setBookedTimes(bookings.map(booking => booking.date)); // Lägger till bokade datum
            } catch (err) {
                console.error("Error fetching times:", err);
            }
        };

        fetchTimes();
    }, []);

    // När användaren klickar på en tillgänglig tid
    const handleBooking = async (selectedDate) => {
        try {
            await axiosReq.post("/bookings/", { date: selectedDate });
            setBookingSuccess(true);
        } catch (err) {
            console.error("Error booking time:", err);
        }
    };

    // Bestämmer om en dag är tillgänglig eller redan bokad
    const isTileDisabled = ({ date }) => {
        const formattedDate = date.toISOString().split('T')[0];

        // Blockera om datumet inte finns i availableTimes eller redan är bokat
        return !availableTimes.includes(formattedDate) || bookedTimes.includes(formattedDate);
    };

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={8}>
                    <h2>Välj en tid för att boka</h2>
                    {bookingSuccess && <Alert variant="success">Bokning genomförd!</Alert>}

                    <Calendar
                        onChange={setDate}
                        value={date}
                        tileDisabled={isTileDisabled}
                    />
                    <Button
                        onClick={() => handleBooking(date.toISOString().split('T')[0])}
                        disabled={bookedTimes.includes(date.toISOString().split('T')[0])}
                        className="mt-3"
                    >
                        Boka vald tid
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default Bookings;

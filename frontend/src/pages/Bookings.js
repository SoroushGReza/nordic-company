import React, { useState, useEffect } from "react";
import Calendar from "react-calendar"; // Importera kalenderkomponenten
import 'react-calendar/dist/Calendar.css'; // Kalenderns CSS
import { axiosReq } from "../api/axiosDefaults"; // Axios inställningar
import { Container, Row, Col, Button, Alert } from "react-bootstrap";

const Bookings = () => {
    const [date, setDate] = useState(new Date()); // Håller det valda datumet
    const [availableTimes, setAvailableTimes] = useState([]); // Lista med tillgängliga tider
    const [bookedTimes, setBookedTimes] = useState([]); // Lista med bokade tider
    const [bookingSuccess, setBookingSuccess] = useState(false); // För att visa om bokningen lyckades

    // Hämtar tillgängliga och bokade tider från API
    useEffect(() => {
        const fetchTimes = async () => {
            try {
                const { data: availability } = await axiosReq.get("/availability/");
                const { data: bookings } = await axiosReq.get("/bookings/list/");

                // Extrahera tillgängliga och bokade tider från svaren
                setAvailableTimes(availability);
                setBookedTimes(bookings.map(booking => booking.date)); // Anta att 'date' är i formatet 'YYYY-MM-DD'
            } catch (err) {
                console.error("Error fetching times:", err);
            }
        };

        fetchTimes();
    }, []);

    // När användaren klickar på en tillgänglig tid
    const handleBooking = async (date) => {
        try {
            await axiosReq.post("/bookings/create/", { date });
            setBookingSuccess(true);
        } catch (err) {
            console.error("Error booking time:", err);
        }
    };

    // Funktion som bestämmer om en dag är tillgänglig eller redan bokad
    const isTileDisabled = ({ date }) => {
        const formattedDate = date.toISOString().split('T')[0]; // Formatera datumet till YYYY-MM-DD

        // Om datumet inte finns i availableTimes eller om det redan är bokat, blockera det
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
                        tileDisabled={isTileDisabled} // Används för att göra redan bokade dagar otillgängliga
                    />
                    <Button
                        onClick={() => handleBooking(date)}
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

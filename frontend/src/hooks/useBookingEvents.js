import { useState, useEffect, useCallback } from "react";
import { axiosReq } from "../api/axiosDefaults";
import { DateTime } from "luxon";

const useBookingEvents = (isAdmin = false) => {
    const [events, setEvents] = useState([]);
    const [services, setServices] = useState([]);
    const [bookingError, setBookingError] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const availabilityUrl = isAdmin ? "/admin/availability/" : "/availability/";
            const bookingsUrl = isAdmin ? "/admin/bookings/" : "/bookings/all/";
            const servicesUrl = isAdmin ? "/admin/services/" : "/services/";

            const { data: availability } = await axiosReq.get(availabilityUrl);
            const { data: allBookings } = await axiosReq.get(bookingsUrl);
            const { data: servicesData } = await axiosReq.get(servicesUrl);

            setServices(servicesData);

            const bookedEvents = allBookings.map((booking) => {
                if (!booking.date_time || !booking.end_time) return null;
                return {
                    start: DateTime.fromISO(booking.date_time).toJSDate(),
                    end: DateTime.fromISO(booking.end_time).toJSDate(),
                    title: booking.user_name || "Unknown User",
                    booked: true,
                    id: booking.id,
                };
            }).filter(event => event !== null);

            const availableEvents = availability.flatMap((avail) => {
                const [year, month, day] = avail.date.split("-").map(Number);
                const [startHour, startMinute] = avail.start_time.split(":").map(Number);
                const [endHour, endMinute] = avail.end_time.split(":").map(Number);

                const start = new Date(year, month - 1, day, startHour, startMinute);
                const end = new Date(year, month - 1, day, endHour, endMinute);

                const events = [];
                let current = start;

                while (current < end) {
                    const next = new Date(current.getTime() + 30 * 60 * 1000);

                    const eventStart = new Date(current);
                    const eventEnd = new Date(next);

                    const isOverlapping = bookedEvents.some((booked) => {
                        return (
                            (booked.start <= eventStart && eventStart < booked.end) ||
                            (booked.start < eventEnd && eventEnd <= booked.end) ||
                            (eventStart <= booked.start && eventEnd >= booked.end)
                        );
                    });

                    if (!isOverlapping) {
                        events.push({
                            start: eventStart,
                            end: eventEnd,
                            available: true,
                            booked: false,
                        });
                    }

                    current = next;
                }

                return events;
            });

            setEvents([...availableEvents, ...bookedEvents]);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching events:", err);
            setBookingError("Could not fetch events. Please try again.");
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const refreshEvents = () => {
        fetchEvents();
    };

    const updateBooking = async (bookingId, updatedData) => {
        try {
            await axiosReq.put(`/admin/bookings/${bookingId}/`, updatedData);
            refreshEvents(); // Update event after update
        } catch (err) {
            console.error("Error updating booking:", err);
        }
    };

    return {
        events,
        services,
        bookingError,
        loading,
        refreshEvents,
        updateBooking,
    };
};

export default useBookingEvents;

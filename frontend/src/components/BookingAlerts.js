import React, { useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import styles from '../styles/Bookings.module.css';

const BookingAlerts = ({
    bookingSuccess,
    setBookingSuccess,
    bookingError,
    setBookingError,
}) => {
    useEffect(() => {
        if (bookingSuccess) {
            const timer = setTimeout(() => {
                setBookingSuccess(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [bookingSuccess, setBookingSuccess]);

    useEffect(() => {
        if (bookingError) {
            const timer = setTimeout(() => {
                setBookingError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [bookingError, setBookingError]);

    return (
        <>
            {bookingSuccess && (
                <Alert
                    variant="success"
                    dismissible
                    onClose={() => setBookingSuccess(false)}
                    className={`position-fixed top-0 start-50 translate-middle-x ${styles['custom-success-alert']}`}
                >
                    <p>Booking Successful!</p>
                </Alert>
            )}

            {bookingError && (
                <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setBookingError('')}
                    className={`position-fixed top-0 start-50 translate-middle-x ${styles['booking-fail-alert']}`}
                >
                    <p>{bookingError}</p>
                </Alert>
            )}
        </>
    );
};

export default BookingAlerts;

import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { DateTime } from 'luxon';
import styles from '../styles/Bookings.module.css'; 

const CustomHeader = ({ date }) => {
    const isMobile = useMediaQuery({ query: '(max-width: 992px)' });

    // Use Luxon to get the day of the week (1 = Monday, 7 = Sunday)
    const day = DateTime.fromJSDate(date).weekday;

    // Determine the class based on the day
    const isWeekend = day === 6 || day === 7; // Saturday or Sunday
    const headerClass = isWeekend ? styles['weekend-header'] : styles['weekday-header'];

    // Format date based on screen size
    const formattedDate = isMobile
        ? DateTime.fromJSDate(date).toFormat('dd') // Only day for mobile
        : DateTime.fromJSDate(date).toFormat('dd EEE'); // Day and weekday

    return (
        <div className={`${headerClass} rbc-button-link`}>
            <span role="columnheader" aria-sort="none">{formattedDate}</span>
        </div>
    );
};

export default CustomHeader;

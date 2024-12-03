import React, { useEffect } from "react";
import { Alert } from "react-bootstrap";
import styles from "../styles/Bookings.module.css";

const AccountAlerts = ({
  successMessage,
  setSuccessMessage,
  errorMessage,
  setErrorMessage,
}) => {
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, setSuccessMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, setErrorMessage]);

  return (
    <>
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage("")}
          className={`position-fixed top-0 start-50 translate-middle-x ${styles["custom-success-alert"]}`}
        >
          <p>{successMessage}</p>
        </Alert>
      )}

      {errorMessage && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setErrorMessage("")}
          className={`position-fixed top-0 start-50 translate-middle-x ${styles["booking-fail-alert"]}`}
        >
          <p>{errorMessage}</p>
        </Alert>
      )}
    </>
  );
};

export default AccountAlerts;

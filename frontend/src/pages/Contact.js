import React, { useState, useEffect } from "react";
import useAuthStatus from "../hooks/useAuthStatus";
import "../styles/Contact.module.css";
import { sendEmail } from "../utils/sendEmail";
import { axiosReq } from "../api/axiosDefaults"; // Endast om du vill hämta användarinfo

const Contact = () => {
  const { isAuthenticated } = useAuthStatus(); // Kollar inloggningsstatus
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          const { data: user } = await axiosReq.get("/accounts/profile/");
          setFormData((prevData) => ({
            ...prevData,
            name: `${user.name} ${user.surname}`,
            email: user.email,
          }));
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendEmail(formData);
      alert("Your message has been sent successfully!");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Error sending email:", error);
      alert("There was an error sending your message. Please try again later.");
    }
  };

  return (
    <div className="contact-page">
      <h1>Contact</h1>
      <form onSubmit={handleSubmit} className="contact-form">
        <label>
          Name (Required):
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required={!isAuthenticated}
            placeholder="Your name here"
          />
        </label>
        <label>
          Email (Required):
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required={!isAuthenticated}
            placeholder="Your email here"
          />
        </label>
        <label>
          Phone (Optional):
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Your phone number (optional)"
          />
        </label>
        <label>
          Message (Required):
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Your message here"
          />
        </label>
        <button type="submit">Send</button>
      </form>
      <div className="contact-phone">
        <p>Phone:</p>
        <a href="tel:+46708234455" className="mobile-only">
          +46 708 23 44 55
        </a>
      </div>
    </div>
  );
};

export default Contact;

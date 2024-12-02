import React, { useState, useEffect } from "react";
// API
import { axiosReq } from "../api/axiosDefaults";
// Hooks
import useAuthStatus from "../hooks/useAuthStatus";
// Styling & Images
import styles from "../styles/Profile.module.css";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Image,
  Modal,
  Alert,
} from "react-bootstrap";
import ProfileImageText from "../assets/images/Profile.png";

function Profile() {
  useAuthStatus();

  const [profileData, setProfileData] = useState(null);
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data } = await axiosReq.get("/accounts/profile/");
        setProfileData(data);
        setImagePreview(data.profile_image);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setLoading(false); // Set loading to false even if there is error
        if (err.response && err.response.status === 401) {
          // Redirect to login if not logged in
          window.location.href = "/login";
        }
      }
    };
    fetchProfileData();
  }, []);

  // Handle changes in profile form
  const handleProfileChange = (event) => {
    setProfileData({
      ...profileData,
      [event.target.name]: event.target.value,
    });
  };

  // Handle profile image change
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileData({
        ...profileData,
        profile_image: file,
      });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle profile update submission
  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("username", profileData.username);
    formData.append("email", profileData.email);
    formData.append("name", profileData.name);
    formData.append("surname", profileData.surname);
    formData.append("phone_number", profileData.phone_number);
    if (profileData.profile_image instanceof File) {
      formData.append("profile_image", profileData.profile_image);
    }
    try {
      const { data } = await axiosReq.put("/accounts/profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setProfileData(data);
      alert("Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      }
    }
  };

  // Handle changes in password form inputs
  const handlePasswordChange = (event) => {
    setPasswordData({
      ...passwordData,
      [event.target.name]: event.target.value,
    });
  };

  // Handle password change submission
  const handleChangePassword = async (event) => {
    event.preventDefault();
    try {
      await axiosReq.put("/accounts/change-password/", passwordData);
      alert("Password updated successfully");
      setPasswordData({ old_password: "", new_password: "" });
    } catch (err) {
      console.error("Error changing password:", err);
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      }
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    try {
      await axiosReq.delete("/accounts/delete-account/", {
        data: { password: deletePassword },
      });
      alert("Account deleted successfully");
      // Log out the user and redirect to login page
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
    } catch (err) {
      console.error("Error deleting account:", err);
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      }
    }
  };

  // Display loading state if data is not fetched yet
  if (loading) {
    return (
      <Container className="mt-5">
        <h1>Loading Profile...</h1>
      </Container>
    );
  }

  return (
    <div className={styles.profilePage}>
      <Container fluid className="mt-5">
        {/* Profile Image Text */}
        <Row className="justify-content-center">
        <img
          src={ProfileImageText}
          alt="Profile"
          className={styles.profileImageText}
        />
        </Row>
        <Row>
          <Col md={6}>
            {/* Display any errors */}
            {errors.non_field_errors && (
              <Alert variant="danger">{errors.non_field_errors}</Alert>
            )}
            {/* Profile Update Form */}
            <Form onSubmit={handleProfileUpdate}>
              <Form.Group controlId="profile_image">
                {imagePreview && (
                  <Image
                    src={imagePreview}
                    roundedCircle
                    width={100}
                    height={100}
                    className="mt-2 mb-2"
                  />
                )}
                {errors.profile_image && (
                  <div className="text-danger">{errors.profile_image}</div>
                )}
                <Form.Control
                  type="file"
                  name="profile_image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Form.Group>
              <Form.Group controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={profileData.name || ""}
                  onChange={handleProfileChange}
                />
                {errors.name && (
                  <div className="text-danger">{errors.name}</div>
                )}
              </Form.Group>
              <Form.Group controlId="surname">
                <Form.Label>Surname</Form.Label>
                <Form.Control
                  type="text"
                  name="surname"
                  value={profileData.surname || ""}
                  onChange={handleProfileChange}
                />
                {errors.surname && (
                  <div className="text-danger">{errors.surname}</div>
                )}
              </Form.Group>
              <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={profileData.email || ""}
                  onChange={handleProfileChange}
                />
                {errors.email && (
                  <div className="text-danger">{errors.email}</div>
                )}
              </Form.Group>
              <Form.Group controlId="phone_number">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  name="phone_number"
                  value={profileData.phone_number || ""}
                  onChange={handleProfileChange}
                />
                {errors.phone_number && (
                  <div className="text-danger">{errors.phone_number}</div>
                )}
              </Form.Group>
              <Button variant="primary" type="submit" className="mt-3">
                Update Profile
              </Button>
            </Form>
          </Col>
          <Col md={6}>
            {/* Change Password Form */}
            <h3 className="mt-4">Change Password</h3>
            {errors.old_password && (
              <Alert variant="danger">{errors.old_password}</Alert>
            )}
            <Form onSubmit={handleChangePassword}>
              <Form.Group controlId="old_password">
                <Form.Label>Old Password</Form.Label>
                <Form.Control
                  type="password"
                  name="old_password"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                />
              </Form.Group>
              <Form.Group controlId="new_password">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="mt-3">
                Change Password
              </Button>
            </Form>
            {/* Delete Account Button */}
            <h3 className="mt-4 text-danger">Delete Account</h3>
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
              className="mt-2"
            >
              Delete Account
            </Button>
          </Col>
        </Row>
        {/* Modal for Account Deletion Confirmation */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Account Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleDeleteAccount}>
              {errors.password && (
                <Alert variant="danger">{errors.password}</Alert>
              )}
              <Form.Group controlId="delete_password">
                <Form.Label>Enter your password to confirm</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
              </Form.Group>
              <div className="mt-3">
                <Button variant="danger" type="submit">
                  Delete Account
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteModal(false)}
                  className="ml-2"
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
}

export default Profile;

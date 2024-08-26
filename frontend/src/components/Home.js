// import React from "react";
// import styles from "../styles/Home.module.css";
// import backgroundImage from "../assets/home-bg.png";
// import Menu from "../components/Menu";

// const Home = () => {

//     return (
//         <div
//             className={styles.homeContainer}
//             style={{ backgroundImage: `url(${backgroundImage})` }}
//         >
//             <Menu />
//         </div>
//     );
// };

// export default Home;

import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../styles/Home.module.css";
import backgroundImage from "../assets/home-bg.png";
import headerImage from "../assets/header-bg.png";
import Menu from "../components/Menu";

const Home = () => {
  return (
    <div
      className={styles.homeContainer}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <Container className={styles.contentContainer}>
        <Row className="align-items-center mb-4">
          <Col xs={12} md={4} className="text-center">
            <img
              src={headerImage}
              alt="Profile"
              className={styles.headerImage}
            />
          </Col>
          <Col xs={12} md={8} className="text-md-left text-center">
            <h1 className={styles.mainHeading}>A NORDIC COMPANY</h1>
            <p className={styles.subText}>IN THE COMPANY OF NORDIC BEAUTY</p>
          </Col>
        </Row>
        <Menu />
      </Container>
    </div>
  );
};

export default Home;

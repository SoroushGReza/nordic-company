import React from "react";
import styles from "../styles/Home.module.css";
import { useMediaQuery } from "react-responsive";
import backgroundImage from "../assets/home-bg.png"; // Importera bilden

const Home = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  return (
    <div
      className={styles.homeContainer}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className={styles.homeContent}>
        {isMobile
          ? "Välkommen till SussarTines hemsida!"
          : "Välkommen till SussarTines hemsida!"}
      </div>
    </div>
  );
};

export default Home;

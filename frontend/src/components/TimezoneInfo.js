import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import styles from "../styles/TimezoneInfo.module.css";

const TimezoneInfo = () => {
  const [userTimezone, setUserTimezone] = useState("");
  const [timeDifferenceText, setTimeDifferenceText] = useState("");
  const [isSameTimezone, setIsSameTimezone] = useState(false); // New state variable

  useEffect(() => {
    // Get users current timezone
    const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(userTZ);

    // Get current Stockholm time and the user timezone
    const stockholmTime = DateTime.now().setZone("Europe/Stockholm");
    const userTime = DateTime.now().setZone(userTZ);

    // Calculate offset in hours
    const diffInHours = (userTime.offset - stockholmTime.offset) / 60;

    // Determine if user is in same timezone
    if (diffInHours === 0) {
      setIsSameTimezone(true);
    } else {
      // Generate the time difference text
      const hoursDifference = Math.abs(diffInHours);
      const aheadOrBehind = diffInHours > 0 ? "ahead of" : "behind";
      const diffText = `is ${hoursDifference} hour(s) ${aheadOrBehind} Swedish time.`;
      setTimeDifferenceText(diffText);
    }
  }, []);

  if (isSameTimezone) {
    // Do not render anything if user iis in same timezone
    return null;
  }

  return (
    <div className={`${styles["timezone-info"]} text-center`}>
      <p>
        This application uses <strong>Swedish</strong> time. Your current
        timezone <strong>{userTimezone}</strong> {timeDifferenceText}
      </p>
    </div>
  );
};

export default TimezoneInfo;

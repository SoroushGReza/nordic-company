// Calculate total duration of selected services
export const calculateBookingDuration = (services) => {
  const totalMinutes = services.reduce((total, service) => {
    return total + parseWorktimeToMinutes(service.worktime);
  }, 0);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);

  return `${hours}h ${minutes > 0 ? `${minutes}min` : ""}`.trim();
};

// Function to convert "HH:MM:SS" to minutes
export const parseWorktimeToMinutes = (worktime) => {
  if (!worktime) return 0;
  const [hours, minutes, seconds] = worktime.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0) + (seconds || 0) / 60;
};

// Convert Worktime to Readable Format
export const convertWorktimeToReadableFormat = (worktime) => {
  const [hours, minutes] = worktime.split(":").map(Number);
  return `${hours > 0 ? `${hours}h` : ""} ${
    minutes > 0 ? `${minutes} minutes` : ""
  }`.trim();
};

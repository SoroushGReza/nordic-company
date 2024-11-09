// Calculate total price for chosen services
export const calculateTotalPrice = (services) => {
  return services.reduce((total, service) => total + parseFloat(service.price), 0);
};

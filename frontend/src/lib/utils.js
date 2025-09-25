export const formatDate = (dataString) => {
  return new Date(dataString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

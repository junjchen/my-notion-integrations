module.exports = () => {
  const dayOfWeek = new Date().getDay();
  return dayOfWeek !== 6 && dayOfWeek !== 0;
};

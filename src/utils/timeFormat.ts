export const isValidTimeFormat = (value: string) =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
export const toMinutes = (value: string) => {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
};
export const formatTime = (value: string) => value.slice(0, 5);
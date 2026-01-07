export const formatVND = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

  export function formatDateRangeFromNow(days = 2) {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + days);

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

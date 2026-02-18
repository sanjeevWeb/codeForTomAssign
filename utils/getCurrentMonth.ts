export function getCurrentMonth() {
  const today = new Date();

  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  return { start, end };
}

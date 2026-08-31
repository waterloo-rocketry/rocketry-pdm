export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const formatDate = (date?: string) => {
  if (!date) return "—";
  const parsed = date.includes("T") ? new Date(date) : new Date(`${date}T12:00:00`);
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: date.includes("T") ? "numeric" : undefined,
    minute: date.includes("T") ? "2-digit" : undefined
  }).format(parsed);
};

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";

export const formatDate = (date) => {
  if (!date) return null;
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "MMM d");
};

export const formatDateTime = (date) => {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy 'at' h:mm a");
};

export const isOverdue = (date) => {
  if (!date) return false;
  const d = typeof date === "string" ? parseISO(date) : date;
  return isPast(d) && !isToday(d);
};

export const PRIORITY_CONFIG = {
  LOW: { label: "Low", color: "text-slate-400", bg: "bg-slate-800", dot: "bg-slate-400" },
  MEDIUM: { label: "Medium", color: "text-blue-400", bg: "bg-blue-900/40", dot: "bg-blue-400" },
  HIGH: { label: "High", color: "text-orange-400", bg: "bg-orange-900/40", dot: "bg-orange-400" },
  URGENT: { label: "Urgent", color: "text-red-400", bg: "bg-red-900/40", dot: "bg-red-400" },
};

export const LABEL_COLORS = {
  design: "bg-purple-900/50 text-purple-300",
  dev: "bg-blue-900/50 text-blue-300",
  frontend: "bg-cyan-900/50 text-cyan-300",
  backend: "bg-green-900/50 text-green-300",
  bug: "bg-red-900/50 text-red-300",
  feature: "bg-indigo-900/50 text-indigo-300",
  content: "bg-yellow-900/50 text-yellow-300",
  research: "bg-teal-900/50 text-teal-300",
  ux: "bg-pink-900/50 text-pink-300",
  seo: "bg-orange-900/50 text-orange-300",
  brand: "bg-violet-900/50 text-violet-300",
};

export const getLabelColor = (label) =>
  LABEL_COLORS[label.toLowerCase()] || "bg-slate-800 text-slate-300";

export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

import { PRIORITY_CONFIG } from "../../utils/helpers";

const PriorityBadge = ({ priority, showLabel = false }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;

  return (
    <span className={`inline-flex items-center gap-1.5 ${showLabel ? `px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}` : ""}`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
      {showLabel && config.label}
    </span>
  );
};

export default PriorityBadge;

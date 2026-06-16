import { getLabelColor } from "../../utils/helpers";

const Badge = ({ label, onRemove }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getLabelColor(label)}`}
  >
    {label}
    {onRemove && (
      <button
        onClick={() => onRemove(label)}
        className="hover:opacity-70 transition-opacity ml-0.5"
      >
        ×
      </button>
    )}
  </span>
);

export default Badge;

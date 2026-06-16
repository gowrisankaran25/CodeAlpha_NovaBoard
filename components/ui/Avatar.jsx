import { getInitials } from "../../utils/helpers";

const sizeMap = {
  xs: "w-5 h-5 text-xs",
  sm: "w-7 h-7 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
  xl: "w-12 h-12 text-lg",
};

const Avatar = ({ user, size = "md", className = "" }) => {
  if (!user) return null;
  const sizeClass = sizeMap[size] || sizeMap.md;
  const initials = getInitials(user.name);

  return (
    <div
      title={user.name}
      className={`${sizeClass} relative rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center font-semibold text-white flex-shrink-0 ${className}`}
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}
      <span className="relative z-10">{initials}</span>
    </div>
  );
};

export default Avatar;

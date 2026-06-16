import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import PriorityBadge from "../ui/PriorityBadge";
import { formatDate, isOverdue } from "../../utils/helpers";

const TaskCard = ({ task, onClick, isDragging: forceDragging }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { columnId: task.columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const overdue = isOverdue(task.dueDate);
  const dueLabel = formatDate(task.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600
                 rounded-xl p-3.5 cursor-pointer select-none transition-all duration-150
                 hover:shadow-lg hover:shadow-black/20 active:scale-[0.98]"
    >
      {/* Priority + Labels */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <PriorityBadge priority={task.priority} />
        <div className="flex flex-wrap gap-1 justify-end">
          {task.labels?.slice(0, 2).map((label) => (
            <Badge key={label} label={label} />
          ))}
          {task.labels?.length > 2 && (
            <span className="text-xs text-slate-500">+{task.labels.length - 2}</span>
          )}
        </div>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-slate-100 leading-snug mb-3 line-clamp-2">
        {task.title}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        {/* Due date */}
        {dueLabel && (
          <span className={`inline-flex items-center gap-1 text-xs ${overdue ? "text-red-400" : "text-slate-500"}`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {dueLabel}
          </span>
        )}
        {!dueLabel && <span />}

        <div className="flex items-center gap-2">
          {/* Comments count */}
          {task._count?.comments > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {task._count.comments}
            </span>
          )}
          {/* Assignee */}
          {task.assignee && <Avatar user={task.assignee} size="xs" />}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

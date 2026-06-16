import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

const BoardColumn = ({ column, onTaskClick, onAddTask }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { columnId: column.id },
  });

  return (
    <div className="flex flex-col w-72 flex-shrink-0 glass-panel p-3">
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-4 mb-3 rounded-3xl bg-slate-950/80 border border-slate-800/70">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="text-sm font-semibold text-slate-300 tracking-wide">
            {column.name}
          </h3>
          <span className="text-xs font-medium text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded-md">
            {column.tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask?.(column.id)}
          className="p-1 rounded-md text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          title="Add task"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Tasks drop area */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-3 min-h-24 rounded-3xl p-3 transition-all duration-150 ${
          isOver ? "bg-indigo-900/20 border border-dashed border-indigo-600/50" : "bg-slate-900/70"
        }`}
      >
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>

        {column.tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-xs text-slate-700">Drop tasks here</p>
          </div>
        )}
      </div>

      {/* Quick add */}
      <button
        onClick={() => onAddTask?.(column.id)}
        className="mt-2 w-full py-2 rounded-full text-xs text-slate-300 hover:text-white hover:bg-indigo-600/20
                   transition-all duration-150 flex items-center justify-center gap-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add task
      </button>
    </div>
  );
};

export default BoardColumn;

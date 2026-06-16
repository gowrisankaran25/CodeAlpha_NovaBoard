import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";

/**
 * useDragAndDrop
 * Manages drag-and-drop state and provides handlers for the Kanban board.
 *
 * @param {Object} params
 * @param {Array}  params.columns        - Array of column objects (with .tasks)
 * @param {Function} params.onTaskMove   - Called with { taskId, columnId, order, sourceColumnId }
 * @param {Function} params.onDragStart  - Called with { taskId }
 * @param {Function} params.onDragEnd    - Called with { taskId }
 */
export const useDragAndDrop = ({ columns, onTaskMove, onDragStart: onDragStartCb, onDragEnd: onDragEndCb }) => {
  const [activeTask, setActiveTask] = useState(null);
  const [localColumns, setLocalColumns] = useState(columns);

  // Sync when columns prop changes
  if (JSON.stringify(localColumns) !== JSON.stringify(columns)) {
    setLocalColumns(columns);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findColumn = useCallback(
    (taskId) => localColumns.find((col) => col.tasks.some((t) => t.id === taskId)),
    [localColumns]
  );

  const handleDragStart = useCallback(
    (event) => {
      const { active } = event;
      const sourceCol = findColumn(active.id);
      const task = sourceCol?.tasks.find((t) => t.id === active.id);
      setActiveTask(task || null);
      onDragStartCb?.({ taskId: active.id });
    },
    [findColumn, onDragStartCb]
  );

  const handleDragOver = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const sourceCol = findColumn(active.id);
      const destColId = over.data?.current?.columnId || over.id;
      const destCol = localColumns.find((c) => c.id === destColId);

      if (!sourceCol || !destCol || sourceCol.id === destCol.id) return;

      setLocalColumns((cols) =>
        cols.map((col) => {
          if (col.id === sourceCol.id) {
            return { ...col, tasks: col.tasks.filter((t) => t.id !== active.id) };
          }
          if (col.id === destCol.id) {
            const task = sourceCol.tasks.find((t) => t.id === active.id);
            return { ...col, tasks: [...col.tasks, task] };
          }
          return col;
        })
      );
    },
    [findColumn, localColumns]
  );

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      setActiveTask(null);
      onDragEndCb?.({ taskId: active.id });

      if (!over) return;

      const sourceCol = findColumn(active.id);
      const destColId = over.data?.current?.columnId || over.id;
      const destCol = localColumns.find((c) => c.id === destColId);

      if (!sourceCol || !destCol) return;

      const sourceIndex = sourceCol.tasks.findIndex((t) => t.id === active.id);
      const destIndex = destCol.tasks.findIndex((t) => t.id === over.id);

      const newOrder = destIndex === -1 ? destCol.tasks.length : destIndex;

      onTaskMove?.({
        taskId: active.id,
        columnId: destCol.id,
        order: newOrder,
        sourceColumnId: sourceCol.id,
      });
    },
    [findColumn, localColumns, onTaskMove, onDragEndCb]
  );

  return {
    sensors,
    activeTask,
    localColumns,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};

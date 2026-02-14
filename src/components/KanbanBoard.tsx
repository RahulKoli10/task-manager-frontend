"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "@/lib/axios";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
}

interface ColumnState {
  tasks: Task[];
  page: number;
  totalPages: number;
  total: number;
  sort: string;
  search: string;
}

interface Props {
  columns: Record<string, ColumnState>;
  fetchColumn: (
    status: string,
    page?: number,
    sort?: string,
    search?: string
  ) => void;
}

const columnKeys = ["todo", "in-progress", "done"];

export default function KanbanBoard({ columns, fetchColumn }: Props) {
  const { user } = useAuth();
  const [searchTimeout, setSearchTimeout] = useState<any>(null);

  /* ================= DRAG ================= */

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination, source } = result;

    try {
      await axios.put(`/tasks/${draggableId}`, {
        status: destination.droppableId,
      });

      // Refresh both columns properly
      fetchColumn(source.droppableId, 1);
      fetchColumn(destination.droppableId, 1);
    } catch (error) {
      console.error("Drag failed", error);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (taskId: string, status: string) => {
    try {
      await axios.delete(`/tasks/${taskId}`);

      // Refresh that specific column
      fetchColumn(status, 1);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid md:grid-cols-3 gap-8">
        {columnKeys.map((column) => {
          const col = columns[column];

          return (
            <Droppable key={column} droppableId={column}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-white rounded-3xl shadow-lg p-6 flex flex-col min-h-[550px]"
                >
                  {/* HEADER */}
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="font-bold text-lg capitalize text-slate-700">
                        {column.replace("-", " ")}
                        <span className="ml-2 text-xs text-gray-400">
                          ({col.total})
                        </span>
                      </h2>

                      <select
                        value={col.sort}
                        onChange={(e) =>
                          fetchColumn(column, 1, e.target.value, col.search)
                        }
                        className="text-xs border rounded-lg px-2 py-1"
                      >
                        <option value="desc">Newest</option>
                        <option value="asc">Oldest</option>
                      </select>
                    </div>

                    {/* SEARCH */}
                    <input
                      placeholder="Search tasks..."
                      defaultValue={col.search}
                      onChange={(e) => {
                        if (searchTimeout) clearTimeout(searchTimeout);

                        const timeout = setTimeout(() => {
                          fetchColumn(
                            column,
                            1,
                            col.sort,
                            e.target.value
                          );
                        }, 400);

                        setSearchTimeout(timeout);
                      }}
                      className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {/* TASKS */}
                  <div className="flex-1">
                    {col.tasks.length === 0 && (
                      <div className="text-gray-400 text-sm text-center mt-10">
                        No tasks here
                      </div>
                    )}

                    {col.tasks.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-slate-50 hover:bg-slate-100 transition p-4 mb-4 rounded-2xl shadow-sm border"
                          >
                            <h3 className="font-semibold text-slate-800">
                              {task.title}
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                              {task.description}
                            </p>

                            {/* DELETE BUTTON (ADMIN + MANAGER ONLY) */}
                            {(user?.role === "admin" ||
                              user?.role === "manager") && (
                              <div className="flex justify-end mt-3">
                                <button
                                  onClick={() =>
                                    handleDelete(task._id, column)
                                  }
                                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>

                  {provided.placeholder}

                  {/* PAGINATION */}
                  <div className="flex justify-between items-center mt-4 text-sm pt-4 border-t">
                    <button
                      disabled={col.page === 1}
                      onClick={() =>
                        fetchColumn(
                          column,
                          col.page - 1,
                          col.sort,
                          col.search
                        )
                      }
                      className="px-4 py-1 rounded-lg bg-gray-100 disabled:opacity-40"
                    >
                      Prev
                    </button>

                    <span className="text-gray-500">
                      {col.page} / {col.totalPages}
                    </span>

                    <button
                      disabled={col.page === col.totalPages}
                      onClick={() =>
                        fetchColumn(
                          column,
                          col.page + 1,
                          col.sort,
                          col.search
                        )
                      }
                      className="px-4 py-1 rounded-lg bg-gray-100 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}

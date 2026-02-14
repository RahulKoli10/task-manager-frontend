"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import KanbanBoard from "@/components/KanbanBoard";
import CreateTaskForm from "@/components/TaskForm";
import useSocket from "@/hook/useSocket";

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

const initialColumn = {
  tasks: [],
  page: 1,
  totalPages: 1,
  total: 0,
  sort: "desc",
  search: "",
};

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const socket = useSocket();

  const [columns, setColumns] = useState<Record<string, ColumnState>>({
    todo: { ...initialColumn },
    "in-progress": { ...initialColumn },
    done: { ...initialColumn },
  });

  const fetchColumn = async (
    status: string,
    page = 1,
    sort = "desc",
    search = ""
  ) => {
    try {
      const res = await axios.get("/tasks", {
        params: { status, page, limit: 5, sort, search },
      });

      setColumns((prev) => ({
        ...prev,
        [status]: {
          ...prev[status],
          tasks: res.data.tasks,
          page: res.data.page,
          totalPages: res.data.totalPages,
          total: res.data.total,
          sort,
          search,
        },
      }));
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  /* Initial Load */
  useEffect(() => {
    if (!loading) {
      ["todo", "in-progress", "done"].forEach((status) =>
        fetchColumn(status)
      );
    }
  }, [loading]);

  /* Real-time */
  useEffect(() => {
    if (!socket) return;

    const refreshAll = () => {
      Object.keys(columns).forEach((status) => {
        const col = columns[status];
        fetchColumn(status, 1, col.sort, col.search);
      });
    };

    socket.on("taskCreated", refreshAll);
    socket.on("taskUpdated", refreshAll);
    socket.on("taskDeleted", refreshAll);

    return () => {
      socket.off("taskCreated", refreshAll);
      socket.off("taskUpdated", refreshAll);
      socket.off("taskDeleted", refreshAll);
    };
  }, [socket, columns]);

  const handleLogout = async () => {
    await axios.post("/auth/logout");
    logout();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
            Task Board
          </h1>

          <div className="flex items-center gap-4">
            <div className="bg-white px-5 py-2 rounded-xl shadow text-sm">
              {user?.name} <span className="text-gray-400">({user?.role})</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl transition"
            >
              Logout
            </button>
          </div>
        </div>

        <CreateTaskForm refreshTasks={() => {
          Object.keys(columns).forEach((status) =>
            fetchColumn(status)
          );
        }} />

        <KanbanBoard columns={columns} fetchColumn={fetchColumn} />
      </div>
    </ProtectedRoute>
  );
}

"use client";

import { useState } from "react";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

interface Props {
  refreshTasks: () => void;
}

export default function CreateTaskForm({ refreshTasks }: Props) {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user?.role === "user") return null;

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post("/tasks", {
        title,
        description,
      });

      setTitle("");
      setDescription("");
      refreshTasks();
    } catch (err) {
      setError("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">
        Create New Task
      </h3>

      {error && (
        <p className="text-red-500 text-sm mb-3">{error}</p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <input
          className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button
        onClick={handleCreate}
        disabled={loading}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Task"}
      </button>
    </div>
  );
}

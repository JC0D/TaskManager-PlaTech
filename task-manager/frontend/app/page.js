"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [statusForm, setStatusForm] = useState("pending");
  const [editTaskId, setEditTaskId] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);

  // Fetch active tasks
  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:5000/api/tasks");
    setTasks(res.data);
  };

  // Fetch deleted tasks
  const fetchDeletedTasks = async () => {
    const res = await axios.get("http://localhost:5000/api/deleted-tasks");
    setDeletedTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add new task
  const addTask = async () => {
    if (!title.trim()) return;
    await axios.post("http://localhost:5000/api/tasks", {
      title,
      description,
      status: "pending",
    });
    setTitle("");
    setDescription("");
    fetchTasks();
  };

  // Delete task (soft delete)
  const deleteTask = async (id) => {
    await axios.delete(`http://localhost:5000/api/tasks/${id}`);
    fetchTasks();
  };

  // Restore task
  const restoreTask = async (id) => {
    await axios.post(`http://localhost:5000/api/deleted-tasks/${id}/restore`);
    fetchDeletedTasks();
    fetchTasks();
  };

  // Update task status
  const updateTaskStatus = async (id) => {
    await axios.put(`http://localhost:5000/api/tasks/${id}`, {
      status: statusForm,
    });
    setEditTaskId(null);
    fetchTasks();
  };

  const startEdit = (task) => {
    setEditTaskId(task._id);
    setStatusForm(task.status);
  };

  const cancelEdit = () => {
    setEditTaskId(null);
    setStatusForm("pending");
  };

  return (
    <div className="min-h-screen bg-green-100 p-6 text-black">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Task Manager</h1>

        {/* Add Task */}
        <div className="bg-white p-5 rounded-xl shadow-lg mb-6">
          <input
            className="w-full border p-3 mb-3 rounded-lg"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full border p-3 mb-3 rounded-lg"
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            onClick={addTask}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg"
          >
            ➕ Add Task
          </button>
        </div>

        {/* Toggle Deleted / Active */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => {
              if (!showDeleted) fetchDeletedTasks();
              setShowDeleted(!showDeleted);
            }}
            className="px-5 py-2 rounded-lg shadow-md bg-gray-200 hover:bg-gray-300"
          >
            {showDeleted ? "⬅ Back to Active Tasks" : "🗑 View Deleted Tasks"}
          </button>
        </div>

        {/* Task List */}
        <div className="grid gap-4">
          {showDeleted ? (
            deletedTasks.length === 0 ? (
              <p className="text-center text-gray-600">
                No deleted tasks found.
              </p>
            ) : (
              deletedTasks.map((task) => (
                <div
                  key={task._id}
                  className="shadow-lg rounded-xl p-5 bg-red-100 border-l-4 border-red-500"
                >
                  <h2 className="text-lg font-bold text-red-800">{task.title}</h2>
                  <p className="text-red-700">{task.description}</p>
                  <span className="text-xs text-gray-600 block mb-3">
                    Deleted at: {new Date(task.deletedAt).toLocaleString()}
                  </span>
                  <button
                    onClick={() => restoreTask(task._id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    ♻ Restore
                  </button>
                </div>
              ))
            )
          ) : (
            tasks.map((task) => (
              <div
                key={task._id}
                className={`shadow-lg rounded-xl p-5 flex justify-between items-start ${
                  task.status === "completed" ? "bg-green-200" : "bg-white"
                }`}
              >
                {editTaskId === task._id ? (
                  <div className="flex flex-col gap-3 w-full">
                    <select
                      className="border rounded-lg p-2"
                      value={statusForm}
                      onChange={(e) => setStatusForm(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateTaskStatus(task._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                      >
                        💾 Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                      >
                        ✖ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between w-full items-center">
                    <div>
                      <h2
                        className={`text-xl font-bold ${
                          task.status === "completed"
                            ? "text-gray-600"
                            : "text-black"
                        }`}
                      >
                        {task.title}
                      </h2>
                      <p
                        className={`mt-1 ${
                          task.status === "completed"
                            ? "text-gray-500"
                            : "text-gray-700"
                        }`}
                      >
                        {task.description}
                      </p>

                      {/* Status Badge */}
                      <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                          task.status === "pending"
                            ? "bg-orange-200 text-orange-800"
                            : task.status === "in-progress"
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-green-700 text-white"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    {task.status !== "completed" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(task)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg"
                        >
                          ✏ Update
                        </button>
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

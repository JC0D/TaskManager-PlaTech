import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";

// Models
import Task from "./models/Task.js";
import DeletedTask from "./models/DeletedTask.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/taskmanager")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

/* ========================
   ACTIVE TASKS ROUTES
   ======================== */

// Get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a task
app.post("/api/tasks", async (req, res) => {
  try {
    const newTask = new Task(req.body);
    await newTask.save();
    res.json(newTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a task status
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Soft delete (move to DeletedTask)
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const deletedTask = new DeletedTask({
      title: task.title,
      description: task.description,
      status: task.status,
    });
    await deletedTask.save();

    await task.deleteOne();

    res.json({ message: "Task moved to deleted list" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ========================
   DELETED TASKS ROUTES
   ======================== */

// Get deleted tasks
app.get("/api/deleted-tasks", async (req, res) => {
  try {
    const deletedTasks = await DeletedTask.find();
    res.json(deletedTasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restore deleted task
app.post("/api/deleted-tasks/:id/restore", async (req, res) => {
  try {
    const deletedTask = await DeletedTask.findById(req.params.id);
    if (!deletedTask)
      return res.status(404).json({ error: "Deleted task not found" });

    const restoredTask = new Task({
      title: deletedTask.title,
      description: deletedTask.description,
      status: deletedTask.status,
    });
    await restoredTask.save();

    await deletedTask.deleteOne();

    res.json({ message: "Task restored successfully", task: restoredTask });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Permanently delete (optional)
app.delete("/api/deleted-tasks/:id", async (req, res) => {
  try {
    await DeletedTask.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted task permanently removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

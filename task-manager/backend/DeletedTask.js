import mongoose from "mongoose";

const deletedTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    deletedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("DeletedTask", deletedTaskSchema);

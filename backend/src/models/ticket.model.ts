import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 5000 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 10,
    },
    description: { type: String, required: true, trim: true, maxlength: 10000 },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true },
);
schema.index({ title: "text" });

export const Ticket =
  mongoose.models.Ticket ?? mongoose.model("Ticket", schema);

const mongoose = require("mongoose");

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: "text",
    },

    description: {
      type: String,
      required: true,
    },

    budget: {
      type: Number,
      required: true,
      min: 0,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "assigned"],
      default: "open",
      index: true,
    },

    assignedBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gig", gigSchema);

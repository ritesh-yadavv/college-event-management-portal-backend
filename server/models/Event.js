const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: [
        "Technical",
        "Academic",
        "Workshop",
        "Seminar",
        "Webinar",
        "Training",
        "Skill Development",
        "Research",
        "Innovation",
        "Hackathon",
        "Placement",
        "Career Guidance",
        "Guest Lecture",
        "Competition",
        "Quiz",
        "Coding Contest",
        "Debate",
        "Presentation",
        "Cultural",
        "Fest",
        "Freshers Party",
        "Farewell Party",
        "DJ Night",
        "Talent Show",
        "Open Mic",
        "Dance",
        "Music",
        "Drama",
        "Fashion Show",
        "Club Activity",
        "Literary",
        "Photography",
        "Art & Craft",
        "Sports",
        "Tournament",
        "E-Sports",
      ],
      required: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    image: {
      type: String,
      default: ""
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
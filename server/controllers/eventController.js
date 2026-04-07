const Event = require("../models/Event");
const Registration = require("../models/Registration");
const jwt = require("jsonwebtoken");

const getTokenUserId = async (req) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    return null;
  }
};

const getAllEvents = async (req, res) => {
  try {
    const { search = "", category = "" } = req.query;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    const events = await Event.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const registrations = await Registration.find({
      event: { $in: events.map((event) => event._id) },
    })
      .populate("student", "name email image phone course year")
      .select("student event");

    const loggedInUserId = await getTokenUserId(req);

    const eventsWithParticipants = events.map((event) => {
      const eventRegistrations = registrations.filter(
        (reg) => reg.event.toString() === event._id.toString()
      );

      const participants = eventRegistrations.map((reg) => reg.student);

      const isRegistered = participants.some(
        (student) => student?._id?.toString() === loggedInUserId
      );

      return {
        ...event.toObject(),
        participants,
        totalRegistered: participants.length,
        isRegistered,
      };
    });

    return res.status(200).json(eventsWithParticipants);
  } catch (error) {
    console.error("GET ALL EVENTS ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch events" });
  }
};

const getSingleEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const registrations = await Registration.find({ event: event._id })
      .populate("student", "name email image phone course year")
      .select("student");

    const participants = registrations.map((reg) => reg.student);

    return res.status(200).json({
      ...event.toObject(),
      participants,
      totalRegistered: participants.length,
    });
  } catch (error) {
    console.error("GET SINGLE EVENT ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch event" });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, category, capacity } =
      req.body;

    if (
      !title ||
      !description ||
      !date ||
      !time ||
      !location ||
      !category ||
      !capacity
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      category,
      capacity: Number(capacity),
      image: req.file ? `/uploads/${req.file.filename}` : "",
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);
    return res.status(500).json({
      message:
        error?.errors?.category?.message ||
        error?.errors?.date?.message ||
        error?.errors?.capacity?.message ||
        error?.message ||
        "Failed to create event",
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    console.log("UPDATE EVENT BODY:", req.body);
    console.log("UPDATE EVENT FILE:", req.file);

    const existingEvent = await Event.findById(req.params.id);

    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      time: req.body.time,
      location: req.body.location,
      category: req.body.category,
      capacity:
        req.body.capacity !== undefined && req.body.capacity !== ""
          ? Number(req.body.capacity)
          : undefined,
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined || updateData[key] === "") {
        delete updateData[key];
      }
    });

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).populate("createdBy", "name email");

    return res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);
    return res.status(500).json({
      message:
        error?.errors?.category?.message ||
        error?.errors?.date?.message ||
        error?.errors?.capacity?.message ||
        error?.message ||
        "Failed to update event",
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();

    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);
    return res.status(500).json({ message: "Failed to delete event" });
  }
};

module.exports = {
  getAllEvents,
  getSingleEvent,
  createEvent,
  updateEvent,
  deleteEvent,
};
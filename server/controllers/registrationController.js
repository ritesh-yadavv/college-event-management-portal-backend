const Registration = require("../models/Registration");
const Event = require("../models/Event");

const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const studentId = req.user._id;

    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const existingRegistration = await Registration.findOne({
      student: studentId,
      event: eventId
    });

    if (existingRegistration) {
      return res.status(400).json({ message: "You are already registered" });
    }

    const totalRegistrations = await Registration.countDocuments({ event: eventId });

    if (totalRegistrations >= event.capacity) {
      return res.status(400).json({ message: "Event capacity full" });
    }

    const registration = await Registration.create({
      student: studentId,
      event: eventId
    });

    return res.status(201).json({
      message: "Registered successfully",
      registration
    });
  } catch (error) {
    console.error("REGISTER FOR EVENT ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).json({ message: "You are already registered" });
    }

    return res.status(500).json({ message: "Failed to register for event" });
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate({
        path: "event",
        populate: {
          path: "createdBy",
          select: "name email"
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(registrations);
  } catch (error) {
    console.error("GET MY REGISTRATIONS ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch registrations" });
  }
};

const getAllRegistrationsForAdmin = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("student", "name email phone course year image")
      .populate("event", "title description date time location category image")
      .sort({ createdAt: -1 });

    return res.status(200).json(registrations);
  } catch (error) {
    console.error("GET ALL REGISTRATIONS ADMIN ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch all registrations" });
  }
};

const cancelRegistrationByAdmin = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId)
      .populate("student", "name email")
      .populate("event", "title");

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    await Registration.findByIdAndDelete(registrationId);

    return res.status(200).json({
      message: "Registration cancelled successfully by admin",
      cancelledRegistration: {
        _id: registration._id,
        studentName: registration.student?.name || "Student",
        studentEmail: registration.student?.email || "",
        eventTitle: registration.event?.title || "Event"
      }
    });
  } catch (error) {
    console.error("ADMIN CANCEL REGISTRATION ERROR:", error);
    return res.status(500).json({ message: "Failed to cancel registration" });
  }
};

module.exports = {
  registerForEvent,
  getMyRegistrations,
  getAllRegistrationsForAdmin,
  cancelRegistrationByAdmin
};
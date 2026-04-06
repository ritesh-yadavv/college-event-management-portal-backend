const User = require("../models/User");
const Event = require("../models/Event");
const Registration = require("../models/Registration");

const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();

    return res.json({
      totalUsers,
      totalStudents,
      totalAdmins,
      totalEvents,
      totalRegistrations
    });
  } catch (error) {
    console.error("GET ADMIN DASHBOARD ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("student", "name email phone course year image")
      .populate("event", "title description category date location time image")
      .sort({ createdAt: -1 });

    return res.json(registrations);
  } catch (error) {
    console.error("GET ALL REGISTRATIONS ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch registrations" });
  }
};

const deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    await registration.deleteOne();

    return res.json({ message: "Registration deleted successfully" });
  } catch (error) {
    console.error("DELETE REGISTRATION ERROR:", error);
    return res.status(500).json({ message: "Failed to delete registration" });
  }
};

module.exports = {
  getAdminDashboard,
  getAllRegistrations,
  deleteRegistration
};
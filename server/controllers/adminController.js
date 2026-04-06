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

    return res.status(200).json({
      totalUsers,
      totalStudents,
      totalAdmins,
      totalEvents,
      totalRegistrations,
    });
  } catch (error) {
    console.error("GET ADMIN DASHBOARD ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("student", "name email phone course year image role")
      .populate("event", "title description category date location time image")
      .sort({ createdAt: -1 });

    return res.status(200).json(registrations);
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

    return res.status(200).json({
      message: "Registration deleted successfully",
    });
  } catch (error) {
    console.error("DELETE REGISTRATION ERROR:", error);
    return res.status(500).json({ message: "Failed to delete registration" });
  }
};

/*
  OPTIONAL:
  Agar admin dashboard se student delete bhi karna hai,
  to ye API add kar lo. Isse totalStudents/totalUsers sahi ho jayenge
  after frontend refreshDashboard().
*/
const deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.role !== "student") {
      return res.status(400).json({ message: "Only student can be deleted" });
    }

    // student ki sab registrations bhi delete hongi
    await Registration.deleteMany({ student: student._id });

    await student.deleteOne();

    return res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("DELETE STUDENT ERROR:", error);
    return res.status(500).json({ message: "Failed to delete student" });
  }
};

module.exports = {
  getAdminDashboard,
  getAllRegistrations,
  deleteRegistration,
  deleteStudent,
};
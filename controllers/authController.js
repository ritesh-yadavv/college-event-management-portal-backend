const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || "",
  course: user.course || "",
  year: user.year || "",
  image: user.image || ""
});

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, course, year } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "student",
      phone: phone || "",
      course: course || "",
      year: year || "",
      image: req.file ? `/uploads/${req.file.filename}` : ""
    });

    return res.status(201).json({
      message: "Registration successful",
      token: generateToken(user),
      user: buildUserResponse(user)
    });
  } catch (error) {
    console.error("REGISTER USER ERROR:", error);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const matched = await bcrypt.compare(password, user.password);

    if (!matched) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      message: "Login successful",
      token: generateToken(user),
      user: buildUserResponse(user)
    });
  } catch (error) {
    console.error("LOGIN USER ERROR:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      user: buildUserResponse(req.user)
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, phone, course, year, password } = req.body;

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (course !== undefined) user.course = course;
    if (year !== undefined) user.year = year;

    if (req.file) {
      user.image = `/uploads/${req.file.filename}`;
    }

    if (password && password.trim()) {
      user.password = await bcrypt.hash(password.trim(), 10);
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: buildUserResponse(user)
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile
};
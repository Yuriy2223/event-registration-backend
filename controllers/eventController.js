const Event = require("../models/Event");
const Participant = require("../models/Participant");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const getEvents = async (req, res) => {
  const {
    sortField = "title",
    sortOrder = "asc",
    page = 1,
    limit = 8,
  } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  try {
    const totalEvents = await Event.countDocuments();

    const skip = (pageNumber - 1) * limitNumber;

    const events = await Event.find()
      .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limitNumber);

    res.json({
      events,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalEvents / limitNumber),
      totalEvents,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Створити нову подію
const createEvent = async (req, res) => {
  const { title, description, eventDate, organizer } = req.body;

  if (!title || !description || !eventDate || !organizer) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const event = new Event({ title, description, eventDate, organizer });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Зареєструвати учасника на подію
const registerParticipant = async (req, res) => {
  const { fullName, email, dob, referral } = req.body;
  const eventId = req.params.eventId;

  if (!fullName || !email || !dob) {
    return res
      .status(400)
      .json({ message: "Full name, email, and date of birth are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  if (new Date(dob) > new Date()) {
    return res
      .status(400)
      .json({ message: "Date of birth cannot be in the future." });
  }

  try {
    const participant = new Participant({
      fullName,
      email,
      dob,
      referral,
      eventId,
    });
    await participant.save();
    res.status(201).json(participant);
  } catch (err) {
    console.error("Error registering participant:", err);
    res.status(500).json({ message: err.message });
  }
};

// Отримати список учасників
const getParticipants = async (req, res) => {
  const eventId = req.params.eventId;
  const { search } = req.query;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: "Invalid eventId format" });
  }

  try {
    const query = { eventId: new ObjectId(eventId) };

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ fullName: searchRegex }, { email: searchRegex }];
    }

    const participants = await Participant.find(query);
    res.json(participants);
  } catch (err) {
    console.error("Error fetching participants:", err);
    res.status(500).json({ message: err.message });
  }
};

// Отримати подію за ID
const getEventById = async (req, res) => {
  const eventId = req.params.eventId;
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getEvents,
  createEvent,
  registerParticipant,
  getParticipants,
  getEventById,
};

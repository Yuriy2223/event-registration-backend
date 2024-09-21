const Event = require('../models/Event');
const Participant = require('../models/Participant');

// Отримати всі події
const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Створити нову подію
const createEvent = async (req, res) => {
  const { title, description, eventDate, organizer } = req.body;
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
  const { fullName, email, dob, referral, eventId } = req.body;
  try {
    const participant = new Participant({ fullName, email, dob, referral, eventId });
    await participant.save();
    res.status(201).json(participant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Отримати список учасників
const getParticipants = async (req, res) => {
  try {
    const participants = await Participant.find({ eventId: req.params.eventId });
    res.json(participants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getEvents, createEvent, registerParticipant, getParticipants };

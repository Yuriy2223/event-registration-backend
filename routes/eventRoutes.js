const express = require('express');
const router = express.Router();
const {
  getEvents,
  createEvent,
  registerParticipant,
  getParticipants
} = require('../controllers/eventController');

// Отримати всі події
router.get('/', getEvents);

// Створити нову подію
router.post('/', createEvent);

// Зареєструвати учасника
router.post('/register', registerParticipant);

// Отримати всіх учасників для події
router.get('/:eventId/participants', getParticipants);

module.exports = router;

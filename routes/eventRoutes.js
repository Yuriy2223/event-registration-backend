const express = require('express');
const router = express.Router();
const {
  getEvents,
  createEvent,
  registerParticipant,
  getParticipants,
  getEventById,
} = require('../controllers/eventController');

// Отримати всі події
router.get('/', getEvents);

// Створити нову подію
router.post('/', createEvent);

// Зареєструвати учасника
router.post('/:eventId/register', registerParticipant);

// Отримати всіх учасників для події
router.get('/:eventId/participants', getParticipants);

// Отримати подію за ID
router.get('/:eventId', getEventById);

module.exports = router;

const axios = require("axios");
const Event = require("./models/Event");
const mongoose = require("mongoose");

const fetchEvents = async () => {
  try {
    const response = await axios.get("URL_API");
    // const response = await axios.get(
    //   "https://app.ticketmaster.com/discovery/v2/events.json?apikey=YOUR_API_KEY"
    // );
    const events = response.data;

    for (const event of events) {
      const newEvent = new Event({
        title: event.title,
        description: event.description || "No description available",
        eventDate: event.date,
        organizer: event.organizer,
      });

      await newEvent.save();
    }
    console.log("Events fetched and stored successfully.");
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};

fetchEvents();

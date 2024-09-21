const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const eventRoutes = require("./routes/eventRoutes");

// Ініціалізація
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Підключення до бази даних
connectDB();

// Мідлвери
// app.use(cors());
app.use(
  cors({
    origin: "https://event-registration-frontend-dun.vercel.app", // Дозволити запити з цього домену
  })
);
app.use(express.json());

// Маршрути
app.use("/api/events", eventRoutes);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

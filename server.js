import 'dotenv/config';

import express from 'express';
import ApiRoutes from './Route/Api.js';
import Database from './Database/db.js'
import { connectCloudinary } from './Config/cloudinary.js'
import reservationAutoRelease from './utils/reservationAutoRelease.js';

const app = express();
const PORT = process.env.PORT || 5000;
connectCloudinary()
ApiRoutes(app);
Database();
reservationAutoRelease.startReservationAutoRelease();
app.listen(PORT, (req, res) => {
    console.log(`Server is running on http://localhost:${PORT}`);
})

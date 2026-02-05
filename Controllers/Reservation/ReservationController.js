import Reservation from '../../Models/ReservationModel.js';
import Table from '../../Models/TableModel.js';

// Get available tables for a specific date, time, and guest count
export const getAvailableTables = async (req, res) => {
    try {
        const { date, startTime, endTime, guests } = req.query;

        if (!date || !startTime || !endTime || !guests) {
            return res.status(400).json({ message: "Missing required parameters" });
        }

        const guestCount = parseInt(guests);

        // 1. Find tables with sufficient capacity
        const candidateTables = await Table.find({
            capacity: { $gte: guestCount },
            isActive: true
        });

        if (candidateTables.length === 0) {
            return res.status(200).json([]);
        }

        // 2. Check for overlapping reservations
        // Overlap if: (reqStart < resEnd) && (reqEnd > resStart)
        // We need to compare times. Since date is same string, we can compare HH:mm strings directly or convert to minutes.
        // Assuming strictly formatted HH:mm.

        const conflictingReservations = await Reservation.find({
            date: date,
            status: { $in: ['confirmed', 'pending'] },
            table: { $in: candidateTables.map(t => t._id) },
            $or: [
                {
                    $and: [
                        { startTime: { $lt: endTime } },
                        { endTime: { $gt: startTime } }
                    ]
                }
            ]
        });

        const reservedTableIds = conflictingReservations.map(r => r.table.toString());

        const availableTables = candidateTables.filter(t => !reservedTableIds.includes(t._id.toString()));

        res.status(200).json(availableTables);

    } catch (error) {
        console.error("Error fetching available tables:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Create a new reservation
export const createReservation = async (req, res) => {
    try {
        const { tableId, date, startTime, endTime, guests, guestDetails } = req.body;
        // guestDetails: { name, email, phone, specialRequest }

        if (!tableId || !date || !startTime || !endTime || !guests || !guestDetails) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate table existence and capacity
        const table = await Table.findById(tableId);
        if (!table) {
            return res.status(404).json({ message: "Table not found" });
        }
        if (table.capacity < guests) {
            return res.status(400).json({ message: "Table capacity insufficient" });
        }

        // Check for double booking (Overlap check)
        const conflict = await Reservation.findOne({
            table: tableId,
            date: date,
            status: { $in: ['confirmed', 'pending'] },
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
        });

        if (conflict) {
            return res.status(409).json({ message: "Table already reserved for this time slot" });
        }

        const newReservation = new Reservation({
            table: tableId,
            date,
            startTime,
            endTime,
            guests,
            guestDetails,
            status: 'confirmed'
        });

        await newReservation.save();

        res.status(201).json({
            message: "Reservation confirmed successfully",
            reservation: newReservation
        });

    } catch (error) {
        console.error("Error creating reservation:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get reservations (My Reservations)
export const getReservations = async (req, res) => {
    try {
        const { email, phone } = req.query;

        if (!email && !phone) {
            return res.status(400).json({ message: "Please provide email or phone number" });
        }

        const query = {};
        if (email) query['guestDetails.email'] = email;
        if (phone) query['guestDetails.phone'] = phone;

        const reservations = await Reservation.find(query)
            .populate('table', 'tableNumber capacity')
            .sort({ date: -1, startTime: -1 });

        res.status(200).json(reservations);

    } catch (error) {
        console.error("Error fetching reservations:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all reservations (Admin)
export const getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate('table', 'tableNumber capacity type')
            .sort({ date: -1, startTime: -1 });

        res.status(200).json(reservations);

    } catch (error) {
        console.error("Error fetching all reservations:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Update reservation status (Admin)
export const updateReservationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const reservation = await Reservation.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        res.status(200).json({
            message: "Reservation status updated successfully",
            reservation
        });

    } catch (error) {
        console.error("Error updating reservation status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete reservation (Admin)
export const deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;

        const reservation = await Reservation.findByIdAndDelete(id);

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        res.status(200).json({
            message: "Reservation deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting reservation:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

import Reservation from '../../Models/ReservationModel.js';
import Table from '../../Models/TableModel.js';
import razorpay from '../../utils/razorpay.js';
import crypto from 'crypto';

const SECURITY_DEPOSIT_VALUE = Number(process.env.RESERVATION_SECURITY_AMOUNT);
const SECURITY_DEPOSIT = Number.isFinite(SECURITY_DEPOSIT_VALUE) && SECURITY_DEPOSIT_VALUE > 0
    ? SECURITY_DEPOSIT_VALUE
    : 100;
const SECURITY_CURRENCY = 'INR';

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
            user: req.user ? req.user.id : null,
            date,
            startTime,
            endTime,
            guests,
            guestDetails,
            securityAmount: SECURITY_DEPOSIT,
            paymentStatus: 'unpaid',
            status: 'pending'
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

// Get the most recent active reservation for the logged-in user
export const getActiveReservation = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Login required" });
        }

        const reservation = await Reservation.findOne({
            user: req.user.id,
            status: { $in: ['confirmed', 'pending'] }
        })
        .populate('table', 'tableNumber capacity type')
        .sort({ createdAt: -1 });

        if (!reservation) {
            return res.status(200).json({ success: false, message: "No active reservation found", data: null });
        }

        res.status(200).json({ success: true, data: reservation });

    } catch (error) {
        console.error("Error fetching active reservation:", error);
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

        const reservation = await Reservation.findById(id);

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        const user = req.user;

        // Authorization check: Only admin can set any status. 
        // Regular users and guests can only set status to 'cancelled'.
        if (user) {
            if (user.role !== 'admin') {
                if (status !== 'cancelled') {
                    return res.status(403).json({ message: "Only admins can change status to " + status });
                }

                // Check if it's the user's own reservation
                const isOwner = (reservation.user && reservation.user.toString() === user.id.toString()) ||
                    (reservation.guestDetails.email === user.email);

                if (!isOwner) {
                    return res.status(403).json({ message: "You can only cancel your own reservations" });
                }
            }
        } else {
            // Guest access: Only allow cancellation
            if (status !== 'cancelled') {
                return res.status(401).json({ message: "Login required to update status to " + status });
            }
        }

        reservation.status = status;
        const updatedReservation = await reservation.save();

        res.status(200).json({
            message: "Reservation status updated successfully",
            reservation: updatedReservation
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

// Create Razorpay order for reservation security deposit
export const createReservationPaymentOrder = async (req, res) => {
    try {
        const { reservationId } = req.body;

        if (!reservationId) {
            return res.status(400).json({ message: "reservationId is required" });
        }

        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        if (reservation.paymentStatus === 'paid') {
            return res.status(200).json({
                success: true,
                message: "Payment already completed",
                data: {
                    reservationId: reservation._id,
                    paymentStatus: reservation.paymentStatus
                }
            });
        }

        const amount = reservation.securityAmount || SECURITY_DEPOSIT;

        const razorpayOrder = await razorpay.orders.create({
            amount: amount * 100,
            currency: SECURITY_CURRENCY,
            receipt: `reservation_${reservation._id}`
        });

        reservation.razorpayOrderId = razorpayOrder.id;
        reservation.securityAmount = amount;
        await reservation.save();

        return res.status(200).json({
            success: true,
            message: "Security deposit order created",
            data: {
                reservationId: reservation._id,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                keyId: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        console.error("Error creating reservation payment order:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Verify Razorpay payment for reservation security deposit
export const verifyReservationPayment = async (req, res) => {
    try {
        const { reservationId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        if (!reservationId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({ message: "Missing required payment fields" });
        }

        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        if (reservation.razorpayOrderId && reservation.razorpayOrderId !== razorpayOrderId) {
            return res.status(400).json({ message: "Order mismatch" });
        }

        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ message: "Invalid signature" });
        }

        reservation.paymentStatus = 'paid';
        reservation.status = 'confirmed';
        reservation.razorpayPaymentId = razorpayPaymentId;
        reservation.razorpaySignature = razorpaySignature;
        reservation.paidAt = new Date();
        await reservation.save();

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            reservation
        });
    } catch (error) {
        console.error("Error verifying reservation payment:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

import mongoose from 'mongoose';
import ReservationModel from '../../Models/ReservationModel.js';
import TableModel from '../../Models/TableModel.js';
import reservationAvailability from '../../utils/reservationAvailability.js';

const createReservation = async (req, res) => {
    try {
        const {
            tableId,
            customerName,
            customerPhone,
            startTime,
            endTime,
            createdBy = 'customer',
        } = req.body;

        if (!tableId || !customerName || !customerPhone || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: 'tableId, customerName, customerPhone, startTime, endTime are required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(tableId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tableId'
            });
        }

        const parsedStart = new Date(startTime);
        const parsedEnd = new Date(endTime);

        if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid startTime or endTime'
            });
        }

        if (parsedStart >= parsedEnd) {
            return res.status(400).json({
                success: false,
                message: 'startTime must be before endTime'
            });
        }

        const table = await TableModel.findById(tableId);
        if (!table || !table.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Table not found'
            });
        }

        const conflict = await ReservationModel.findOne({
            tableId,
            status: { $in: ['pending', 'confirmed'] },
            startTime: { $lt: parsedEnd },
            endTime: { $gt: parsedStart },
        });

        if (conflict) {
            return res.status(409).json({
                success: false,
                message: 'Table is already reserved for the selected time range'
            });
        }

        const reservation = await ReservationModel.create({
            tableId,
            customerName,
            customerPhone,
            startTime: parsedStart,
            endTime: parsedEnd,
            createdBy,
        });

        return res.status(201).json({
            success: true,
            message: 'Reservation created successfully',
            data: reservation
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

const listReservations = async (req, res) => {
    try {
        const { date } = req.query;

        const filter = {};

        if (date) {
            const startOfDay = new Date(date);
            const endOfDay = new Date(date);
            if (Number.isNaN(startOfDay.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date filter'
                });
            }
            endOfDay.setHours(23, 59, 59, 999);
            filter.startTime = { $gte: startOfDay, $lte: endOfDay };
        }

        const reservations = await ReservationModel.find(filter)
            .populate('tableId', 'tableNumber capacity status')
            .sort({ startTime: 1 });

        return res.status(200).json({
            success: true,
            message: 'Reservations fetched successfully',
            data: reservations
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

const confirmReservation = async (req, res) => {
    try {
        const { reservationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reservationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reservationId'
            });
        }

        const reservation = await ReservationModel.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        reservation.status = 'confirmed';
        await reservation.save();

        await TableModel.findByIdAndUpdate(reservation.tableId, { status: 'occupied' });

        return res.status(200).json({
            success: true,
            message: 'Reservation confirmed successfully',
            data: reservation
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

const completeReservation = async (req, res) => {
    try {
        const { reservationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reservationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reservationId'
            });
        }

        const reservation = await ReservationModel.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        reservation.status = 'completed';
        await reservation.save();

        await TableModel.findByIdAndUpdate(reservation.tableId, { status: 'available' });

        return res.status(200).json({
            success: true,
            message: 'Reservation completed successfully',
            data: reservation
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

const listAvailableTables = async (req, res) => {
    try {
        const { startTime, endTime } = req.query;

        if (!startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: 'startTime and endTime are required'
            });
        }

        const parsedStart = new Date(startTime);
        const parsedEnd = new Date(endTime);

        if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid startTime or endTime'
            });
        }

        if (parsedStart >= parsedEnd) {
            return res.status(400).json({
                success: false,
                message: 'startTime must be before endTime'
            });
        }

        const tables = await reservationAvailability.getAvailableTables({
            startTime: parsedStart,
            endTime: parsedEnd,
        });

        return res.status(200).json({
            success: true,
            message: 'Available tables fetched successfully',
            data: tables
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

const createWalkInReservation = async (req, res) => {
    try {
        const { tableId, customerName, customerPhone, durationHours } = req.body;

        if (!tableId || !customerName || !customerPhone || !durationHours) {
            return res.status(400).json({
                success: false,
                message: 'tableId, customerName, customerPhone, durationHours are required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(tableId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tableId'
            });
        }

        const duration = Number(durationHours);
        if (![1, 2].includes(duration)) {
            return res.status(400).json({
                success: false,
                message: 'durationHours must be 1 or 2'
            });
        }

        const table = await TableModel.findById(tableId);
        if (!table || !table.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Table not found'
            });
        }

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

        const conflict = await ReservationModel.findOne({
            tableId,
            status: { $in: ['pending', 'confirmed'] },
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
        });

        if (conflict) {
            return res.status(409).json({
                success: false,
                message: 'Table is already reserved for the selected time range'
            });
        }

        const reservation = await ReservationModel.create({
            tableId,
            customerName,
            customerPhone,
            startTime,
            endTime,
            status: 'confirmed',
            createdBy: 'admin',
        });

        await TableModel.findByIdAndUpdate(tableId, { status: 'occupied' });

        return res.status(201).json({
            success: true,
            message: 'Walk-in reservation created successfully',
            data: reservation
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

export default {
    createReservation,
    listReservations,
    confirmReservation,
    completeReservation,
    listAvailableTables,
    createWalkInReservation,
};

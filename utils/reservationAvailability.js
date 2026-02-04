import ReservationModel from '../Models/ReservationModel.js';
import TableModel from '../Models/TableModel.js';

const getAvailableTables = async ({ startTime, endTime }) => {
    const overlappingReservations = await ReservationModel.find({
        status: { $in: ['pending', 'confirmed'] },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
    }).select('tableId');

    const reservedTableIds = overlappingReservations.map((reservation) => reservation.tableId);

    return TableModel.find({
        isActive: true,
        _id: { $nin: reservedTableIds },
    }).sort({ tableNumber: 1 });
};

export default {
    getAvailableTables,
};

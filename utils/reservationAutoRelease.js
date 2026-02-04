import ReservationModel from '../Models/ReservationModel.js';
import TableModel from '../Models/TableModel.js';

const releaseExpiredReservations = async () => {
    const now = new Date();

    const expiredReservations = await ReservationModel.find({
        status: 'confirmed',
        endTime: { $lt: now },
    });

    if (expiredReservations.length === 0) {
        return;
    }

    const reservationIds = expiredReservations.map((reservation) => reservation._id);
    const tableIds = expiredReservations.map((reservation) => reservation.tableId);

    await ReservationModel.updateMany(
        { _id: { $in: reservationIds } },
        { $set: { status: 'completed' } }
    );

    await TableModel.updateMany(
        { _id: { $in: tableIds } },
        { $set: { status: 'available' } }
    );
};

const startReservationAutoRelease = () => {
    setInterval(() => {
        releaseExpiredReservations().catch((error) => {
            console.error('Reservation auto-release failed:', error);
        });
    }, 5 * 60 * 1000);
};

export default {
    startReservationAutoRelease,
};

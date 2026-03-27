import express from 'express';
import AuthMiddleware from '../Middlewares/AuthMiddleware.js';
import requireRole from '../Middlewares/RoleMiddleware.js';
import AuthRoutes from '../Controllers/Auth/AuthRoutes.js';
import CafeRoutes from '../Controllers/Cafe/CafeRoutes.js';
import CategoryRoutes from '../Controllers/Category/CategoryRoutes.js';
import TableRoutes from '../Controllers/Tables/TableRoutes.js';
import OrderRoutes from '../Controllers/Order/OrderRoutes.js';
import PaymentRoutes from '../Controllers/Payment/PaymentRoutes.js';

import ReservationRoutes from '../Controllers/Reservation/ReservationRoutes.js';
import UserRoutes from '../Controllers/User/UserRoutes.js';
import DashboardRoutes from '../Controllers/Dashboard/DashboardRoutes.js';
import multer from 'multer';

const app = express();

app.use('/auth', AuthRoutes);
app.use('/user', UserRoutes);
app.use('/dashboard', DashboardRoutes);
app.use('/cafe', AuthMiddleware, requireRole('admin'), CafeRoutes);
app.use('/category', CategoryRoutes);
app.use('/cafe-table', AuthMiddleware, TableRoutes);
app.use('/order', AuthMiddleware, OrderRoutes);
app.use('/payment', AuthMiddleware, PaymentRoutes);
app.use('/reservations', ReservationRoutes); // Public access for guest reservations

// Multer error handler
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size allowed is 5MB.'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    } else if (err) {
        return res.status(500).json({
            success: false,
            message: err.message || 'Internal Server Error'
        });
    }
    next();
});

export default app;

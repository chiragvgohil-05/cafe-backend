import express from 'express';
import AuthMiddleware from '../Middlewares/AuthMiddleware.js';
import AuthRoutes from '../Controllers/Auth/AuthRoutes.js';
import CafeRoutes from '../Controllers/Cafe/CafeRoutes.js';
import CategoryRoutes from '../Controllers/Category/CategoryRoutes.js';
import TableRoutes from '../Controllers/Tables/TableRoutes.js';
import OrderRoutes from '../Controllers/Order/OrderRoutes.js';
import PaymentRoutes from '../Controllers/Payment/PaymentRoutes.js';

const app = express();

app.use('/auth', AuthRoutes);
app.use('/cafe', AuthMiddleware, CafeRoutes);
app.use('/category', AuthMiddleware, CategoryRoutes);
app.use('/cafe-table', AuthMiddleware, TableRoutes);
app.use('/order', AuthMiddleware, OrderRoutes);
app.use('/payment', AuthMiddleware, PaymentRoutes);

export default app;
import jwt from 'jsonwebtoken';
import userModel from '../Models/UserModel.js';

const authMiddleware = async (req, res, next) => {
    try {
        const { authorization } = req.headers;

        const token = authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await userModel.findById(decoded?.id);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }
        req.user = {
            id: user?._id,
            email: user?.email,
            role: user?.role
        };

        next();

    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.message,
        });
    }
};
export default authMiddleware;
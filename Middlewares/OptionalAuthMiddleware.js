import jwt from 'jsonwebtoken';
import userModel from '../Models/UserModel.js';

const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        const token = authorization?.split(" ")[1];

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await userModel.findById(decoded?.id);

        if (user) {
            req.user = {
                id: user._id,
                email: user.email,
                role: user.role
            };
        }
        next();
    } catch (error) {
        // If token is invalid or any error occurs, just proceed as guest
        next();
    }
};

export default optionalAuthMiddleware;

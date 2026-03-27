const requireRole = (role) => (req, res, next) => {
    if (!req.user || !req.user.role) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
    }

    if (req.user.role !== role) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden',
        });
    }

    return next();
};

export default requireRole;

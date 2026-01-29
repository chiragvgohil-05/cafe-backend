import multer from "multer";

// Optional: file filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error("Only JPG, JPEG, PNG allowed"), false);
    }
    cb(null, true);
};

const upload = multer({
    storage :  multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;

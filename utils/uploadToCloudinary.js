import { cloudinary } from "../Config/cloudinary.js";

const uploadToCloudinary = (buffer, folder = "posts") => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
        .upload_stream({ folder }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        })
        .end(buffer);
    });
};

export default uploadToCloudinary;

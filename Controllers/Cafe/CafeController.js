import cafeModel from "../../Models/CafeModel.js";
import mongoose, { mongo } from 'mongoose';


const create = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const alreadyExisted = await cafeModel.findOne({ isOwner: ownerId });
        if (alreadyExisted) {
            return res.status(400).send({
                success: false,
                message: "Cafe already created"
            })
        }
        const { name, address, openTime, closeTime, isOpen } = req.body;

        if (!name || !address || !openTime || !closeTime) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const newCafe = await cafeModel.create({
            name,
            address,
            openTime,
            closeTime,
            isOpen,
            isOwner: ownerId
        });

       return res.status(201).json({
            success: true,
            message: "Cafe created successfully",
            data: newCafe
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getCafeList = async (req, res) => {
    try {
        const ownerId = req.user.id;

        const cafe = await cafeModel.find({}).populate('isOwner','name email' );
        if(!cafe){
            return res.status(404).send({
                success: false,
                message: "Cafe not found"
            })
        }
       return res.status(200).json({
           success: true,
           data: cafe,
           message: "cafe get successfully",
       })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

// update cafe
const updateCafe = async (req, res) => {
        try {
            const cafeId = req.params.id;
            const ownerId = req.user.id;

            if (!mongoose.Types.ObjectId.isValid(cafeId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid cafe id",
                });
            }

            const updatedCafe = await cafeModel.findOneAndUpdate(
                { _id: cafeId, isOwner: ownerId },
                { $set: req.body },
                { new: true, runValidators: true }
            );
            if(!updatedCafe){
                return res.status(404).send({
                    success: false,
                    message: "Cafe not found"
                })
            }
            return res.status(200).json({
                success: true,
                data: updatedCafe,
                message: "cafe updated successfully",
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            })
        }
}

// delete cafe
const deleteCafe = async (req, res) => {
    try {
        const cafeId = req.params.id;
        // const ownerId = req.user.id;
        if(!mongoose.Types.ObjectId.isValid(cafeId)) {
            return res.status(400).json({
                success: false,
                message: "Cafe not found"
            });
        }
        const deleteCafe = await cafeModel.findOneAndDelete({
            _id: cafeId,
            // ownerId: ownerId
        });
        if(!deleteCafe){
            return res.status(404).send({
                success: false,
                message: "Cafe not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "cafe deleted successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}
export default {
    create,
    getCafeList,
    updateCafe,
    deleteCafe
};

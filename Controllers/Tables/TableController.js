import TableModel from '../../Models/TableModel.js';
import mongoose from 'mongoose';

/* ================= CREATE TABLE ================= */
const create = async (req, res) => {
    try {
        const { tableNumber, capacity } = req.body;

        if (!tableNumber || !capacity) {
            return res.status(400).json({
                success: false,
                message: 'tableNumber and capacity are required'
            });
        }

        if (Number(capacity) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Capacity must be greater than 0'
            });
        }

        const normalizedTableNumber = tableNumber.trim().toUpperCase();

        // ❌ Duplicate table check
        const existingTable = await TableModel.findOne({
            tableNumber: normalizedTableNumber,
            isActive: true
        });

        if (existingTable) {
            return res.status(400).json({
                success: false,
                message: `Table ${tableNumber} already exists`
            });
        }

        const table = await TableModel.create({
            tableNumber: normalizedTableNumber,
            capacity,
            status: 'available'
        });

        return res.status(201).json({
            success: true,
            message: 'Table created successfully',
            data: table
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

const listTables = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            order = 'desc',
            search = ''
        } = req.query;

        page = Number(page);
        limit = Number(limit);

        const filter = {
            isActive: true
        };

        if (search) {
            filter.tableNumber = {
                $regex: search.trim().toUpperCase(),
                $options: 'i'
            };
        }

        const sortOptions = {
            [sortBy]: order === 'asc' ? 1 : -1
        };

        const skip = (page - 1) * limit;

        const tables = await TableModel.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        const totalRecords = await TableModel.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: 'Table list fetched successfully',
            data: tables,
            pagination: {
                totalRecords,
                currentPage: page,
                totalPages: Math.ceil(totalRecords / limit),
                limit
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

/* ================= UPDATE TABLE ================= */
const update = async (req, res) => {
    try {
        const { tableId } = req.params;
        const { tableNumber, capacity, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(tableId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tableId'
            });
        }

        const table = await TableModel.findById(tableId);
        if (!table || !table.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Table not found'
            });
        }

        if (capacity && Number(capacity) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Capacity must be greater than 0'
            });
        }

        if (tableNumber) {
            const normalizedTableNumber = tableNumber.trim().toUpperCase();

            const duplicate = await TableModel.findOne({
                _id: { $ne: tableId },
                tableNumber: normalizedTableNumber,
                isActive: true
            });

            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message: `Table ${tableNumber} already exists`
                });
            }

            table.tableNumber = normalizedTableNumber;
        }

        if (capacity) table.capacity = capacity;

        if (status) {
            if (!['available', 'occupied', 'reserved'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid table status'
                });
            }
            table.status = status;
        }

        await table.save();

        return res.status(200).json({
            success: true,
            message: 'Table updated successfully',
            data: table
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

/* ================= DELETE TABLE (SOFT) ================= */
const remove = async (req, res) => {
    try {
        const { tableId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(tableId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tableId'
            });
        }

        const table = await TableModel.findById(tableId);
        if (!table || !table.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Table not found'
            });
        }

        table.isActive = false;
        await table.save();

        return res.status(200).json({
            success: true,
            message: 'Table deleted successfully'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

export default {
    create,
    listTables,
    update,
    remove
}
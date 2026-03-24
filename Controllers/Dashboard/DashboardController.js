import orderModel from "../../Models/OrderModel.js";
import userModel from "../../Models/UserModel.js";
import menuItemModel from "../../Models/MenuItemModel.js";
import reservationModel from "../../Models/ReservationModel.js";

const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Revenue
    const revenueResult = await orderModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // 2. Total Orders
    const totalOrders = await orderModel.countDocuments();

    // 3. Active Customers (Assuming customers who logged in or have orders)
    const activeCustomers = await userModel.countDocuments({ role: 'customer' });

    // 4. Growth Rate (Let's calculate based on revenue last 30 days vs previous 30 days)
    const now = new Date();
    const last30Days = new Date(now.setDate(now.getDate() - 30));
    const previous30Days = new Date(new Date(last30Days).setDate(last30Days.getDate() - 30));

    const currentMonthRevenue = await orderModel.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: last30Days } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const prevMonthRevenue = await orderModel.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: previous30Days, $lt: last30Days } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const crValue = currentMonthRevenue.length > 0 ? currentMonthRevenue[0].total : 0;
    const prValue = prevMonthRevenue.length > 0 ? prevMonthRevenue[0].total : 0;

    let growthRate = 0;
    if (prValue > 0) {
      growthRate = ((crValue - prValue) / prValue) * 100;
    } else if (crValue > 0) {
      growthRate = 100;
    }

    // 5. Recent Orders (last 5)
    const recentOrders = await orderModel.find()
      .populate('tableId')
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Popular Items (Top 5 based on total quantity sold)
    const popularItems = await orderModel.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.itemId",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      { $lookup: { from: "menuitems", localField: "_id", foreignField: "_id", as: "itemDetails" } },
      { $unwind: "$itemDetails" }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalRevenue,
          totalOrders,
          activeCustomers,
          growthRate: growthRate.toFixed(1)
        },
        recentOrders,
        popularItems: popularItems.map(item => ({
          name: item.itemDetails.name,
          orders: item.totalQuantity,
          revenue: item.totalRevenue,
          percentage: Math.min(100, (item.totalQuantity / (totalOrders || 1)) * 100).toFixed(0)
        }))
      }
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export default {
  getDashboardStats
};

import orderModel from "../../Models/OrderModel.js";
import userModel from "../../Models/UserModel.js";
import menuItemModel from "../../Models/MenuItemModel.js";
import reservationModel from "../../Models/ReservationModel.js";

const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Revenue (Orders + Paid Reservation Deposits)
    const orderRevenue = await orderModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const resRevenue = await reservationModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: "$securityAmount" } } }
    ]);
    const totalRevenue = (orderRevenue[0]?.total || 0) + (resRevenue[0]?.total || 0);

    // 2. Total Orders
    const totalOrders = await orderModel.countDocuments();

    // 3. Active Customers
    const activeCustomers = await userModel.countDocuments({ role: 'customer' });

    // 4. Reservations Stats
    const totalReservations = await reservationModel.countDocuments();
    const pendingReservations = await reservationModel.countDocuments({ status: 'pending' });
    const todayStr = new Date().toISOString().split('T')[0];
    const todayReservations = await reservationModel.countDocuments({ date: todayStr });

    const upcomingReservations = await reservationModel.find({
        date: { $gte: todayStr }
    })
      .populate('table', 'tableNumber')
      .sort({ date: 1, startTime: 1 })
      .limit(5);

    // 5. Growth Rate
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

    const crValue = currentMonthRevenue[0]?.total || 0;
    const prValue = prevMonthRevenue[0]?.total || 0;

    let growthRate = 0;
    if (prValue > 0) {
      growthRate = ((crValue - prValue) / prValue) * 100;
    } else if (crValue > 0) {
      growthRate = 100;
    }

    // 6. Recent Orders
    const recentOrders = await orderModel.find()
      .populate('tableId')
      .sort({ createdAt: -1 })
      .limit(5);

    // 7. Popular Items
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
          totalReservations,
          pendingReservations,
          todayReservations,
          growthRate: growthRate.toFixed(1)
        },
        recentOrders,
        upcomingReservations: upcomingReservations.map(r => ({
          id: r._id,
          name: r.guestDetails.name,
          time: r.startTime,
          date: r.date,
          table: r.table?.tableNumber || 'N/A',
          status: r.status
        })),
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

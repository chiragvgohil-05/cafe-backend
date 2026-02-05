import razorpay from '../../utils/razorpay.js';
import orderModel from '../../Models/OrderModel.js';
import crypto from 'crypto';


const createPaymentOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: order.totalAmount * 100,
            currency: "INR",
            receipt: `order_${order._id}`
        });
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(200).json({
            success: true,
            message: 'Payment successfully created',
            data: {
                orderId: order._id,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
            }
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

const paymentVerify = async (req, res) => {
      try {
        const { razorpayOrderId,razorpayPaymentId,razorpaySignature, orderId } = req.body;

          const body = razorpayOrderId + "|" + razorpayPaymentId;

          const expectedSignature = crypto
          .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
          .update(body.toString())
          .digest("hex");

          if (expectedSignature !== razorpaySignature) {
              return res.status(400).json({ success: false, message: "Invalid signature" });
          }
          const updatedOrder = await orderModel.findByIdAndUpdate(
              orderId,
              {
                  paymentStatus: "paid",
                  razorpayPaymentId: razorpayPaymentId,
                  razorpaySignature: razorpaySignature,
                  paidAt: new Date()
              },
              { new: true, runValidators: true }
          );

          if (!updatedOrder) {
              return res.status(404).json({ success: false, message: "Order not found" });
          }

          res.json({
              success: true,
              message: "Payment verified successfully"
          });
      } catch (error) {
          res.status(500).json({
              success: false,
              message: 'Internal Server Error',
          })
      }
}

export default {
    createPaymentOrder,
    paymentVerify
};

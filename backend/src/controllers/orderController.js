const Order = require('../models/Order');

const orderController = {
  /**
   * Get Orders for Authenticated User
   */
  getOrders: async (req, res, next) => {
    try {
      const { status } = req.query;
      let query = { userId: req.user._id };

      if (status) {
        query.orderStatus = status;
      }

      const orders = await Order.find(query)
        .populate('productId')
        .populate('auctionId')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Single Order Detail
   */
  getOrderById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const order = await Order.findOne({
        $or: [{ _id: id }, { orderId: id }],
        userId: req.user._id,
      })
        .populate('productId')
        .populate('auctionId');

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'ORDER_NOT_FOUND',
          message: 'Order not found.',
        });
      }

      res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update Shipping Address for an Order
   */
  updateShippingAddress: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { fullName, phone, street, city, state, pinCode } = req.body;

      if (!fullName || !phone || !street || !city || !state || !pinCode) {
        return res.status(400).json({
          success: false,
          error: 'INCOMPLETE_ADDRESS',
          message: 'All shipping fields (Full Name, Phone, Street, City, State, PIN Code) are required.',
        });
      }

      // Validate PIN code format (6 digits for India)
      if (!/^\d{6}$/.test(pinCode.trim())) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_PIN_CODE',
          message: 'Please provide a valid 6-digit PIN code.',
        });
      }

      const order = await Order.findOne({
        $or: [{ _id: id }, { orderId: id }],
        userId: req.user._id,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'ORDER_NOT_FOUND',
          message: 'Order not found.',
        });
      }

      if (['SHIPPED', 'DELIVERED', 'CANCELLED', 'DEFAULTED'].includes(order.orderStatus)) {
        return res.status(400).json({
          success: false,
          error: 'CANNOT_UPDATE_SHIPPING',
          message: `Shipping address cannot be altered when order is ${order.orderStatus}.`,
        });
      }

      order.shippingAddress = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        pinCode: pinCode.trim(),
      };
      order.shippingUpdatedAt = new Date();

      await order.save();

      res.status(200).json({
        success: true,
        message: 'Shipping address submitted successfully.',
        order,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = orderController;

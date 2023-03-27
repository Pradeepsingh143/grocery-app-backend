import Order from "../models/order.schema.js";
import Cart from "../models/cart.schema.js";

import Coupon from "../models/coupon.schema.js";
import RazorPayInstance from "../config/razorpay.config.js";
import CustomError from "../utils/customError.js";
import asynHandler from "../services/asyncHandler.js";
import PaymentStatus from "../utils/paymentStatus.js";
import PaymentMethod from "../utils/paymentMethod.js";
import OrderStatus from "../utils/orderStatus.js";
import config from "../config/index.js";
import mailHelper from "../utils/mailHelper.js";

/**********************************************************
 * @CREATE_ORDER
 * @route https://localhost:5000/api/order/create
 * @description Controller used for creating order
 * @description Creates a order with different payment options
 * @returns Order "order created successfully"
 *********************************************************/
export const createOrder = asynHandler(async (req, res) => {
  const userId = req.user._id;
  const userEmail = req.user.email;
  const userName = req.user.name;
  const { shippingAddress, coupon, paymentMethod: paymentType } = req.body;
  try {
    const userCart = await Cart.findOne({ userId: userId })
      .select("items")
      .populate({
        path: "items.productId",
        select: "name price",
      });

    if (!userCart) {
      throw new CustomError("No product in your cart", 400);
    }

    let finalAmount;

    //total amount and final amount
    const totalAmount = userCart.items.reduce(
      (total, product) => total + product.productId.price * product.quantity,
      0
    );

    // coupon check - DB
    if (coupon) {
      const verifyCoupon = await Coupon.findOne({ code: coupon });
      if (!verifyCoupon || !verifyCoupon.isActive) {
        throw new CustomError("Invalid Coupon", 400);
      } else {
        finalAmount = Math.floor(
          totalAmount - (totalAmount * verifyCoupon.discount) / 100
        );
      }
    } else {
      finalAmount = totalAmount;
    }

    // cash on delivery
    if (paymentType.toUpperCase() === PaymentMethod.COD) {
      const order = await Order.create({
        product: userCart.items,
        user: userId,
        shippingAddress: shippingAddress,
        totalPrice: finalAmount,
        coupon: coupon,
      });

      await order.populate("product.productId", "name price");

      const date = new Date(order.createdAt);
      const orderCreatedDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} :: ${date.getHours()}:${date.getSeconds()}`;
      const emailText = `
      <html>
      <head>
        <style>
          .product {
            font-weight: bold;
            color: #333;
          }
          .subtotal {
            color: #666;
          }
          .total {
            font-size: 18px;
            font-weight: bold;
            color: #333;
          }
        </style>
      </head>
      <body>
      <div>
      Dear ${userName},<br>
      <p>Thank you for placing your order with us! We are pleased to inform you that your order has been successfully placed with the following details:<p><br><br>

      <span><strong>Order ID:</strong><span> ${order.orderId}<br>
      <span><strong>Order Date:</strong><span> ${orderCreatedDate}<br>
      <p>Your order details:</p>
      ${order.product.map(
        (item) => `
      <ul>
        <li class="product">${item.productId.name} - ${item.quantity} x ${item.productId.price} </li><br>
      </ul>
      `
      )}
      <br>
      <span>Order Total Price =<span> <strong>${order.totalPrice}</strong>
      <p>Your order will be processed and shipped as soon as possible.<br> We will send you an email with the tracking details once your order has been shipped.</p>

      <p>If you have any questions or concerns about your order, please don't hesitate to contact us.</p><br>

      <p>Thank you for choosing our store!</p>

      Best regards,
      igntieshark
      </div>
      </body>
      </html>
      `;
      if (order) {
        await mailHelper({
          email: userEmail,
          subject: "Confirmation: Your Order Has Been Successfully Created",
          html: emailText,
        });
      } else {
        throw new CustomError("!Failed, Order not created", 400);
      }

      res.status(200).json({
        success: true,
        message: "Order created successfully",
        order,
      });
    }
    // pay with razor pay aggrigator
    if (paymentType.toUpperCase() === PaymentMethod.RAZORPAY) {
      const options = {
        amount: Math.round(finalAmount * 100),
        currency: config.CURRENCY,
        receipt: `igniteshark${new Date().getTime()}`,
      };

      const razorpay = await RazorPayInstance.orders.create(options);

      if (!razorpay) {
        throw new CustomError("!Failed, payment not recived", 400);
      } else {
        const order = await Order.create({
          product: userCart.items,
          user: userId,
          shippingAddress: shippingAddress,
          totalPrice: finalAmount,
          paymentStatus: PaymentStatus.COMPLETED,
          paymentMethod: PaymentMethod.RAZORPAY,
          orderStatus: OrderStatus.CONFIRMED,
          transactionId: razorpay._id,
          coupon: coupon,
        });

        const emailText = `Thanks for placing an order`;
        if (order) {
          await mailHelper({
            email: userEmail,
            subject: "Confirmation: Your Order Has Been Successfully Created",
            text: emailText,
          });
        }
        res.status(200).json({
          success: true,
          message: "Order created successfully",
          order,
        });
      }
    }
    // pay with upi
    if (paymentType.toUpperCase() === PaymentMethod.UPI) {
      // code...
      res.status(200).json({
        success: true,
        message: "Order created successfully",
        // order,
      });
    }
  } catch (error) {
    console.log(error);
    console.log(
      `Error finding products: ${error.message || "product not found"}`
    );
  }
});

/**********************************************************
 * @CANCEL_ORDER
 * @route https://localhost:5000/api/order/cancel/:orderId
 * @description Controller used for cancel order
 * @description cancel a order based on orderId
 * @returns Order "order cancelled"
 *********************************************************/
export const cancelOrder = asynHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    throw new CustomError("Please provide orderId", 400);
  }

  const order = await Order.findOneAndUpdate(
    orderId,
    { orderStatus: OrderStatus.CANCELLED },
    { new: true }
  );
  if (!order) {
    throw new CustomError("something went wrong", 400);
  }

  res.status(200).json({
    success: true,
    message: "Order cancelled",
    order,
  });
});

/**********************************************************
 * @GET_USER_ORDERS_LIST
 * @route https://localhost:5000/api/order/user
 * @description Controller used to get user order details
 * @description get user order details based on userId
 * @returns OrderList "order fetched successfully"
 *********************************************************/
export const getOrderList = asynHandler(async (req, res) => {
  const userId = req.user._id;
  const order = await Order.findOne({ user: userId });
  if (!order) {
    throw new CustomError("User don't have any order", 404);
  }
  res.status(200).json({
    success: true,
    message: "user order list fetched successfully",
    order,
  });
});


/**********************************************************
 * @GET_All_ORDERS_LIST
 * @route https://localhost:5000/api/order/all
 * @description Controller used to get all users order details
 * @description get all users order details
 * @returns OrderList "order fetched successfully"
 *********************************************************/
export const getAllOrderList = asynHandler(async (_req, res) => {
  const order = await Order.find();
  if (!order) {
    throw new CustomError("Don't have any orders", 404);
  }
  res.status(200).json({
    success: true,
    message: "All orders list fetched successfully",
    order,
  });
});



/**********************************************************
 * @CHANGE_ORDER_STATUS
 * @route https://localhost:5000/api/order/status/:orderId
 * @description Controller used to get change order status
 * @description changed order status based on orderId
 * @returns OrderList "order status changed successfully"
 *********************************************************/
export const changeOrderStatus = asynHandler(async (req, res) => {
  const { orderId } = req.params;
  const {orderStatus} = req.body;

  if (!orderId) {
    throw new CustomError("Please provide orderId", 400);
  }

  const order = await Order.findOneAndUpdate(
    orderId,
    { orderStatus: orderStatus.toUpperCase() },
    { new: true }
  );
  if (!order) {
    throw new CustomError("something went wrong", 400);
  }

  res.status(200).json({
    success: true,
    message: "Order cancelled",
    order,
  });
});
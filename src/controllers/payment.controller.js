import axios from "axios";
import jwt from "jsonwebtoken";
import Order from "../models/order.model.js";
import OrderStatus from "../models/orderStatus.model.js";

export const createPayment = async (req, res) => {
  try {
    const {
      amount,
      callback_url,
      trustee_id,
      student_info,
      gateway_name,
      school_id,
    } = req.body;

    if (
      !amount ||
      !callback_url ||
      !trustee_id ||
      !student_info ||
      !gateway_name ||
      !school_id
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Step 1: Create an Order document in DB
    const order = await Order.create({
      school_id,
      trustee_id,
      student_info,
      gateway_name,
    });

    // Step 2: Generate sign JWT
    const payload = {
      school_id,
      amount: amount.toString(),
      callback_url,
    };

    const sign = jwt.sign(payload, process.env.PG_KEY, { algorithm: "HS256" });

    // Step 3: Call Payment API
    const response = await axios.post(
      "https://dev-vanilla.edviron.com/erp/create-collect-request",
      {
        school_id: process.env.SCHOOL_ID,
        amount: amount.toString(),
        callback_url,
        sign,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    const { collect_request_id, collect_request_url } = response.data;

    // Step 4: Create OrderStatus with correct linkage
    await OrderStatus.create({
      collect_id: order._id.toString(), // Link to Order._id
      collect_request_id: collect_request_id, // From Payment API
      order_amount: amount,
      status: "pending",
    });

    // Step 5: Return payment URL to frontend
    res.status(200).json({
      collect_request_id,
      paymentPageUrl: collect_request_url,
    });
  } catch (error) {
    console.error("Payment API error:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to create payment",
      error: error.response?.data || error.message,
    });
  }
};

export const checkPaymentStatus = async (req, res) => {
  try {
    const { collect_request_id } = req.params;

    // You should already have the school_id from your env
    const school_id = process.env.SCHOOL_ID;

    // Generate sign JWT payload
    const payload = {
      school_id,
      collect_request_id,
    };

    const sign = jwt.sign(payload, process.env.PG_KEY, { algorithm: "HS256" });

    // Call Payment API to check status
    const response = await axios.get(
      `https://dev-vanilla.edviron.com/erp/collect-request/${collect_request_id}`,
      {
        params: {
          school_id,
          sign,
        },
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    const { status, amount, details, jwt: statusJwt } = response.data;

    res.status(200).json({
      status,
      amount,
      details,
      statusJwt,
    });
  } catch (error) {
    console.error(
      "Check Payment Status Error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      message: "Failed to check payment status",
      error: error.response?.data || error.message,
    });
  }
};

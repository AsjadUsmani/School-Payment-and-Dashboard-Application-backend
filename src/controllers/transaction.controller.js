import Order from "../models/order.model.js";
import OrderStatus from "../models/orderStatus.model.js";

export const getAllTransactions = async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      sort = "payment_time",
      order = "desc",
    } = req.query;

    const transactions = await OrderStatus.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "collect_id",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $project: {
          collect_id: 1,
          school_id: "$order.school_id",
          gateway: "$order.gateway_name",
          order_amount: 1,
          transaction_amount: 1,
          status: 1,
          custom_order_id: 1,     // ✅ Use the correct field name here
          payment_time: 1,       // ✅ Add payment_time so frontend shows it
        },
      },
      { $sort: { [sort]: order === "desc" ? -1 : 1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) },
    ]);

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Get All Transactions Error:", error.message);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getTransactionsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const transactions = await OrderStatus.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "collect_id",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      { $match: { "order.school_id": schoolId } },
      {
        $project: {
          collect_id: 1,
          school_id: "$order.school_id",
          trustee_id: "$order.trustee_id",
          gateway: "$order.gateway_name",
          order_amount: 1,
          transaction_amount: 1,
          status: 1,
          payment_time: 1,
        },
      },
    ]);

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Get Transactions by School Error:", error.message);
    res.status(500).json({ message: "Server error", error });
  }
};

export const checkTransactionStatus = async (req, res) => {
  try {
    const { custom_order_id } = req.params;

    const transaction = await OrderStatus.findOne({
      collect_id: custom_order_id,
    });

    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    res.status(200).json({ status: transaction.status });
  } catch (error) {
    console.error("Check Transaction Status Error:", error.message);
    res.status(500).json({ message: "Server error", error });
  }
};

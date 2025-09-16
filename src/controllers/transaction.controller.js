// transaction.controller.js
import Order from "../models/order.model.js";
import OrderStatus from "../models/orderStatus.model.js";

export const getAllTransactions = async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      sort = "payment_time",
      order = "desc",
      status = "",
      school = "",
      search = "",
    } = req.query;

    // Build match conditions
    const matchConditions = {};
    
    if (status) {
      matchConditions.status = status;
    }

    // Build search conditions (after lookup)
    const searchConditions = {};
    if (school) {
      searchConditions["order.school_id"] = school;
    }
    if (search) {
      searchConditions.$or = [
        { collect_id: { $regex: search, $options: "i" } },
        { "order.gateway_name": { $regex: search, $options: "i" } },
        { collect_request_id: { $regex: search, $options: "i" } },
      ];
    }

    // Build aggregation pipeline
    const pipeline = [
      // Match status conditions first (before lookup for better performance)
      ...(Object.keys(matchConditions).length > 0 ? [{ $match: matchConditions }] : []),
      
      // Lookup order details
      {
        $lookup: {
          from: "orders",
          localField: "collect_id",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      
      // Match search and school conditions (after lookup)
      ...(Object.keys(searchConditions).length > 0 ? [{ $match: searchConditions }] : []),
      
      // Project required fields
      {
        $project: {
          _id: 1,
          collect_id: 1,
          school_id: "$order.school_id",
          trustee_id: "$order.trustee_id",
          gateway: "$order.gateway_name",
          order_amount: 1,
          transaction_amount: { $ifNull: ["$transaction_amount", null] },
          status: 1,
          custom_order_id: { 
            $ifNull: [
              "$custom_order_id", 
              "$collect_request_id", 
              null
            ] 
          },
          collect_request_id: 1, // Include the actual collect_request_id
          payment_time: { $ifNull: ["$payment_time", "$createdAt"] },
          payment_mode: { $ifNull: ["$payment_mode", null] },
          payment_details: { $ifNull: ["$payment_details", null] },
          bank_reference: { $ifNull: ["$bank_reference", null] },
          payment_message: { $ifNull: ["$payment_message", null] },
          error_message: { $ifNull: ["$error_message", null] },
          created_at: "$createdAt",
          updated_at: "$updatedAt",
        },
      },
    ];

    // Get total count for pagination
    const countPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await OrderStatus.aggregate(countPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // Get paginated data
    const dataPipeline = [
      ...pipeline,
      { $sort: { [sort]: order === "desc" ? -1 : 1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ];

    const transactions = await OrderStatus.aggregate(dataPipeline);

    // Return paginated response
    res.status(200).json({
      transactions,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total: total,
        total_pages: Math.ceil(total / parseInt(limit)),
        has_next_page: parseInt(page) < Math.ceil(total / parseInt(limit)),
        has_prev_page: parseInt(page) > 1,
      },
    });

  } catch (error) {
    console.error("Get All Transactions Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getTransactionsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const pipeline = [
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
          _id: 1,
          collect_id: 1,
          school_id: "$order.school_id",
          trustee_id: "$order.trustee_id",
          gateway: "$order.gateway_name",
          order_amount: 1,
          transaction_amount: { $ifNull: ["$transaction_amount", null] },
          status: 1,
          custom_order_id: { $ifNull: ["$collect_request_id", null] },
          payment_time: { $ifNull: ["$payment_time", "$createdAt"] },
          created_at: "$createdAt",
        },
      },
      { $sort: { payment_time: -1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ];

    const transactions = await OrderStatus.aggregate(pipeline);

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Get Transactions by School Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const checkTransactionStatus = async (req, res) => {
  try {
    const { custom_order_id } = req.params;

    // Try to find by multiple possible fields
    let transaction = await OrderStatus.aggregate([
      {
        $match: {
          $or: [
            { collect_request_id: custom_order_id },
            { custom_order_id: custom_order_id },
            { collect_id: custom_order_id },
            { _id: custom_order_id },
          ],
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "collect_id",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: { path: "$order", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          collect_id: 1,
          collect_request_id: 1,
          school_id: "$order.school_id",
          gateway: "$order.gateway_name",
          order_amount: 1,
          transaction_amount: { $ifNull: ["$transaction_amount", null] },
          status: 1,
          custom_order_id: { 
            $ifNull: [
              "$custom_order_id", 
              "$collect_request_id", 
              null
            ] 
          },
          payment_time: { $ifNull: ["$payment_time", "$createdAt"] },
          payment_mode: { $ifNull: ["$payment_mode", null] },
          payment_details: { $ifNull: ["$payment_details", null] },
          bank_reference: { $ifNull: ["$bank_reference", null] },
          payment_message: { $ifNull: ["$payment_message", null] },
          error_message: { $ifNull: ["$error_message", null] },
        },
      },
      { $limit: 1 },
    ]);

    if (!transaction || transaction.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transaction[0]);
  } catch (error) {
    console.error("Check Transaction Status Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
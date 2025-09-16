// Fixed webhook controller
import WebhookLog from "../models/webhookLog.model.js";
import OrderStatus from "../models/orderStatus.model.js";

export const handleWebhook = async (req, res) => {
  try {
    const payload = req.body;

    // Save entire payload for debugging
    await WebhookLog.create({ payload });

    const orderInfo = payload.order_info;
    
    // FIXED: Use collect_request_id to find the record, not collect_id
    // The webhook should contain the collect_request_id that matches our database
    const collectRequestId = orderInfo.collect_request_id || orderInfo.order_id;

    if (!collectRequestId) {
      console.error("No collect_request_id found in webhook payload");
      return res.status(400).json({ message: "Missing collect_request_id in payload" });
    }

    // FIXED: Find by collect_request_id instead of collect_id
    const updated = await OrderStatus.findOneAndUpdate(
      { collect_request_id: collectRequestId },
      {
        order_amount: orderInfo.order_amount,
        transaction_amount: orderInfo.transaction_amount ?? updated?.transaction_amount,
        payment_mode: orderInfo.payment_mode,
        payment_details: orderInfo.payment_details,
        bank_reference: orderInfo.bank_reference,
        payment_message: orderInfo.payment_message,
        status: orderInfo.status,
        error_message: orderInfo.error_message,
        payment_time: orderInfo.payment_time ? new Date(orderInfo.payment_time) : new Date(),
        // ADDED: Update custom_order_id if not already set
        custom_order_id: collectRequestId,
        updatedAt: new Date(),
      },
      { new: true, upsert: false } // CHANGED: Don't create if not found (upsert: false)
    );

    if (!updated) {
      console.error(`OrderStatus not found for collect_request_id: ${collectRequestId}`);
      return res.status(404).json({ 
        message: "Order not found", 
        collect_request_id: collectRequestId 
      });
    }

    console.log(`Webhook processed successfully for collect_request_id: ${collectRequestId}`);
    return res.status(200).json({ 
      message: "Webhook processed successfully",
      updated_record_id: updated._id
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
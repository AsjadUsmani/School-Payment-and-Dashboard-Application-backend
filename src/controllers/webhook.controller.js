import WebhookLog from "../models/webhookLog.model.js";
import OrderStatus from "../models/orderStatus.model.js";

export const handleWebhook = async (req, res) => {
  try {
    const payload = req.body;

    // Save entire payload
    await WebhookLog.create({ payload });

    const orderInfo = payload.order_info;
    const collectId = orderInfo.order_id;

    const updated = await OrderStatus.findOneAndUpdate(
      { collect_id: collectId },
      {
        order_amount: orderInfo.order_amount,
        transaction_amount: orderInfo.transaction_amount,
        payment_mode: orderInfo.payment_mode,
        payment_details: orderInfo.payment_details,
        bank_reference: orderInfo.bank_reference,
        payment_message: orderInfo.payment_message,
        status: orderInfo.status,
        error_message: orderInfo.error_message,
        payment_time: orderInfo.payment_time
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

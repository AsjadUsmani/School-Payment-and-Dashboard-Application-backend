import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    school_id: {
      type: String,
      required: true,
    },
    trustee_id: {
      type: String,
      required: true,
    },
    student_info: {
      name: String,
      id: String,
      email: String,
    },
    gateway_name: { type: String, required: true },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;

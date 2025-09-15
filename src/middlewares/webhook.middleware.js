import { body, validationResult } from "express-validator";

export const validateWebhook = [
  body("status").isNumeric().withMessage("Webhook status must be a number"),
  body("order_info").isObject().withMessage("order_info is required and must be an object"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

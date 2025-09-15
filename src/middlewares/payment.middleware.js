import { body, validationResult } from "express-validator";

export const validateCreatePayment = [
  body("amount").isNumeric().withMessage("Amount must be a number"),
  body("callback_url").isURL().withMessage("callback_url must be a valid URL"),
  body("school_id").notEmpty().withMessage("school_id is required"),
  body("trustee_id").notEmpty().withMessage("trustee_id is required"),
  body("student_info").isObject().withMessage("student_info must be an object"),
  body("gateway_name").notEmpty().withMessage("gateway_name is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
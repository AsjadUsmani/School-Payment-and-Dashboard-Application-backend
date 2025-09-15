import jwt from "jsonwebtoken";

const genToken = (user_id, email) => {
    const token = jwt.sign({id: user_id, email}, process.env.JWT_SECRET, {
    expiresIn: "1h"
  });
    return token
}

export default genToken;
import { config } from "dotenv";
config();
export default {
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: "1d",
  },
};

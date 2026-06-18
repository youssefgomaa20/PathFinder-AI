import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

type JwtPayload = {
  userId: string;
  email: string;
  name: string;
};

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, env.JWT_SECRET) as JwtPayload;

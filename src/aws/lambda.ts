import { handle } from "hono/aws-lambda";
import app from "./server/index";

export const handler = handle(app);

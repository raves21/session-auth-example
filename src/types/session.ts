import { Request } from "express";
import { Session } from "./database";

export type RequestWithPayload = Request & {
  session: Session;
};

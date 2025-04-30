import { Request, Response, NextFunction } from "express";
import { sessions } from "../database";
import { RequestWithPayload } from "../types/session";

export function verifySessionToken(
  _: Request,
  res: Response,
  next: NextFunction
) {
  const req = _ as RequestWithPayload;

  //get token in cookies
  const tokenInCookies = req.cookies?.sessionToken;

  if (!tokenInCookies) {
    res.status(401).json({ message: "No sessionToken in cookies!" });
    return;
  }

  //if naa, check sessions table in database if naa didto ang token na naa sa cookies
  const foundSession = sessions.find(
    (session) => session.token === tokenInCookies
  );

  if (!foundSession) {
    res.status(404).json({ error: "Session not found!" });
    res.clearCookie("sessionToken", { httpOnly: true });
    return;
  }

  req.session = foundSession;

  req.session = foundSession;
  next();
}

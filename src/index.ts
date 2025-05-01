import express from "express";
import { Request, Response } from "express";
import cookieParser from "cookie-parser";
import { users, sessions } from "./database";
import { Session } from "./types/database";
import { verifySessionToken } from "./middleware/verifySessionToken";
import { RequestWithPayload } from "./types/session";

function getRandomString(length = 10) {
  return Math.random()
    .toString(36)
    .slice(2, 2 + length);
}

const app = express();
const PORT = 8787;

//middleware for cookies
app.use(cookieParser());

//middleware for json
app.use(express.json());

//session auth UNPROTECTED routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome" });
});

app.post("/api/delete-users-and-sessions", (req, res) => {
  users.length = 0;
  res.json({ message: "all users and sessions deleted." });
});

app.get("/api/unprotected/users", (req, res) => {
  res.json(users);
});

app.get("/api/unprotected/sessions", (req, res) => {
  res.json(sessions);
});

app.post("/api/register", (req, res) => {
  const { email, password, name } = req.body;
  const newUser: User = { 
                id: getRandomString(), 
                email, password, 
                name 
                }
  users.push(newUser);
  res.status(201).json({ message: "Successfully created account." });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const foundUser = users.find(
    (user) => user.email === email && user.password === password
  );

  if (!foundUser) {
    res.status(404).json({ error: "User not found!" });
    return;
  }

  const sessionToken = getRandomString();

  const newSession: Session = {
    id: getRandomString(),
    token: sessionToken,
    user: foundUser,
  };
  sessions.push(newSession);
  res.cookie("sessionToken", sessionToken, {
    httpOnly: true,
    maxAge: 30 * 1000, //30 seconds in milliseconds
  });
  res.json({
    welcome: "You are logged in!",
    data: {
      session: newSession,
    },
  });
});

//apply session auth middleware
app.use(verifySessionToken);

//session auth PROTECTED ROUTES

app.get("/api/me", (_: Request, res: Response) => {
  const req = _ as RequestWithPayload;
  res.json(req.session.user);
});

app.get("/api/users", (req, res) => {
  res.json({ data: users });
});

app.get("/api/my-sessions", (_: Request, res: Response) => {
  const req = _ as RequestWithPayload;

  const currentUserSessions = req.sessions.filter(
    (session) => session.user.id === req.session.user.id
  );
  res.json({ data: currentUserSessions });
});

app.post("/api/logout", (_: Request, res: Response) => {
  const req = _ as RequestWithPayload;
  //access user attached in request
  const user = req.session.user;

  //delete user's session
  const sessionIndex = sessions.findIndex(
    (session) => session.user.id === user.id
  );
  sessions.splice(sessionIndex, 1);

  //clear cookie
  res.clearCookie("sessionToken", {
    httpOnly: true,
  });

  res.json({ message: "Successfully logged out." });
});

app.listen(PORT, () => console.log(`SERVER LISTENING ON PORT ${PORT}`));

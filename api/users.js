const express = require("express");
const usersRouter = express.Router();

const {
  getUserByUsername,
  createUser,
  getUser,
  getPublicRoutinesByUser,
} = require("../db");

const { requireUser } = require("./utils");

const jwt = require("jsonwebtoken");

const { JWT_SECRET } = process.env;

usersRouter.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const queriedUser = await getUserByUsername(username);
    if (queriedUser) {
      res.status(401);
      next({ message: "This username already exists" });
    } else if (password.length < 8) {
      res.status(401);
      next({ message: "Password needs to be at least 8 digits" });
    } else {
      const user = await createUser({ username, password });
      if (!user) {
        next({ message: "Error creating user" });
      } else {
        const token = jwt.sign(
          { id: user.id, username: user.username },
          process.env.JWT_SECRET
        );
        res.send({
          user,
          message: "Your account has been created!",
          token,
        });
      }
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    next({ message: "Missing Username or Password" });
  }
  try {
    const user = await getUser({ username, password });
    if (!user) {
      next({ message: "Incorrect Username or Password!" });
    } else {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET
      );
      res.send({
        user,
        message: "You are logged in!",
        token,
      });
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me", requireUser, (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:username/routines", async (req, res, next) => {
  const { username } = req.params;
  try {
    const routines = await getPublicRoutinesByUser({ username });
    res.send(routines);
  } catch (error) {
    next(error);
  }
});
module.exports = usersRouter;

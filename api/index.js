// create an api router
// attach other routers from files in this api directory (users, activities...)
// export the api router

const express = require("express");
const apiRouter = express.Router();
const { getUserById } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

apiRouter.get("/health", async (req, res) => {
  const message = "I am healthy";
  res.send({
    message,
  });
});

// apiRouter.get("/health", async (req, res) => {

//   res.send({
//     message: "I am healthy",
//   });
// });

// set `req.user` if possible
apiRouter.use(async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");
  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);
    try {
      const parsedToken = jwt.verify(token, JWT_SECRET);
      const id = parsedToken && parsedToken.id;
      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

const usersRouter = require("./users");
apiRouter.use("/users", usersRouter);

// const healthRouter = require("./health");
// apiRouter.use("/health", healthRouter);

const routinesRouter = require("./routines");
apiRouter.use("/routines", routinesRouter);

const activitiesRouter = require("./activities");
apiRouter.use("/activities", activitiesRouter);

const routine_activitiesRouter = require("./routine_activities");
apiRouter.use("/routine_activities", routine_activitiesRouter);

module.exports = apiRouter;

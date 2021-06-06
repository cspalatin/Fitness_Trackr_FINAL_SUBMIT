const express = require("express");

const {
  getRoutineById,
  createRoutine,
  updateRoutine,
  destroyRoutine,
  getRoutineActivitiesByRoutine,
  getAllPublicRoutines,
  addActivityToRoutine,
} = require("../db");

const { requireUser } = require("./utils");

const routinesRouter = express.Router();

routinesRouter.get("/", async (req, res, next) => {
  try {
    const routines = await getAllPublicRoutines();
    res.send(routines);
  } catch (error) {
    throw error;
  }
});

routinesRouter.post("/", requireUser, async (req, res, next) => {
  const { name, goal, isPublic } = req.body;
  const id = req.user.id;
  try {
    const newRoutine = await createRoutine({
      creatorId: id,
      isPublic,
      name,
      goal,
    });
    if (newRoutine) {
      res.send(newRoutine);
    } else {
      next({
        message: "Routine already exists",
      });
    }
  } catch (error) {
    throw error;
  }
});

routinesRouter.patch("/:routineId", requireUser, async (req, res, next) => {
  const { name, goal, isPublic } = req.body;
  const { routineId } = req.params;

  try {
    const updatedRoutine = await updateRoutine({
      id: routineId,
      name,
      goal,
      isPublic,
    });
    res.send(updatedRoutine);
  } catch (error) {
    throw error;
  }
});

routinesRouter.delete("/:routineId", requireUser, async (req, res, next) => {
  try {
    const { routineId } = req.params;
    const routine = await getRoutineById(routineId);
    if (routine.creatorId === req.user.id) {
      const destroyedRoutine = await destroyRoutine(routineId);
      res.send(destroyedRoutine);
    } else {
      next();
    }
  } catch (error) {
    throw error;
  }
});

routinesRouter.post("/:routineId/activities", async (req, res, next) => {
  try {
    const { routineId } = req.params;
    const { activityId, count, duration } = req.body;

    const routineActivities = await getRoutineActivitiesByRoutine({
      id: routineId,
    });
    const filteredActivities = routineActivities.filter((routine) => {
      return activityId === routine.activityId;
    });
    if (filteredActivities.length > 0) {
      next({
        message: "Activity already exists bro",
      });
    } else {
      const addedActivity = await addActivityToRoutine({
        routineId,
        activityId,
        count,
        duration,
      });
      res.send(addedActivity);
    }
  } catch (error) {
    throw error;
  }
});

module.exports = routinesRouter;

const express = require("express");
const routine_activitiesRouter = express.Router();

const {
  getRoutineActivityById,
  getRoutineById,
  updateRoutineActivity,
  destroyRoutineActivity,
} = require("../db");

routine_activitiesRouter.patch(
  "/:routineActivityId",
  async (req, res, next) => {
    const { count, duration } = req.body;
    const id = req.params.routineActivityId;

    try {
      const routineActivity = await getRoutineActivityById(id);
      const routine = await getRoutineById(routineActivity.routineId);

      if (req.user.id !== routine.creatorId) {
        next({ name: "Must be user!" });
      } else {
        const updatedRoutineAct = await updateRoutineActivity({
          id,
          count,
          duration,
        });
        if (updatedRoutineAct) {
          res.send(updatedRoutineAct);
        } else {
          next({ name: "Routine doesn't exist" });
        }
      }
    } catch (error) {
      throw error;
    }
  }
);

routine_activitiesRouter.delete(
  "/:routineActivityId",
  async (req, res, next) => {
    const { routineActivityId } = req.params;
    try {
      const routineActivity = await getRoutineActivityById(routineActivityId);
      const routine = await getRoutineById(routineActivity.routineId);

      if (routine.creatorId === req.user.id) {
        const destroyActivity = await destroyRoutineActivity(routineActivityId);
        res.send(destroyActivity);
      } else {
        next({ message: "Error!" });
      }
    } catch ({ message }) {
      next({ message });
    }
  }
);

module.exports = routine_activitiesRouter;

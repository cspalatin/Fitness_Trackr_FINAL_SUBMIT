const express = require("express");
const {
  getAllActivities,
  createActivity,
  updateActivity,
  getPublicRoutinesByActivity,
  getAllPublicRoutines,
} = require("../db");

const { requireUser } = require("./utils");

const activitiesRouter = express.Router();

activitiesRouter.get("/", async (req, res, next) => {
  try {
    const activities = await getAllActivities();
    res.send(activities);
  } catch (error) {
    throw error;
  }
});

activitiesRouter.post("/", requireUser, async (req, res, next) => {
  const { name, description } = req.body;
  const activityData = {};
  try {
    activityData.name = name;
    activityData.description = description;

    const activity = await createActivity(activityData);
    res.send(activity);
  } catch (error) {
    throw error;
  }
});

activitiesRouter.patch("/:activityId", requireUser, async (req, res, next) => {
  const { name, description } = req.body;
  const { activityId } = req.params;

  try {
    const updatedActivity = await updateActivity({
      id: activityId,
      name,
      description,
    });
    res.send(updatedActivity);
  } catch (error) {
    throw error;
  }
});

activitiesRouter.get("/:activityId/routines", async (req, res, next) => {
  const { activityId } = req.params;

  try {
    const routines = await getPublicRoutinesByActivity({
      id: activityId,
    });
    res.send(routines);
  } catch (error) {
    throw error;
  }
});

module.exports = activitiesRouter;

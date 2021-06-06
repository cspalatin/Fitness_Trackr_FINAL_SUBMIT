const client = require("./client");

const { attachActivitiesToRoutines } = require("./activities");
const util = require("./util");

async function getRoutineActivityById(id) {
  try {
    const {
      rows: [routineActivity],
    } = await client.query(
      `
      SELECT * FROM routine_activities
      WHERE id=$1
    `,
      [id]
    );

    return routineActivity;
  } catch (error) {
    console.error("Error getting routine_activity by id!");
    throw error;
  }
}

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const {
      rows: [routineActivity],
    } = await client.query(
      `
      INSERT INTO routine_activities ("routineId", "activityId", count, duration)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `,
      [routineId, activityId, count, duration]
    );
    return routineActivity;
  } catch (error) {
    throw error;
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  try {
    const toUpdate = {};
    for (let column in fields) {
      if (fields[column] !== undefined) toUpdate[column] = fields[column];
    }
    let routineActivity;
    if (util.dbFields(fields).insert.length > 0) {
      const { rows } = await client.query(
        `
          UPDATE routine_activities 
          SET ${util.dbFields(toUpdate).insert}
          WHERE id=${id}
          RETURNING *;
      `,
        Object.values(toUpdate)
      );
      routineActivity = rows[0];
      return routineActivity;
    }
  } catch (error) {
    throw error;
  }
}
async function destroyRoutineActivity(id) {
  try {
    const {
      rows: [routineActivity],
    } = await client.query(
      `
      DELETE FROM routine_activities
      WHERE id=$1
      RETURNING *;
      `,
      [id]
    );

    return routineActivity;
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows: routine_activity } = await client.query(
      `
      SELECT *
      FROM routine_activities
      WHERE "routineId"=$1;
      `,
      [id]
    );
    return routine_activity;
  } catch (error) {
    throw error;
  }
}

// ON CONFLICT ("routineId", "activityId") DO NOTHING -- don't need as it's in seed data

module.exports = {
  client,
  getRoutineActivityById,
  addActivityToRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  getRoutineActivitiesByRoutine,
};

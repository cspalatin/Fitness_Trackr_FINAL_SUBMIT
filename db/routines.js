const client = require("./client");

const { attachActivitiesToRoutines } = require("./activities");
const util = require("./util");

async function getRoutineById(id) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
      SELECT * 
      FROM routines
      WHERE id=$1;
    `,
      [id]
    );

    return routine;
  } catch (error) {
    console.error("Error getting routine by id!");
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows } = await client.query(`
      SELECT * 
      FROM routines;
      `);

    return rows;
  } catch (error) {
    console.error("Error getting routines without activities!");
    throw error;
  }
}

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId"=users.id;
      `);

    return attachActivitiesToRoutines(routines);
  } catch (error) {
    console.error("Error getting routines without activities!");
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: routines } = await client.query(`
    SELECT *, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId"=users.id
    WHERE "isPublic"=true;
  `);
    const { rows: activities } = await client.query(`
    SELECT * FROM routine_activities
  `);
    routines.forEach((routine) => {
      routine.activities = activities.filter((a) => routine.id === a.routineId);
    });
    return routines;
  } catch (error) {
    console.error("Error getting all public routines!");
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const routines = await getAllRoutines();
    return routines.filter((routine) => routine.creatorName === username);
  } catch (error) {
    console.error("Error getting all routines by user!");
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const routines = await getAllRoutines();
    return routines.filter(
      (routine) => routine.creatorName === username && routine.isPublic
    );
  } catch (error) {
    console.error("Error getting all public routines by user!");
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: routines } = await client.query(`
            SELECT routines.*, users.username AS "creatorName"
            FROM routines
            JOIN users ON routines."creatorId"=users.id
            WHERE "isPublic"=true;
            `);
    return await attachActivitiesToRoutines(routines);
  } catch (err) {
    console.error("Unable to get public routines by activity!");
    throw err;
  }
}

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
    INSERT INTO routines("creatorId", "isPublic", name, goal)
    VALUES($1, $2, $3, $4)
    RETURNING *;
  `,
      [creatorId, isPublic, name, goal]
    );

    return routine;
  } catch (error) {
    console.error("Error creating routine!");
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  try {
    const toUpdate = {};
    for (let column in fields) {
      if (fields[column] !== undefined) toUpdate[column] = fields[column];
    }
    let routine;
    if (util.dbFields(fields).insert.length > 0) {
      const { rows } = await client.query(
        `
          UPDATE routines 
          SET ${util.dbFields(toUpdate).insert}
          WHERE id=${id}
          RETURNING *;
      `,
        Object.values(toUpdate)
      );
      routine = rows[0];
      return routine;
    }
  } catch (error) {
    throw error;
  }
}

async function destroyRoutine(id) {
  try {
    const routineId = getRoutineById(id);
    if (!routineId) {
      throw { message: "Error this routine doesnt exist" };
    }
    await client.query(
      `
      DELETE FROM routine_activities
      WHERE "routineId"=$1
      RETURNING *;
      `,
      [id]
    );
    const {
      rows: [routine],
    } = await client.query(
      `
      DELETE FROM routines
      WHERE id=$1
      RETURNING *;
    `,
      [id]
    );

    return routine;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  createRoutine,
  updateRoutine,
  destroyRoutine,
  attachActivitiesToRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
};

const client = require("./client");
const bcrypt = require("bcrypt");
const SALT_COUNT = 10;

async function createUser({ username, password }) {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
    const {
      rows: [user],
    } = await client.query(
      `
      INSERT INTO users(username, password)
      VALUES($1, $2)
      ON CONFLICT (username) DO NOTHING
      RETURNING id, username
    `,
      [username, hashedPassword]
    );

    return user;
  } catch (error) {
    console.error("Error creating user!");
    throw error;
  }
}

async function getUser({ username, password }) {
  const user = await getUserByUsername(username);
  const hashedPassword = user.password;
  try {
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    if (passwordMatch === true) {
      delete user.password;
      return user;
    }
  } catch (err) {
    throw err;
  }
}

async function getUserById(id) {
  try {
    const {
      rows: [user],
    } = await client.query(`
      SELECT * FROM users
      WHERE id = '${id}';
    `);
    delete user.password;
    return user;
  } catch (error) {
    console.error("Error getting user by id!");
    throw error;
  }
}

async function getUserByUsername(username) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT * FROM users
      WHERE username = $1;
    `,
      [username]
    );
    return user;
  } catch (error) {
    console.error("Error getting user by username!");
    throw error;
  }
}

module.exports = {
  client,
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};

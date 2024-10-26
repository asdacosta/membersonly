const pool = require("../db/Pool");

async function addUser(firstName, lastName, email, password) {
  await pool.query(
    "INSERT INTO users (first_name, last_name, username, password) VALUES ($1, $2, $3, $4)",
    [firstName, lastName, email, password]
  );
}

async function findUser(user) {
  const { rows } = await pool.query(
    "SELECT username FROM users WHERE username = $1",
    [user]
  );
  const username = rows[0];
  return username;
}

async function findAllUserData(username) {
  const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  const user = rows[0];
  return user;
}

async function findUserWithId(id) {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  const user = rows[0];
  return user;
}

async function updateMembership(username) {
  const { rows } = await pool.query(
    "SELECT membership_status FROM users WHERE username = $1",
    [username]
  );
  const membership_status = rows[0];
  if (membership_status === "active") return false;

  await pool.query(
    "UPDATE users SET membership_status = 'active' WHERE username = $1 ",
    [username]
  );
  return true;
}

async function checkMembership(username) {
  const { rows } = await pool.query(
    "SELECT membership_status FROM users WHERE username = $1",
    [username]
  );
  const user = rows[0];
  return user.membership_status === "active";
}

async function addMessage(name, title, text) {
  const { rows } = await pool.query(
    "SELECT id FROM users WHERE username = $1",
    [name]
  );
  const id = rows[0]?.id;
  if (!id) throw new Error("User ID not found");

  await pool.query(
    "INSERT INTO messages (user_id, title, text) VALUES ($1, $2, $3)",
    [id, title, text]
  );
}

async function retrieveMessages() {
  const { rows } = await pool.query("SELECT title, text, time FROM messages");
  return rows;
}

module.exports = {
  addUser,
  findUser,
  updateMembership,
  findAllUserData,
  findUserWithId,
  checkMembership,
  addMessage,
  retrieveMessages,
};

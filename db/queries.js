const pool = require("./db/Pool");

async function addUser(firstName, lastName, email, password) {
  await pool.query(
    "INSERT INTO users (first_name, last_name, username, password) VALUES ($1, $2, $3, $4)",
    [firstName, lastName, email, password]
  );
}

async function findUser(username) {
  const { rows } = await pool.query(
    "SELECT username FROM users WHERE username = $1",
    [username]
  );
  const { username } = rows[0];
  return username;
}

module.exports = {
  addUser,
  findUser,
};

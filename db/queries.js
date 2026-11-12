const pool = require("./pool");

const USER_COLUMNS = `
  id,
  first_name AS "firstName",
  last_name AS "lastName",
  username,
  is_member AS "isMember",
  is_admin AS "isAdmin"
`;

// ---------- Users ----------
async function createUser({ firstName, lastName, username, passwordHash }) {
  const { rows } = await pool.query(
    `INSERT INTO users (first_name, last_name, username, password)
     VALUES ($1, $2, $3, $4)
     RETURNING ${USER_COLUMNS}`,
    [firstName, lastName, username, passwordHash],
  );
  return rows[0];
}

// Includes the password hash. Only the login check should use this.
async function findUserByUsername(username) {
  const { rows } = await pool.query(
    `SELECT ${USER_COLUMNS}, password
     FROM users
     WHERE lower(username) = lower($1)`,
    [username],
  );
  return rows[0];
}

async function findUserById(id) {
  const { rows } = await pool.query(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
    [id],
  );
  return rows[0];
}

async function makeMember(id) {
  await pool.query("UPDATE users SET is_member = TRUE WHERE id = $1", [id]);
}

async function makeAdmin(id) {
  await pool.query(
    "UPDATE users SET is_admin = TRUE, is_member = TRUE WHERE id = $1",
    [id],
  );
}

// ---------- Messages ----------
// Visitors never get author or date columns, so they cannot leak.
async function getMessages({ withAuthors }) {
  if (withAuthors) {
    const { rows } = await pool.query(`
      SELECT m.id, m.title, m.body,
             m.created_at AS "createdAt",
             u.first_name || ' ' || u.last_name AS author
      FROM messages m
      JOIN users u ON u.id = m.user_id
      ORDER BY m.created_at DESC
      LIMIT 200
    `);
    return rows;
  }

  const { rows } = await pool.query(`
    SELECT id, title, body
    FROM messages
    ORDER BY created_at DESC
    LIMIT 200
  `);
  return rows;
}

async function createMessage({ title, body, userId }) {
  await pool.query(
    "INSERT INTO messages (title, body, user_id) VALUES ($1, $2, $3)",
    [title, body, userId],
  );
}

async function deleteMessage(id) {
  const { rowCount } = await pool.query("DELETE FROM messages WHERE id = $1", [
    id,
  ]);
  return rowCount > 0;
}

module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
  makeMember,
  makeAdmin,
  getMessages,
  createMessage,
  deleteMessage,
};

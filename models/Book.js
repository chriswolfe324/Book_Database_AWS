const pool = require('../db');

async function createBook({ title, authorFirst, authorLast, pages, genre, dateFinished, format, userId }) {
  const result = await pool.query(
    `INSERT INTO books
      (title, author_first, author_last, pages, genre, date_finished, format, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [title, authorFirst, authorLast, pages, genre, dateFinished, format, userId]
  );
  return result.rows[0];
}

async function getBooksByUser(userId) {
  const result = await pool.query(
    `SELECT * FROM books
     WHERE user_id = $1
     ORDER BY date_finished DESC, id DESC`,
    [userId]
  );
  return result.rows;
}

async function getBookById(id) {
  const result = await pool.query(
    'SELECT * FROM books WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function updateBook(id, { title, authorFirst, authorLast, pages, genre, dateFinished, format }) {
  const result = await pool.query(
    `UPDATE books
     SET title = $1,
         author_first = $2,
         author_last = $3,
         pages = $4,
         genre = $5,
         date_finished = $6,
         format = $7
     WHERE id = $8
     RETURNING *`,
    [title, authorFirst, authorLast, pages, genre, dateFinished, format, id]
  );
  return result.rows[0];
}

async function deleteBook(id) {
  await pool.query(
    'DELETE FROM books WHERE id = $1',
    [id]
  );
}

module.exports = {
  createBook,
  getBooksByUser,
  getBookById,
  updateBook,
  deleteBook
};
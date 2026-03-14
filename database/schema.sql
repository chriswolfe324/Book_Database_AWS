CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author_first TEXT,
  author_last TEXT,
  pages INTEGER,
  genre TEXT,
  date_finished DATE,
  format TEXT,
  user_id INTEGER REFERENCES users(id)
);

CREATE INDEX idx_users_username
ON users (username);

CREATE INDEX idx_books_user_title
ON books (user_id, title);

CREATE INDEX idx_books_user_genre
ON books (user_id, genre);

CREATE INDEX idx_books_user_date
ON books (user_id, date_finished DESC);
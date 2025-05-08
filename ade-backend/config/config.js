// config/config.js
require('dotenv').config(); // charge ton .env

module.exports = {
  development: {
    username: process.env.DB_USER   || 'root',
    password: process.env.DB_PASS   || null,
    database: process.env.DB_NAME   || 'Diseases_DB',
    host:     process.env.DB_HOST   || '127.0.0.1',
    port:     process.env.DB_PORT   || 3306,
    dialect:  'mysql',
  },
  test: {
    username: process.env.DB_USER   || 'root',
    password: process.env.DB_PASS   || null,
    database: process.env.DB_NAME   || 'Diseases_DB_test',
    host:     process.env.DB_HOST   || '127.0.0.1',
    port:     process.env.DB_PORT   || 3306,
    dialect:  'mysql',
  },
  production: {
    username: process.env.DB_USER   || 'root',
    password: process.env.DB_PASS   || null,
    database: process.env.DB_NAME   || 'Diseases_DB_prod',
    host:     process.env.DB_HOST   || '127.0.0.1',
    port:     process.env.DB_PORT   || 3306,
    dialect:  'mysql',
  }
};


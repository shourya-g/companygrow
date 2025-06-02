const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL ||
  `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
const schemaPath = path.join(__dirname, 'companygrow_schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

const client = new Client({ connectionString });

client.connect()
  .then(() => client.query(schema))
  .then(() => {
    console.log('Migration complete!');
    return client.end();
  })
  .catch(err => {
    console.error('Migration failed:', err);
    client.end();
    process.exit(1);
  });

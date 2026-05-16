const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT,
    logging: false,
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
      ssl: {
        rejectUnauthorized: false
      }
    },
    timezone: '+05:30'
  }
);

// Fix MySQL strict mode for zero dates after connection
const originalAuthenticate = sequelize.authenticate.bind(sequelize);
sequelize.authenticate = async function() {
  await originalAuthenticate();
  try {
    await sequelize.query("SET GLOBAL sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'");
    await sequelize.query("SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'");
  } catch(e) {
    // Silently ignore if no SUPER privilege
  }
};

module.exports = sequelize;

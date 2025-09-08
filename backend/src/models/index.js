const Sequelize = require("sequelize");
const sequelize = require("../config/database");


const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// add models here
// db.User = require("./User")(sequelize, Sequelize.DataTypes);
db.Story = require("./Story");
db.Character = require("./Character");
db.Style = require("./Style");

module.exports = db;


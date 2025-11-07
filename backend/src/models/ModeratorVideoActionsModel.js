// // models/ModeratorVideoActions.js
// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");

// const ModeratorVideoActions = sequelize.define(
//   "ModeratorVideoActions",
//   {
//     action_id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     video_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     action: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//       comment: 'delete, ban, suspend, warn'
//     },
//     reason: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//     },
//     report_id: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//       references: {
//         model: "video_reports",
//         key: "report_id",
//       },
//       onUpdate: "CASCADE",
//       onDelete: "SET NULL",
//     },
//     deleted_by: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: "users",
//         key: "user_id",
//       },
//       onUpdate: "CASCADE",
//       onDelete: "CASCADE",
//     },
//     created_at: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.NOW,
//     },
//   },
//   {
//     tableName: "moderator_video_actions",
//     timestamps: false,
//     indexes: [
//       { fields: ["video_id"] },
//       { fields: ["created_at"] },
//     ],
//   }
// );

// module.exports = ModeratorVideoActions;

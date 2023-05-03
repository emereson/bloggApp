const { DataTypes } = require('sequelize');
const { db } = require('../dataBase/config');

const Comment = db.define('comment', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  Text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'disabled'),
    defaultValue: 'active',
  },
});

module.exports = Comment;

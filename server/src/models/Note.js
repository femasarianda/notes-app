const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Untitled',
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'notes',
  timestamps: true,
});

module.exports = Note;
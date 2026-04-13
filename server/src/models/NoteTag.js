const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NoteTag = sequelize.define('NoteTag', {
  noteId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  tagId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'note_tags',
  timestamps: false,
});

module.exports = NoteTag;
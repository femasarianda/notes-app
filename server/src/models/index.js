const { sequelize } = require('../config/database');
const User = require('./User');
const Note = require('./Note');
const Tag = require('./Tag');
const NoteTag = require('./NoteTag');

// User -> Notes (one to many)
User.hasMany(Note, { foreignKey: 'userId', onDelete: 'CASCADE' });
Note.belongsTo(User, { foreignKey: 'userId' });

// User -> Tags (one to many)
User.hasMany(Tag, { foreignKey: 'userId', onDelete: 'CASCADE' });
Tag.belongsTo(User, { foreignKey: 'userId' });

// Note <-> Tag (many to many through NoteTag)
Note.belongsToMany(Tag, { through: NoteTag, foreignKey: 'noteId' });
Tag.belongsToMany(Note, { through: NoteTag, foreignKey: 'tagId' });

// Sync semua table ke Supabase
// alter: true → update table kalau ada perubahan, tanpa hapus data
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ All tables synced to Supabase');
  } catch (error) {
    console.error('❌ Failed to sync tables:', error.message);
  }
};

module.exports = { User, Note, Tag, NoteTag, syncDatabase };
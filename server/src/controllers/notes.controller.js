const { Note, Tag } = require('../models/index');
const { Op } = require('sequelize');

// GET /api/notes
const getNotes = async (req, res) => {
  try {
    const { search, tag, pinned, trash } = req.query;
    const userId = req.user.id;

    const where = {
      userId,
      isDeleted: trash === 'true' ? true : false,
    };

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { body: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (pinned === 'true') where.isPinned = true;

    const notes = await Note.findAll({
      where,
      include: [{
        model: Tag,
        through: { attributes: [] },
        ...(tag ? { where: { id: tag } } : {}),
      }],
      order: [
        ['isPinned', 'DESC'],
        ['updatedAt', 'DESC'],
      ],
    });

    res.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/notes
const createNote = async (req, res) => {
  try {
    const { title, body, tagIds } = req.body;
    const userId = req.user.id;

    const note = await Note.create({
      title: title || 'Untitled',
      body: body || '',
      userId,
    });

    if (tagIds && tagIds.length > 0) {
      const tags = await Tag.findAll({ where: { id: tagIds, userId } });
      await note.setTags(tags);
    }

    const noteWithTags = await Note.findByPk(note.id, {
      include: [{ model: Tag, through: { attributes: [] } }],
    });

    res.status(201).json({ note: noteWithTags });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/notes/:id
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, tagIds } = req.body;
    const userId = req.user.id;

    const note = await Note.findOne({ where: { id, userId } });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    await note.update({ title, body });

    if (tagIds !== undefined) {
      const tags = await Tag.findAll({ where: { id: tagIds, userId } });
      await note.setTags(tags);
    }

    const updated = await Note.findByPk(id, {
      include: [{ model: Tag, through: { attributes: [] } }],
    });

    res.json({ note: updated });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/notes/:id — soft delete ke trash
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const note = await Note.findOne({ where: { id, userId } });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    await note.update({ isDeleted: true, deletedAt: new Date() });

    res.json({ message: 'Note moved to trash' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PATCH /api/notes/:id/pin
const pinNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const note = await Note.findOne({ where: { id, userId } });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    await note.update({ isPinned: !note.isPinned });

    res.json({ note });
  } catch (error) {
    console.error('Pin note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PATCH /api/notes/:id/restore
const restoreNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const note = await Note.findOne({ where: { id, userId, isDeleted: true } });
    if (!note) return res.status(404).json({ message: 'Note not found in trash' });

    await note.update({ isDeleted: false, deletedAt: null });

    res.json({ message: 'Note restored', note });
  } catch (error) {
    console.error('Restore note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/notes/:id/permanent — hapus permanen dari trash
const permanentDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const note = await Note.findOne({ where: { id, userId, isDeleted: true } });
    if (!note) return res.status(404).json({ message: 'Note not found in trash' });

    await note.destroy();

    res.json({ message: 'Note permanently deleted' });
  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  pinNote,
  restoreNote,
  permanentDelete,
};
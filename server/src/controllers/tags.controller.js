const { Tag, Note } = require('../models/index');

// GET /api/tags
const getTags = async (req, res) => {
  try {
    const userId = req.user.id;
    const tags = await Tag.findAll({
      where: { userId },
      order: [['name', 'ASC']],
    });
    res.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/tags
const createTag = async (req, res) => {
  try {
    const { name, color } = req.body;
    const userId = req.user.id;

    if (!name) return res.status(400).json({ message: 'Tag name is required' });

    const existing = await Tag.findOne({ where: { name, userId } });
    if (existing) return res.status(409).json({ message: 'Tag already exists' });

    const tag = await Tag.create({ name, color: color || '#6366f1', userId });
    res.status(201).json({ tag });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/tags/:id
const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const userId = req.user.id;

    const tag = await Tag.findOne({ where: { id, userId } });
    if (!tag) return res.status(404).json({ message: 'Tag not found' });

    await tag.update({ name, color });
    res.json({ tag });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/tags/:id
const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const tag = await Tag.findOne({ where: { id, userId } });
    if (!tag) return res.status(404).json({ message: 'Tag not found' });

    await tag.destroy();
    res.json({ message: 'Tag deleted' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getTags, createTag, updateTag, deleteTag };
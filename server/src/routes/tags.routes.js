const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getTags, createTag, updateTag, deleteTag } = require('../controllers/tags.controller');

router.use(authenticate);

router.get('/', getTags);
router.post('/', createTag);
router.put('/:id', updateTag);
router.delete('/:id', deleteTag);

module.exports = router;
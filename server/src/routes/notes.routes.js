const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  pinNote,
  restoreNote,
  permanentDelete,
} = require('../controllers/notes.controller');

router.use(authenticate); // semua notes route butuh login

router.get('/', getNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.patch('/:id/pin', pinNote);
router.patch('/:id/restore', restoreNote);
router.delete('/:id/permanent', permanentDelete);

module.exports = router;
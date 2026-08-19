const express = require('express');
const { getAllBooks, createBook, updateBook, deleteBook } = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllBooks);
router.post('/', authMiddleware, roleMiddleware(['admin', 'librarian']), createBook);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'librarian']), updateBook);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteBook);

module.exports = router;

const express = require('express');
const { getAllLoans, getMyLoans, issueBook, returnBook, reserveBook, renewLoan, updateFine } = require('../controllers/loanController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', roleMiddleware(['admin', 'librarian']), getAllLoans);
router.get('/mine', roleMiddleware(['lender']), getMyLoans);

router.post('/issue', roleMiddleware(['admin', 'librarian', 'lender']), issueBook);
router.post('/return', roleMiddleware(['admin', 'librarian', 'lender']), returnBook);
router.post('/reserve', roleMiddleware(['lender']), reserveBook);
router.put('/:id/fine', roleMiddleware(['admin', 'librarian']), updateFine);
router.put('/:id/renew', roleMiddleware(['lender', 'admin']), renewLoan);

module.exports = router;

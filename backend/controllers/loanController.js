const { Loan, Book, User } = require('../models');
const sequelize = require('../config/database');

const getAllLoans = async (req, res, next) => {
  try {
    const loans = await Loan.findAll({
      include: [
        { model: Book, attributes: ['id', 'title', 'author', 'isbn'] },
        { model: User, attributes: ['id', 'username', 'role'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: loans });
  } catch (error) {
    next(error);
  }
};

const getMyLoans = async (req, res, next) => {
  try {
    const loans = await Loan.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Book, attributes: ['id', 'title', 'author', 'isbn'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: loans });
  } catch (error) {
    next(error);
  }
};

const issueBook = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { book_id, user_id, due_date } = req.body;
    const targetUserId = req.user.role === 'lender' ? req.user.id : (user_id || req.user.id);

    if (!book_id) {
      await t.rollback();
      return res.status(400).json({ success: false, error: 'Book ID is required' });
    }

    const book = await Book.findByPk(book_id, { transaction: t, lock: true });
    if (!book || book.available_copies < 1) {
      await t.rollback();
      return res.status(400).json({ success: false, error: 'Book not available' });
    }

    const finalDueDate = due_date ? new Date(due_date) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const loan = await Loan.create({
      book_id,
      user_id: targetUserId,
      issue_date: new Date(),
      due_date: finalDueDate,
      status: 'active'
    }, { transaction: t });

    await book.decrement('available_copies', { by: 1, transaction: t });

    await t.commit();
    res.status(201).json({ success: true, data: loan });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const returnBook = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.body;
    const loanId = id || req.params.id;
    const loan = await Loan.findByPk(loanId, { transaction: t, lock: true });

    if (!loan || loan.status === 'returned') {
      await t.rollback();
      return res.status(400).json({ success: false, error: 'Invalid loan' });
    }

    const returnDate = new Date();
    let fineAmount = Number(loan.fine_amount || 0);

    if (loan.due_date && new Date(returnDate) > new Date(loan.due_date)) {
      const overdueDays = Math.max(1, Math.ceil((new Date(returnDate) - new Date(loan.due_date)) / (1000 * 60 * 60 * 24)));
      fineAmount = overdueDays * 5;
    }

    await loan.update({
      status: 'returned',
      return_date: returnDate,
      fine_amount: fineAmount
    }, { transaction: t });

    const book = await Book.findByPk(loan.book_id, { transaction: t });
    if (book) {
      await book.increment('available_copies', { by: 1, transaction: t });
    }

    await t.commit();
    res.json({ success: true, data: loan });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const reserveBook = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { book_id } = req.body;
    const user_id = req.user.id;

    const book = await Book.findByPk(book_id, { transaction: t, lock: true });
    if (!book || book.available_copies < 1) {
      await t.rollback();
      return res.status(400).json({ success: false, error: 'Book not available' });
    }

    const loan = await Loan.create({
      book_id,
      user_id,
      issue_date: new Date(),
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'reserved'
    }, { transaction: t });

    await book.decrement('available_copies', { by: 1, transaction: t });

    await t.commit();
    res.status(201).json({ success: true, data: loan });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const renewLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const loan = await Loan.findByPk(id);

    if (!loan || (loan.user_id !== req.user.id && req.user.role !== 'admin') || loan.status === 'returned') {
      return res.status(400).json({ success: false, error: 'Cannot renew this loan' });
    }

    const newDueDate = new Date(loan.due_date || new Date());
    newDueDate.setDate(newDueDate.getDate() + 14);

    await loan.update({ due_date: newDueDate, status: 'active' });
    res.json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

const updateFine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fine_amount } = req.body;

    const loan = await Loan.findByPk(id);
    if (!loan) return res.status(404).json({ success: false, error: 'Loan not found' });

    await loan.update({ fine_amount: Number(fine_amount || 0) });
    res.json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllLoans, getMyLoans, issueBook, returnBook, reserveBook, renewLoan, updateFine };

const { Book } = require('../models');

const getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.findAll();
    res.json({ success: true, data: books });
  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    await book.update(req.body);
    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    await book.destroy();
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllBooks, createBook, updateBook, deleteBook };

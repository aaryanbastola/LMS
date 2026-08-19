const User = require('./User');
const Book = require('./Book');
const Loan = require('./Loan');

// Define associations
Loan.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Loan, { foreignKey: 'user_id' });

Loan.belongsTo(Book, { foreignKey: 'book_id' });
Book.hasMany(Loan, { foreignKey: 'book_id' });

module.exports = {
  User,
  Book,
  Loan
};

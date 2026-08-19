import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const formatDate = (dateValue) => {
  if (!dateValue) return '—';
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

const emptyBook = {
  isbn: '',
  title: '',
  author: '',
  total_copies: 1,
  available_copies: 1,
  category: ''
};

const LibrarianDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [bookForm, setBookForm] = useState(emptyBook);

  useEffect(() => {
    fetchBooks();
    fetchLoans();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axiosClient.get('/books');
      setBooks(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch books', error);
    }
  };

  const fetchLoans = async () => {
    try {
      const res = await axiosClient.get('/loans');
      setLoans(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch loans', error);
    }
  };

  const resetBookForm = () => {
    setBookForm(emptyBook);
    setEditingBookId(null);
    setShowAddForm(false);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      if (editingBookId) {
        await axiosClient.put(`/books/${editingBookId}`, {
          ...bookForm,
          total_copies: Number(bookForm.total_copies),
          available_copies: Number(bookForm.available_copies)
        });
      } else {
        await axiosClient.post('/books', {
          ...bookForm,
          total_copies: Number(bookForm.total_copies),
          available_copies: Number(bookForm.available_copies)
        });
      }

      resetBookForm();
      await Promise.all([fetchBooks(), fetchLoans()]);
    } catch (error) {
      alert(error.response?.data?.error || 'Could not save book');
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      await axiosClient.delete(`/books/${bookId}`);
      await Promise.all([fetchBooks(), fetchLoans()]);
    } catch (error) {
      alert(error.response?.data?.error || 'Could not delete book');
    }
  };

  const handleIssueBook = async (bookId) => {
    try {
      await axiosClient.post('/loans/issue', { book_id: bookId });
      await Promise.all([fetchBooks(), fetchLoans()]);
    } catch (error) {
      alert(error.response?.data?.error || 'Could not issue book');
    }
  };

  const handleReturnBook = async (loanId) => {
    try {
      await axiosClient.post('/loans/return', { id: loanId });
      await Promise.all([fetchBooks(), fetchLoans()]);
    } catch (error) {
      alert(error.response?.data?.error || 'Could not return book');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Librarian Dashboard</h1>
            <p className="text-sm text-gray-500">Logged in as {user?.username}</p>
          </div>
          <button onClick={logout} className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50">Logout</button>
        </header>

        <main className="space-y-8">
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Book Catalog</h2>
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  if (editingBookId) resetBookForm();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
              >
                {showAddForm ? 'Cancel' : 'Add New Book'}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleSaveBook} className="mb-8 bg-gray-50 p-4 rounded border border-gray-200 grid grid-cols-2 gap-4">
                <input type="text" placeholder="Title" required className="border p-2 rounded" value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} />
                <input type="text" placeholder="Author" required className="border p-2 rounded" value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} />
                <input type="text" placeholder="ISBN" required className="border p-2 rounded" value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} />
                <input type="text" placeholder="Category" className="border p-2 rounded" value={bookForm.category} onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })} />
                <input type="number" min="1" placeholder="Total Copies" required className="border p-2 rounded" value={bookForm.total_copies} onChange={(e) => setBookForm({ ...bookForm, total_copies: Number(e.target.value) })} />
                <input type="number" min="0" placeholder="Available Copies" required className="border p-2 rounded" value={bookForm.available_copies} onChange={(e) => setBookForm({ ...bookForm, available_copies: Number(e.target.value) })} />

                <div className="col-span-2 flex gap-3">
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">{editingBookId ? 'Update Book' : 'Save Book'}</button>
                  <button type="button" onClick={resetBookForm} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">Reset</button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{book.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.isbn}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.available_copies} / {book.total_copies}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setEditingBookId(book.id);
                              setBookForm({
                                isbn: book.isbn,
                                title: book.title,
                                author: book.author,
                                total_copies: book.total_copies,
                                available_copies: book.available_copies,
                                category: book.category || ''
                              });
                              setShowAddForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDeleteBook(book.id)} className="text-red-600 hover:text-red-900">Delete</button>
                          <button onClick={() => handleIssueBook(book.id)} className="text-green-600 hover:text-green-900">Issue</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Loan Records</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrower</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taken</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Returned</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fine</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loans.map((loan) => (
                    <tr key={loan.id}>
                      <td className="px-4 py-3 text-sm text-gray-800">{loan.User?.username || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{loan.Book?.title || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(loan.issue_date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(loan.due_date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(loan.return_date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">${Number(loan.fine_amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${loan.status === 'returned' ? 'bg-green-100 text-green-700' : loan.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {loan.status !== 'returned' && (
                          <button onClick={() => handleReturnBook(loan.id)} className="text-green-600 hover:text-green-800">Return</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default LibrarianDashboard;

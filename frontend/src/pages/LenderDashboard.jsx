import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const formatDate = (dateValue) => {
  if (!dateValue) return '—';
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

const LenderDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [myLoans, setMyLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    try {
      const res = await axiosClient.get('/books');
      setBooks(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch books', error);
    }
  };

  const fetchMyLoans = async () => {
    try {
      const res = await axiosClient.get('/loans/mine');
      setMyLoans(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch loans', error);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      await Promise.all([fetchBooks(), fetchMyLoans()]);
      setLoading(false);
    };

    loadDashboard();
  }, []);

  const handleTakeBook = async (bookId) => {
    try {
      await axiosClient.post('/loans/issue', { book_id: bookId });
      await Promise.all([fetchBooks(), fetchMyLoans()]);
    } catch (error) {
      alert(error.response?.data?.error || 'Could not take this book');
    }
  };

  const handleReturnBook = async (loanId) => {
    try {
      await axiosClient.post('/loans/return', { id: loanId });
      await Promise.all([fetchBooks(), fetchMyLoans()]);
    } catch (error) {
      alert(error.response?.data?.error || 'Could not return the book');
    }
  };

  const handleRenewLoan = async (loanId) => {
    try {
      await axiosClient.put(`/loans/${loanId}/renew`);
      fetchMyLoans();
    } catch (error) {
      alert(error.response?.data?.error || 'Could not renew this loan');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Lender Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome, {user?.username}</p>
          </div>
          <button onClick={logout} className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50">Logout</button>
        </header>

        <main className="space-y-8">
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Available Books</h2>
              <span className="text-sm text-gray-500">{books.filter((book) => book.available_copies > 0).length} available</span>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading catalog...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {books.map((book) => (
                  <div key={book.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h3 className="font-bold text-gray-800">{book.title}</h3>
                        <p className="text-sm text-gray-600">{book.author}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {book.available_copies}/{book.total_copies} left
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">ISBN: {book.isbn}</p>
                    <p className="text-sm text-gray-500">Category: {book.category || 'General'}</p>
                    <button
                      onClick={() => handleTakeBook(book.id)}
                      disabled={book.available_copies < 1}
                      className="mt-4 w-full rounded bg-blue-600 text-white px-3 py-2 text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
                    >
                      Take Book
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">My Loans</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fine</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myLoans.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-6 text-center text-sm text-gray-500">No loans yet.</td>
                    </tr>
                  ) : (
                    myLoans.map((loan) => (
                      <tr key={loan.id}>
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
                            <div className="flex gap-2">
                              <button onClick={() => handleReturnBook(loan.id)} className="text-green-600 hover:text-green-800">Return</button>
                              <button onClick={() => handleRenewLoan(loan.id)} className="text-blue-600 hover:text-blue-800">Renew</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default LenderDashboard;

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const formatDate = (dateValue) => {
  if (!dateValue) return '—';
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);

  const fetchAdminData = async () => {
    try {
      const [booksRes, usersRes, loansRes] = await Promise.all([
        axiosClient.get('/books'),
        axiosClient.get('/users'),
        axiosClient.get('/loans')
      ]);

      setBooks(booksRes.data.data || []);
      setUsers(usersRes.data.data || []);
      setLoans(loansRes.data.data || []);
    } catch (error) {
      console.error('Failed to load admin dashboard', error);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUserStatus = async (id, account_status) => {
    try {
      await axiosClient.put(`/users/${id}`, { account_status });
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.error || 'Could not update user');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axiosClient.delete(`/users/${id}`);
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.error || 'Could not delete user');
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      await axiosClient.delete(`/books/${id}`);
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.error || 'Could not delete book');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Monitoring all system activity for {user?.username}</p>
          </div>
          <button onClick={logout} className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50">Logout</button>
        </header>

        <main className="space-y-8">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500">Books</p>
              <h3 className="text-3xl font-bold text-gray-800">{books.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500">Users</p>
              <h3 className="text-3xl font-bold text-gray-800">{users.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500">Loans</p>
              <h3 className="text-3xl font-bold text-gray-800">{loans.length}</h3>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Book Inventory</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ISBN</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Copies</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td className="px-4 py-3 text-sm text-gray-800">{book.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{book.author}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{book.isbn}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{book.available_copies}/{book.total_copies}</td>
                      <td className="px-4 py-3 text-sm">
                        <button onClick={() => handleDeleteBook(book.id)} className="text-red-600 hover:text-red-800">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Users</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((member) => (
                    <tr key={member.id}>
                      <td className="px-4 py-3 text-sm text-gray-800">{member.username}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{member.role}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{member.account_status}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button onClick={() => handleUserStatus(member.id, member.account_status === 'active' ? 'suspended' : 'active')} className="text-blue-600 hover:text-blue-800">
                            {member.account_status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button onClick={() => handleDeleteUser(member.id)} className="text-red-600 hover:text-red-800">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Loan Monitoring</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrower</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taken</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fine</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
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

export default AdminDashboard;

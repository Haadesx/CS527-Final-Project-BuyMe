import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Loader from '../components/Loader';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Fade } from 'react-awesome-reveal';
import { toast } from 'react-toastify';

const AdminScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('reports'); // reports, users, auctions

  // Form states for Create Rep
  const [repName, setRepName] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repPassword, setRepPassword] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, userRes, itemRes] = await Promise.all([
          axios.get('/api/admin/report/earnings', { headers: { Authorization: `Bearer ${userInfo.data}` } }),
          axios.get('/api/user', { headers: { Authorization: `Bearer ${userInfo.data}` } }),
          axios.get('/api/item', { headers: { Authorization: `Bearer ${userInfo.data}` } }),
        ]);

        setReport(reportRes.data.data);
        setUsers(userRes.data.data || []);
        setItems(itemRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.role === 'admin') {
      fetchData();
    }
  }, [userInfo]);

  const handleCreateRep = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/user/create-rep',
        { username: repName, email: repEmail, password: repPassword },
        { headers: { Authorization: `Bearer ${userInfo.data}` } }
      );
      toast.success('Representative account created.', { className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400' });
      setRepName(''); setRepEmail(''); setRepPassword('');
      // Refetch users
      const userRes = await axios.get('/api/user', { headers: { Authorization: `Bearer ${userInfo.data}` } });
      setUsers(userRes.data.data || []);
    } catch (err) {
      toast.error('Failed to create rep.', { className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400' });
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Permanently delete this user?')) {
      try {
        await axios.delete(`/api/user/user/${id}`, { headers: { Authorization: `Bearer ${userInfo.data}` } });
        toast.success('User deleted.', { className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400' });
        setUsers(users.filter(u => u.user_id !== id));
      } catch (err) {
        toast.error('Failed to delete user.', { className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400' });
      }
    }
  };

  const getUserName = (id) => users.find((u) => u.user_id === id)?.username || `User #${id}`;
  const getItemName = (id) => items.find((i) => i.item_id === id)?.item_name || `Item #${id}`;

  if (userInfo?.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center bg-cream-50 text-emerald-900 font-serif text-2xl">Access Restricted.</div>;
  }

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-cream-50 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <Fade triggerOnce direction="up">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-gold-400/30 pb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-emerald-900 mb-2 uppercase tracking-widest">Command Center</h1>
              <p className="text-charcoal-900/60 font-light italic">Administrative oversight and reporting.</p>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button onClick={() => setActiveTab('reports')} className={`px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors ${activeTab === 'reports' ? 'bg-emerald-900 text-gold-400' : 'bg-transparent text-emerald-900 border border-emerald-900'}`}>Reports</button>
              <button onClick={() => setActiveTab('users')} className={`px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors ${activeTab === 'users' ? 'bg-emerald-900 text-gold-400' : 'bg-transparent text-emerald-900 border border-emerald-900'}`}>Users</button>
            </div>
          </div>
        </Fade>

        {activeTab === 'reports' && report && (
          <Fade triggerOnce direction="up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-emerald-900 p-6 text-cream-50 shadow-lg border border-gold-400/30">
                <h3 className="text-xs uppercase tracking-widest text-gold-400 mb-2">Total Earnings</h3>
                <p className="text-4xl font-serif font-bold">${report.totalEarnings?.toLocaleString()}</p>
              </div>
              {/* Add more summary cards if needed */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart */}
              <div className="bg-white p-6 shadow-lg border border-gold-400/20 col-span-1 lg:col-span-2">
                <h3 className="text-lg font-serif text-emerald-900 mb-6 border-b border-gold-400/10 pb-2">Best Selling Items</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={report.bestSellingItems.map(item => ({ name: getItemName(item.item_id), total: Number(item.total) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#064e3b" fontSize={12} />
                    <YAxis stroke="#064e3b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#d4af37' }} />
                    <Bar dataKey="total" fill="#064e3b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tables */}
              <div className="bg-white p-6 shadow-lg border border-gold-400/20">
                <h3 className="text-lg font-serif text-emerald-900 mb-4">Earnings by Category</h3>
                <ul className="space-y-3">
                  {report.earningsPerCategory.map((cat, index) => (
                    <li key={index} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                      <span className="text-charcoal-900">{cat.category || 'Uncategorized'}</span>
                      <span className="font-bold text-emerald-900">${cat.total?.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 shadow-lg border border-gold-400/20">
                <h3 className="text-lg font-serif text-emerald-900 mb-4">Top Sellers</h3>
                <ul className="space-y-3">
                  {report.earningsPerSeller.map((s) => (
                    <li key={s.seller_id} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                      <span className="text-charcoal-900">{getUserName(s.seller_id)}</span>
                      <span className="font-bold text-emerald-900">${s.total?.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Fade>
        )}

        {activeTab === 'users' && (
          <Fade triggerOnce direction="up">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Create Rep Form */}
              <div className="lg:col-span-1 bg-white p-6 shadow-lg border border-gold-400/20 h-fit">
                <h3 className="text-lg font-serif text-emerald-900 mb-6 border-b border-gold-400/10 pb-2">Appoint Representative</h3>
                <form onSubmit={handleCreateRep} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-charcoal-900/60 mb-1">Username</label>
                    <input type="text" value={repName} onChange={(e) => setRepName(e.target.value)} className="w-full bg-cream-50 border-b border-gold-400 text-emerald-900 p-2 focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-charcoal-900/60 mb-1">Email</label>
                    <input type="email" value={repEmail} onChange={(e) => setRepEmail(e.target.value)} className="w-full bg-cream-50 border-b border-gold-400 text-emerald-900 p-2 focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-charcoal-900/60 mb-1">Password</label>
                    <input type="password" value={repPassword} onChange={(e) => setRepPassword(e.target.value)} className="w-full bg-cream-50 border-b border-gold-400 text-emerald-900 p-2 focus:outline-none" required />
                  </div>
                  <button type="submit" className="w-full bg-emerald-900 text-gold-400 py-3 font-serif tracking-widest hover:bg-emerald-800 transition-colors mt-4">APPOINT</button>
                </form>
              </div>

              {/* User List */}
              <div className="lg:col-span-2 bg-white p-6 shadow-lg border border-gold-400/20">
                <h3 className="text-lg font-serif text-emerald-900 mb-6 border-b border-gold-400/10 pb-2">User Directory</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-charcoal-900/50 uppercase bg-cream-50">
                      <tr>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-emerald-900">{user.username}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold rounded ${user.role === 'admin' ? 'bg-gold-400/20 text-gold-600' : user.role === 'rep' ? 'bg-emerald-900/10 text-emerald-900' : 'bg-gray-100 text-gray-600'}`}>
                              {user.role || 'User'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-charcoal-900/70">{user.email}</td>
                          <td className="px-4 py-3 text-right">
                            {user.role !== 'admin' && (
                              <button onClick={() => handleDeleteUser(user.user_id)} className="text-red-600 hover:text-red-800 text-xs uppercase tracking-widest font-bold">Delete</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Fade>
        )}
      </div>
    </div>
  );
};

export default AdminScreen;

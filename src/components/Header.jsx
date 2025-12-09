import { FaSignInAlt, FaSignOutAlt, FaBars, FaTimes, FaBell, FaUserCircle } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import { useEffect, useState } from 'react';
import { useGetNotificationsQuery, useNotifyBidMutation } from '../slices/notificationApiSlice';
import { AttentionSeeker, Fade } from 'react-awesome-reveal';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutApiCall] = useLogoutMutation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifyBid] = useNotifyBidMutation();
  const shouldAnimateOnRouteChange = location.pathname === '/';

  const { data: notifData, refetch } = useGetNotificationsQuery(undefined, {
    skip: !userInfo,
  });

  useEffect(() => {
    const sendNotification = async () => {
      try {
        await notifyBid();
      } catch (err) {
        console.error('Notification API error:', err);
      }
    };

    if (userInfo) {
      sendNotification();
      refetch();
    }
  }, [location, navigate, userInfo, notifOpen, refetch]);

  const notifications = notifData?.data?.slice(-10).reverse() || [];

  const logoutHandler = async () => {
    try {
      await logoutApiCall({ token: userInfo.data }).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(logout());
      navigate('/login');
      setDropdownOpen(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo">
          <span>Buy</span>Me
        </Link>

        <div className={`nav-links ${menuOpen ? 'mobile-open' : 'hidden md:flex'}`}>
          <Link to="/auctions" className="nav-link">Marketplace</Link>


          {userInfo ? (
            <>
              <Link to="/create-auction" className="nav-link">Sell Item</Link>

              {/* Notification Icon */}
              <div className="relative">
                <AttentionSeeker key={shouldAnimateOnRouteChange ? location.pathname : 'static'} effect="pulse" triggerOnce={false}>
                  <div
                    className="nav-link"
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => {
                      setNotifOpen(!notifOpen);
                      setDropdownOpen(false);
                    }}
                  >
                    <FaBell size={18} />
                  </div>
                </AttentionSeeker>

                {notifOpen && (
                  <div
                    className="absolute right-0 mt-4 w-96 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                  >
                    <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)', color: 'var(--primary)' }}>
                      NOTIFICATIONS
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500 italic">No new correspondence.</div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className="px-6 py-4 border-b transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border-color)' }}>
                            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>{notif.topic}</p>
                            <p className="text-sm font-semibold text-white">{notif.title}</p>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{notif.description}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative">
                <div
                  className="nav-link"
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    setNotifOpen(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <FaUserCircle size={24} />
                  <span style={{ textTransform: 'capitalize' }}>{userInfo?.name || userInfo?.username}</span>
                </div>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-4 w-64 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                  >
                    <div className="flex items-center px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3 font-bold" style={{ background: 'var(--primary)', color: 'white' }}>
                        {(userInfo?.first_name?.[0] || userInfo?.username?.[0] || 'U').toUpperCase()}
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Signed in as</p>
                        <p className="font-bold text-sm text-white tracking-wide">{userInfo?.first_name || userInfo?.username}</p>
                      </div>
                    </div>

                    <Link to="/profile" className="block px-6 py-3 hover:bg-white/5 transition-colors text-gray-300 hover:text-white" onClick={() => setDropdownOpen(false)}>
                      My Profile
                    </Link>
                    <Link to="/my-auctions" className="block px-6 py-3 hover:bg-white/5 transition-colors text-gray-300 hover:text-white" onClick={() => setDropdownOpen(false)}>
                      My Collections
                    </Link>
                    <Link to="/biddings" className="block px-6 py-3 hover:bg-white/5 transition-colors text-gray-300 hover:text-white" onClick={() => setDropdownOpen(false)}>
                      My Bids
                    </Link>

                    {userInfo?.role === 'admin' && (
                      <Link to="/admin" className="block px-6 py-3 hover:bg-white/5 transition-colors font-bold" style={{ color: 'var(--primary)' }} onClick={() => setDropdownOpen(false)}>
                        Admin Portal
                      </Link>
                    )}

                    <div className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                      <button
                        onClick={logoutHandler}
                        className="block w-full text-left px-6 py-3 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.5rem' }}></div>
              <Link to="/login" className="nav-link">Log In</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white text-xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
};

export default Header;

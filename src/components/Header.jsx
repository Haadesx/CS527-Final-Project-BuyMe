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
    <header className="bg-emerald-950 text-gold-400 sticky top-0 z-50 border-b-2 border-gold-500 shadow-2xl">
      <nav className="container mx-auto flex items-center justify-between p-6">
        <button className="text-gold-400 text-2xl mr-4 z-50 md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <Link to="/" className="text-3xl font-serif font-bold tracking-widest text-gold-400 hover:text-gold-500 transition-colors">
          THE VAULT
        </Link>

        <div className="hidden md:flex items-center space-x-8 uppercase tracking-widest text-sm font-light">
          <Link to="/auctions" className="hover:text-gold-400 transition-colors">Auctions</Link>

          {userInfo ? (
            <div className="relative flex items-center space-x-6">
              <div className="relative">
                <AttentionSeeker key={shouldAnimateOnRouteChange ? location.pathname : 'static'} effect="pulse" triggerOnce={false}>
                  <FaBell
                    size={20}
                    className="cursor-pointer hover:text-gold-400 transition-colors"
                    onClick={() => {
                      setNotifOpen(!notifOpen);
                      setDropdownOpen(false);
                    }}
                  />
                </AttentionSeeker>

                {notifOpen && (
                  <div className="absolute right-0 mt-4 w-96 bg-cream-50 text-charcoal-900 rounded-none shadow-2xl border border-gold-400 z-50 animate-fade-in max-h-80 overflow-y-auto">
                    <div className="p-4 border-b border-gold-400/20 bg-emerald-900 text-gold-400 font-serif tracking-wider text-center">
                      NOTIFICATIONS
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-6 py-8 text-center text-gray-500 italic font-serif">No new correspondence.</div>
                    ) : (
                      notifications.map((notif) => (
                        <Fade direction="down" duration={300} triggerOnce key={notif.id}>
                          <div className="px-6 py-4 hover:bg-cream-100 border-b border-gold-400/10 transition-colors">
                            <p className="text-xs text-gold-500 uppercase tracking-widest mb-1">{notif.topic}</p>
                            <p className="text-sm font-serif font-semibold text-emerald-900">{notif.title}</p>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.description}</p>
                          </div>
                        </Fade>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    setNotifOpen(false);
                  }}
                  className="flex items-center space-x-3 focus:outline-none hover:text-gold-400 transition-colors"
                >
                  <FaUserCircle size={24} />
                  <span className="font-serif italic capitalize">{userInfo?.name || userInfo?.username}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-cream-50 text-charcoal-900 rounded-none shadow-2xl border border-gold-400 z-50 animate-fade-in">
                    <div className="flex items-center px-6 py-4 border-b border-gold-400/20 bg-emerald-900/5">
                      <div className="w-10 h-10 rounded-full bg-emerald-900 text-gold-400 flex items-center justify-center font-serif text-xl mr-3 border border-gold-400">
                        {(userInfo?.first_name?.[0] || userInfo?.username?.[0] || 'U').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-serif text-emerald-900">Greetings,</p>
                        <p className="font-bold text-sm tracking-wide">{userInfo?.first_name || userInfo?.username}</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-6 py-3 hover:bg-gold-400/10 transition-colors font-serif"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/my-auctions"
                      className="block px-6 py-3 hover:bg-gold-400/10 transition-colors font-serif"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Collections
                    </Link>
                    <Link
                      to="/create-auction"
                      className="block px-6 py-3 hover:bg-gold-400/10 transition-colors font-serif"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Consign Item
                    </Link>
                    <Link
                      to="/biddings"
                      className="block px-6 py-3 hover:bg-gold-400/10 transition-colors font-serif"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Bids
                    </Link>
                    {userInfo?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-6 py-3 hover:bg-gold-400/10 transition-colors font-serif text-emerald-700 font-bold"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Admin Portal
                      </Link>
                    )}
                    <button
                      onClick={logoutHandler}
                      className="block w-full text-left px-6 py-3 hover:bg-red-50 text-red-800 transition-colors font-serif border-t border-gold-400/20"
                    >
                      Depart
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-6">
              <Link to="/login" className="hover:text-gold-400 transition-colors">Sign In</Link>
              <Link to="/register" className="border border-gold-400 px-6 py-2 hover:bg-gold-400 hover:text-emerald-900 transition-all duration-300">
                Join The Club
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-emerald-900 text-cream-50 z-40 transform transition-transform duration-500 ease-out border-r border-gold-400 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-8 space-y-6 mt-16 font-serif text-xl">
          <Link to="/" className="block hover:text-gold-400" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/auctions" className="block hover:text-gold-400" onClick={() => setMenuOpen(false)}>Auctions</Link>
          <Link to="/my-auctions" className="block hover:text-gold-400" onClick={() => setMenuOpen(false)}>My Collection</Link>
          <Link to="/biddings" className="block hover:text-gold-400" onClick={() => setMenuOpen(false)}>My Bids</Link>
          <Link to="/notifications" className="block hover:text-gold-400" onClick={() => setMenuOpen(false)}>Correspondence</Link>

          {userInfo?.role === 'admin' && (
            <div className="pt-4 border-t border-gold-400/30">
              <p className="text-xs uppercase tracking-widest text-gold-400 mb-4">Administration</p>
              <Link to="/admin" className="block hover:text-gold-400 mb-2" onClick={() => setMenuOpen(false)}>Portal</Link>
            </div>
          )}

          <div className="pt-8 border-t border-gold-400/30">
            {userInfo ? (
              <>
                <Link to="/profile" className="block hover:text-gold-400 mb-4" onClick={() => setMenuOpen(false)}>Profile</Link>
                <button onClick={logoutHandler} className="block text-left w-full text-red-300 hover:text-red-400">Depart</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block hover:text-gold-400 mb-4" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="block hover:text-gold-400" onClick={() => setMenuOpen(false)}>Join The Club</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

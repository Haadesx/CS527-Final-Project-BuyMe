import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { useUpdateUserMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { Fade } from 'react-awesome-reveal';

const ProfileScreen = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading }] = useUpdateUserMutation();

  useEffect(() => {
    setName(userInfo.username); // Assuming username is the field
    setEmail(userInfo.email);
  }, [userInfo.email, userInfo.username]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match', { className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400' });
    } else {
      try {
        const res = await updateProfile({
          _id: userInfo._id,
          username: name,
          email,
          password,
        }).unwrap();
        dispatch(setCredentials(res));
        toast.success('Profile updated successfully', { className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400' });
      } catch (err) {
        toast.error(err?.data?.message || err.error, { className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 py-20 px-4">
      <Fade triggerOnce direction="up">
        <div className="max-w-2xl mx-auto bg-white p-10 border border-gold-400/20 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-900 via-gold-400 to-emerald-900"></div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif font-bold text-emerald-900 mb-2 uppercase tracking-widest">Account Settings</h1>
            <p className="text-charcoal-900/60 font-light italic">Manage your personal details.</p>
          </div>

          <form onSubmit={submitHandler} className="space-y-6">
            <div className="group">
              <label className="block text-xs uppercase tracking-widest text-gold-400/80 mb-2">Username</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-b border-gold-400/30 text-emerald-900 py-2 focus:outline-none focus:border-gold-400 transition-colors font-serif"
                required
              />
            </div>

            <div className="group">
              <label className="block text-xs uppercase tracking-widest text-gold-400/80 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-gold-400/30 text-emerald-900 py-2 focus:outline-none focus:border-gold-400 transition-colors font-serif"
                required
              />
            </div>

            <div className="group">
              <label className="block text-xs uppercase tracking-widest text-gold-400/80 mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-gold-400/30 text-emerald-900 py-2 focus:outline-none focus:border-gold-400 transition-colors font-serif"
                placeholder="Leave blank to keep current"
              />
            </div>

            <div className="group">
              <label className="block text-xs uppercase tracking-widest text-gold-400/80 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent border-b border-gold-400/30 text-emerald-900 py-2 focus:outline-none focus:border-gold-400 transition-colors font-serif"
                placeholder="Confirm new password"
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-900 text-gold-400 py-3 font-serif font-bold tracking-widest hover:bg-emerald-800 transition-all shadow-lg disabled:opacity-50"
              >
                {isLoading ? 'UPDATING...' : 'SAVE CHANGES'}
              </button>
            </div>
          </form>
        </div>
      </Fade>
    </div>
  );
};

export default ProfileScreen;

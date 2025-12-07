import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import Loader from '../components/Loader';
import { Fade } from 'react-awesome-reveal';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading, error }] = useLoginMutation();
  const { userInfo } = useSelector(state => state.auth);

  useEffect(() => {
    if (userInfo) {
      toast.success("Welcome back to The Vault.", {
        hideProgressBar: true,
        className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400'
      });
      const timer = setTimeout(() => {
        navigate('/');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      const decoded = jwtDecode(res.data);

      dispatch(setCredentials({
        ...decoded,
        ...res,
      }));
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Access Denied.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold-400/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cream-50/10 rounded-full blur-3xl"></div>

      <ToastContainer />

      <Fade triggerOnce direction="up" duration={1000}>
        <div className="relative z-10 w-full max-w-md p-10 bg-emerald-950/80 backdrop-blur-xl border border-gold-400/30 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif font-bold text-gold-400 mb-2 tracking-wider">THE VAULT</h1>
            <p className="text-cream-50/60 text-sm uppercase tracking-[0.2em]">Member Access</p>
          </div>

          <form onSubmit={submitHandler} className='space-y-8'>
            <div className='group'>
              <label htmlFor="email" className='block text-xs uppercase tracking-widest text-gold-400/70 mb-2 group-focus-within:text-gold-400 transition-colors'>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border-b border-gold-400/30 text-cream-50 py-2 focus:outline-none focus:border-gold-400 transition-colors font-light placeholder-cream-50/20"
                placeholder="Enter your email"
              />
            </div>

            <div className="group">
              <label htmlFor="password" className="block text-xs uppercase tracking-widest text-gold-400/70 mb-2 group-focus-within:text-gold-400 transition-colors">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent border-b border-gold-400/30 text-cream-50 py-2 focus:outline-none focus:border-gold-400 transition-colors font-light placeholder-cream-50/20"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold-400 text-emerald-900 py-3 font-serif font-bold tracking-widest hover:bg-cream-50 transition-all duration-500 disabled:opacity-50 mt-8"
            >
              {isLoading ? 'AUTHENTICATING...' : 'ENTER'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-cream-50/40 text-sm">
              Not a member?{' '}
              <Link to="/register" className="text-gold-400 hover:text-cream-50 transition-colors underline decoration-gold-400/30 underline-offset-4">
                Apply for Access
              </Link>
            </p>
          </div>
        </div>
      </Fade>
    </div>
  )
}

export default LoginScreen

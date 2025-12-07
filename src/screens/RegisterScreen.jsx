import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { toast, ToastContainer } from 'react-toastify';
import { setCredentials } from '../slices/authSlice';
import Loader from '../components/Loader';
import { Fade } from 'react-awesome-reveal';

const RegisterScreen = () => {

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.', { className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400' });
    } else {
      try {
        const res = await register({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          phone,
          countrycode: countryCode
        }).unwrap();

        toast.success("Membership Application Approved.", {
          hideProgressBar: true,
          className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400'
        });
        const timer = setTimeout(() => {
          navigate('/login');
        }, 1500);
      } catch (err) {
        toast.error(err?.data?.message || err.error, { className: '!bg-cream-50 !text-emerald-900 !font-serif !border !border-gold-400' });
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-900 relative overflow-hidden py-20">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-950 to-emerald-900 opacity-90"></div>

      <ToastContainer />

      <Fade triggerOnce direction="up" duration={1000}>
        <div className="relative z-10 w-full max-w-2xl p-10 bg-emerald-950/80 backdrop-blur-xl border border-gold-400/30 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gold-400 mb-2 tracking-wider">MEMBERSHIP APPLICATION</h1>
            <p className="text-cream-50/60 text-sm uppercase tracking-[0.2em]">Join The Elite</p>
          </div>

          <form onSubmit={submitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className='group'>
              <label className='block text-xs uppercase tracking-widest text-gold-400/70 mb-2'>First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                className="w-full bg-transparent border-b border-gold-400/30 text-cream-50 py-2 focus:outline-none focus:border-gold-400 transition-colors font-light" />
            </div>

            <div className='group'>
              <label className='block text-xs uppercase tracking-widest text-gold-400/70 mb-2'>Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required
                className="w-full bg-transparent border-b border-gold-400/30 text-cream-50 py-2 focus:outline-none focus:border-gold-400 transition-colors font-light" />
            </div>

            <div className='group md:col-span-2'>
              <label className='block text-xs uppercase tracking-widest text-gold-400/70 mb-2'>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-transparent border-b border-gold-400/30 text-cream-50 py-2 focus:outline-none focus:border-gold-400 transition-colors font-light" />
            </div>

            <div className='group'>
              <label className='block text-xs uppercase tracking-widest text-gold-400/70 mb-2'>Country Code</label>
              <input type="text" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} required
                className="w-full bg-transparent border-b border-gold-400/30 text-cream-50 py-2 focus:outline-none focus:border-gold-400 transition-colors font-light" />
            </div>

            <div className='group'>
              <label className='block text-xs uppercase tracking-widest text-gold-400/70 mb-2'>Phone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required
                className="w-full bg-transparent border-b border-gold-400/30 text-cream-50 py-2 focus:outline-none focus:border-gold-400 transition-colors font-light" />
            </div>

            <div className='group'>
              <label className='block text-xs uppercase tracking-widest text-gold-400/70 mb-2'>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full bg-transparent border-b border-gold-400/30 text-cream-50 py-2 focus:outline-none focus:border-gold-400 transition-colors font-light" />
            </div>

            <div className='group'>
              <label className='block text-xs uppercase tracking-widest text-gold-400/70 mb-2'>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                className="w-full bg-transparent border-b border-gold-400/30 text-cream-50 py-2 focus:outline-none focus:border-gold-400 transition-colors font-light" />
            </div>

            <div className="md:col-span-2 mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gold-400 text-emerald-900 py-3 font-serif font-bold tracking-widest hover:bg-cream-50 transition-all duration-500 disabled:opacity-50"
              >
                {isLoading ? 'PROCESSING...' : 'SUBMIT APPLICATION'}
              </button>
            </div>

          </form>

          <div className="mt-8 text-center">
            <p className="text-cream-50/40 text-sm">
              Already a member?{' '}
              <Link to="/login" className="text-gold-400 hover:text-cream-50 transition-colors underline decoration-gold-400/30 underline-offset-4">
                Access Vault
              </Link>
            </p>
          </div>
        </div>
      </Fade>
    </div>
  );
};

export default RegisterScreen;
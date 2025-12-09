import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { toast, ToastContainer } from 'react-toastify';
import { setCredentials } from '../slices/authSlice';
import { Fade } from 'react-awesome-reveal';

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+1',
    password: '',
    confirmPassword: ''
  });

  const { firstName, lastName, email, phone, countryCode, password, confirmPassword } = formData;

  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const res = await register({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        countrycode: countryCode,
        password
      }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success('Registration successful. You are now logged in.');
      navigate('/');
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <ToastContainer />
      <Fade triggerOnce>
        <div className="auth-card" style={{ maxWidth: '600px' }}>
          <h2>Create Account</h2>
          <p>Join the marketplace today</p>

          <form onSubmit={submitHandler}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="firstName" value={firstName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="lastName" value={lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={email} onChange={handleChange} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Code</label>
                <input type="text" name="countryCode" value={countryCode} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" name="phone" value={phone} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={password} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={confirmPassword} onChange={handleChange} required />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </div>
      </Fade>
    </div>
  );
};

export default RegisterScreen;
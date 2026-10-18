import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

let Register = () => {
  let [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  let [error, setError] = useState('');
  let [loading, setLoading] = useState(false);
  
  let { register } = useContext(AuthContext);
  let { theme, toggleTheme } = useContext(ThemeContext);
  let navigate = useNavigate();

  let handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  let handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-stone-50 text-stone-800'}`}>
      
      {/* Theme Toggle Floating */}
      <button 
        onClick={toggleTheme}
        className={`fixed top-6 right-6 p-2 rounded-full border transition-all duration-200 z-50 ${
          theme === 'dark' 
            ? 'bg-zinc-900 border-zinc-800 text-yellow-400 hover:bg-zinc-800' 
            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100 shadow-sm'
        }`}
        title="Toggle Theme"
      >
        {theme === 'light' ? (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        )}
      </button>

      {/* Main Card */}
      <div className={`w-full max-w-md rounded-xl border shadow-lg overflow-hidden ${
        theme === 'dark' 
          ? 'bg-zinc-900 border-zinc-800 shadow-black/20' 
          : 'bg-white border-stone-200 shadow-stone-200/50'
      }`}>
        
        {/* Header Section with Logo */}
        <div className={`px-8 pt-8 pb-6 text-center border-b ${
          theme === 'dark' ? 'border-zinc-800' : 'border-stone-100'
        }`}>
          <div className={`inline-flex items-center justify-center w-12 h-12 mb-4 rounded-lg ${
            theme === 'dark' ? 'bg-orange-600' : 'bg-stone-900'
          }`}>
             <span className="text-white font-bold text-xl">CF</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">Create Account</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`}>Start managing your contacts today.</p>
        </div>

        {/* Form Body */}
        <div className="px-8 py-6 space-y-5">
          
          {error && (
            <div className={`p-3 rounded-md text-sm font-medium border ${
              theme === 'dark' 
                ? 'bg-red-900/20 text-red-400 border-red-900/50' 
                : 'bg-red-50 text-red-600 border-red-200'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name Input */}
            <div>
              <label htmlFor="name" className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${
                theme === 'dark' ? 'text-zinc-400' : 'text-stone-500'
              }`}>Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium transition-all outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-zinc-950 border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:ring-orange-500/20'
                    : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-stone-800 focus:ring-stone-800/10'
                }`}
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${
                theme === 'dark' ? 'text-zinc-400' : 'text-stone-500'
              }`}>Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium transition-all outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-zinc-950 border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:ring-orange-500/20'
                    : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-stone-800 focus:ring-stone-800/10'
                }`}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${
                theme === 'dark' ? 'text-zinc-400' : 'text-stone-500'
              }`}>Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Min 6 characters"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium transition-all outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-zinc-950 border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:ring-orange-500/20'
                    : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-stone-800 focus:ring-stone-800/10'
                }`}
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${
                theme === 'dark' ? 'text-zinc-400' : 'text-stone-500'
              }`}>Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter password"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium transition-all outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-zinc-950 border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:ring-orange-500/20'
                    : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-stone-800 focus:ring-stone-800/10'
                }`}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3 px-4 rounded-lg text-sm font-bold transition-all duration-200 shadow-sm active:scale-[0.98] ${
                loading 
                  ? 'opacity-70 cursor-not-allowed bg-gray-400' 
                  : (theme === 'dark'
                      ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/20'
                      : 'bg-stone-900 hover:bg-stone-800 text-white shadow-stone-200')
              }`}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className={`px-8 py-5 text-center border-t ${
          theme === 'dark' ? 'border-zinc-800 bg-zinc-900/50' : 'border-stone-100 bg-stone-50/50'
        }`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`}>
            Already have an account?{' '}
            <Link to="/login" className={`font-semibold underline decoration-2 underline-offset-2 transition-colors ${
              theme === 'dark' 
                ? 'text-orange-400 hover:text-orange-300 decoration-orange-400/30 hover:decoration-orange-300' 
                : 'text-stone-900 hover:text-stone-700 decoration-stone-300 hover:decoration-stone-500'
            }`}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
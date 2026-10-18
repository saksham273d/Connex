import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

let Profile = () => {
  let { user, setUser } = useContext(AuthContext);
  let { theme } = useContext(ThemeContext);
  
  let [loading, setLoading] = useState(false);
  let [error, setError] = useState('');
  let [successMsg, setSuccessMsg] = useState('');
  
  let [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  let handleChange = (e) => {
    let { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  let handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (!formData.name.trim()) throw new Error('Name is required');
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
        throw new Error('Valid email is required');
      }

      let { data } = await api.put('/auth/profile', formData);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));      
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} p-6`}>
      <header className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
          Manage your account information
        </p>
      </header>

      <main className="max-w-2xl mx-auto space-y-6">
        {successMsg && (
          <div className="p-4 bg-green-100 border border-green-300 rounded-lg text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
            ✓ {successMsg}
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300">
             {error}
          </div>
        )}

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">Personal Information</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1.5">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Profile;
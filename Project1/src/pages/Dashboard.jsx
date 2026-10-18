import { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import api from '../services/api';
import AddContactModal from '../components/AddContactModal';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import SkeletonCard from '../components/SkeletonCard';
import AlphabetSidebar from '../components/AlphabeticalSidebar'; 
import TagFilterDropdown from '../components/TagFilterDropdown';

let getTelLink = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  let cleanNumber = phone.replace(/[\s\-\(\)]/g, '');
  if (!cleanNumber.startsWith('+')) {
    if (cleanNumber.startsWith('91')) cleanNumber = '+' + cleanNumber;
    else if (cleanNumber.length === 10 && /^[6-9]\d{9}$/.test(cleanNumber)) cleanNumber = '+91' + cleanNumber;
  }
  return `tel:${cleanNumber}`;
};

let getWaLink = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  let cleanNumber = phone.replace(/[\s\-\(\)+]/g, '');
  if (cleanNumber.length === 10 && /^[6-9]\d{9}$/.test(cleanNumber)) cleanNumber = '91' + cleanNumber;
  return `https://wa.me/${cleanNumber}`;
};

let formatPhoneForDisplay = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  let cleanNumber = phone.replace(/[\s\-\(\)]/g, '');
  if (cleanNumber.startsWith('+91')) return `+91 ${cleanNumber.slice(3, 8)} ${cleanNumber.slice(8)}`;
  if (cleanNumber.startsWith('91') && cleanNumber.length === 12) return `+91 ${cleanNumber.slice(2, 7)} ${cleanNumber.slice(7)}`;
  if (cleanNumber.length === 10 && /^[6-9]\d{9}$/.test(cleanNumber)) return `+91 ${cleanNumber.slice(0, 5)} ${cleanNumber.slice(5)}`;
  return phone;
};

let getInitials = (first, last) => {
  if (!first && !last) return '?';
  let f = first ? first.charAt(0).toUpperCase() : '';
  let l = last ? last.charAt(0).toUpperCase() : '';
  return `${f}${l}` || '?';
};

let getColorIndex = (id) => {
  let colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-cyan-500'];
  let index = parseInt(id.slice(-2), 16) % colors.length;
  return colors[index];
};

let Dashboard = () => {
  let { user, logout } = useContext(AuthContext);
  let { theme, toggleTheme } = useContext(ThemeContext);
  
  let [contacts, setContacts] = useState([]);
  let [searchTerm, setSearchTerm] = useState('');
  let [isModalOpen, setIsModalOpen] = useState(false);
  let [editingContact, setEditingContact] = useState(null);
  let [loading, setLoading] = useState(true);
  let [activeFilter, setActiveFilter] = useState('all'); 
  let [activeLetter, setActiveLetter] = useState(null); 
  let [selectedTag, setSelectedTag] = useState(null);
  
  let sectionRefs = useRef({}); 

  let allUniqueTags = useMemo(() => {
    let tagSet = new Set();
    contacts.forEach(c => {
      if (c.tags && Array.isArray(c.tags)) {
        c.tags.forEach(t => {
          if (t.trim()) tagSet.add(t.trim());
        });
      }
    });
    return Array.from(tagSet).sort();
  }, [contacts]);

  let processedData = useMemo(() => {
    let filtered = [...contacts]; 

    if (searchTerm) {
      let lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.firstName?.toLowerCase().includes(lowerSearch)
      );
    }

    if (activeFilter === 'favorites') {
      filtered = filtered.filter(c => c.isFavorite);
    }

    if (selectedTag) {
      filtered = filtered.filter(c => 
        c.tags && Array.isArray(c.tags) && 
        c.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
      let nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });

    let groups = {};
    filtered.forEach(contact => {
      let char = '#';
      let firstChar = contact.firstName?.charAt(0).toUpperCase();
      
      if (firstChar && /[A-Z]/.test(firstChar)) {
        char = firstChar;
      }
      
      if (!groups[char]) groups[char] = [];
      groups[char].push(contact);
    });

    return { groups, totalCount: filtered.length };
  }, [contacts, searchTerm, activeFilter, selectedTag]);

  let fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      let { data } = await api.get('/contacts');
      setContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch contacts", error);
      setContacts([]);
      if (error.response?.status !== 401) {
        toast.error("Could not load contacts");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  let handleToggleFavorite = async (contactId) => {
    try {
      let response = await api.patch(`/contacts/${contactId}/favorite`);
      setContacts(prev => prev.map(c => c._id === contactId ? { ...c, isFavorite: response.data.isFavorite } : c));
      toast.success(response.data.isFavorite ? "Added to Favorites" : "Removed from Favorites");
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  let openEditModal = (contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  let closeModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
  };

  let handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await api.delete(`/contacts/${id}`);
        setContacts(prev => prev.filter(c => c._id !== id));
        toast.success('Deleted successfully');
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  let handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  let handleSelectLetter = (letter) => {
    setActiveLetter(letter);
    
    if (letter === '#') {
       window.scrollTo({ top: 0, behavior: 'smooth' });
       return;
    }
    if (letter === 'BOTTOM') {
       window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
       return;
    }

    let element = sectionRefs.current[letter];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      toast(`No contacts starting with ${letter}`);
    }
  };

  let exportContacts = () => {
    if (!contacts || contacts.length === 0) {
      toast.error("No contacts to export!");
      return;
    }

    try {
      let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contacts, null, 2));
      
      let downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      
      let date = new Date().toISOString().split('T')[0];
      downloadAnchorNode.setAttribute("download", `connex_backup_${date}.json`);
      
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast.success(`${contacts.length} contacts exported successfully!`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export contacts.");
    }
  };

  let importContacts = async (event) => {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        let importedData = [];
        let fileContent = e.target.result;

        if (file.name.endsWith('.json')) {
          let parsed = JSON.parse(fileContent);
          if (!Array.isArray(parsed)) throw new Error("Invalid JSON format.");
          importedData = parsed;
          
        } else if (file.name.endsWith('.vcf') || file.type.includes('vcard')) {
          let vcardBlocks = fileContent.split('BEGIN:VCARD').slice(1);
          
          importedData = vcardBlocks.map(block => {
            let lines = block.split('\n').map(line => line.trim()).filter(Boolean);
            
            let firstName = '';
            let lastName = '';
            let phone = '';
            let email = '';
            let company = '';

            lines.forEach(line => {
              let upperLine = line.toUpperCase();
              
              if (upperLine.startsWith('FN:')) {
                let fullName = line.substring(3).trim();
                let nameParts = fullName.split(' ');
                firstName = nameParts[0] || '';
                lastName = nameParts.slice(1).join(' ') || '';
              } else if (upperLine.startsWith('N:') && !firstName) {
                let parts = line.substring(2).split(';');
                lastName = parts[0] || '';
                firstName = parts[1] || '';
              }
              
              else if (upperLine.startsWith('TEL') && !phone) {
                let lastColonIndex = line.lastIndexOf(':');
                if (lastColonIndex > -1) {
                  let rawNumber = line.substring(lastColonIndex + 1).trim();
                  phone = rawNumber.replace(/[^+\d]/g, '');
                }
              }
              
              else if (upperLine.startsWith('EMAIL') && !email) {
                let lastColonIndex = line.lastIndexOf(':');
                if (lastColonIndex > -1) {
                  email = line.substring(lastColonIndex + 1).trim();
                }
              }
              
              else if (upperLine.startsWith('ORG:') && !company) {
                let orgValue = line.substring(4).trim();
                company = orgValue.split(';')[0] || '';
              }
            });

            return {
              firstName,
              lastName,
              email,
              phone,
              company,
              tags: [],
              isFavorite: false
            };
          }).filter(c => c.firstName || c.email || c.phone);
          
        } else {
          throw new Error("Unsupported file type. Please upload .json or .vcf file.");
        }

        if (importedData.length === 0) {
          throw new Error("No valid contacts found in file.");
        }

        setLoading(true); 
          
        let existingEmails = new Set(
          contacts.map(c => c.email?.toLowerCase()).filter(Boolean)
        );
          
        let successCount = 0;
        let skippedCount = 0;

        for (let contact of importedData) {
          let rawFirstName = String(contact.firstName || '').trim();
          let rawLastName = String(contact.lastName || '').trim();
          let rawEmail = String(contact.email || '').trim().toLowerCase();
          
          let rawPhone = '';
          if (contact.phone && String(contact.phone).trim() !== '') {
            rawPhone = String(contact.phone).trim();
          } else if (contact.phoneNumber && String(contact.phoneNumber).trim() !== '') {
            rawPhone = String(contact.phoneNumber).trim();
          } else if (contact.number && String(contact.number).trim() !== '') {
            rawPhone = String(contact.number).trim();
          } else if (contact.mobile && String(contact.mobile).trim() !== '') {
            rawPhone = String(contact.mobile).trim();
          }

          console.log(`Processing ${rawFirstName}: Found Raw Phone -> "${rawPhone}"`);

          let cleanPhone = '';
          if (rawPhone) {
            cleanPhone = rawPhone.replace(/[^+\d]/g, '');
            
            if (cleanPhone.length === 10 && /^[6-9]\d{9}$/.test(cleanPhone)) {
              cleanPhone = '+91' + cleanPhone;
            } else if (cleanPhone.startsWith('0') && cleanPhone.length > 10) {
              cleanPhone = '+91' + cleanPhone.substring(1);
            }
          }

          let hasValidEmail = !!rawEmail;
          let hasValidPhone = !!cleanPhone && cleanPhone.length >= 10; 

          if (!hasValidEmail && !hasValidPhone && !rawFirstName) {
            console.warn(`Skipping totally useless record.`);
            skippedCount++;
            continue;
          }

          let payloadToSend = null; 

          try {
            payloadToSend = {
              firstName: rawFirstName || 'Unknown', 
              lastName: rawLastName,
              email: rawEmail,
              phone: cleanPhone,
              company: String(contact.company || '').trim(),
              tags: Array.isArray(contact.tags) ? contact.tags.map(String) : [],
              notes: String(contact.notes || ''),
              isFavorite: contact.isFavorite === true
            };

            await api.post('/contacts', payloadToSend);
            
            if (rawEmail) existingEmails.add(rawEmail);
            successCount++;
          } catch (err) {
            let nameToLog = payloadToSend ? payloadToSend.firstName : "Unknown Record";
            console.error(`Failed to save ${nameToLog}:`, err.response?.data || err.message);
            skippedCount++;
          }
        }

        await fetchContacts();
          
        toast.success(`Sync Complete! Added: ${successCount}, Skipped: ${skippedCount}`);

      } catch (error) {
        console.error("Import Parse Error:", error);
        toast.error(error.message || "Error reading file.");
      } finally {
        setLoading(false);
        event.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  let stats = useMemo(() => {
    let total = contacts.length;
    let favs = contacts.filter(c => c.isFavorite).length;
    
    let tagMap = {};
    contacts.forEach(c => {
      if (c.tags && Array.isArray(c.tags)) {
        c.tags.forEach(t => {
          let lt = t.toLowerCase().trim();
          if(lt) tagMap[lt] = (tagMap[lt] || 0) + 1;
        });
      }
    });
    
    let uniqueCount = Object.keys(tagMap).length;
    let topTags = Object.entries(tagMap)
      .sort((a,b) => b[1]-a[1])
      .slice(0, 3);

    return { total, favs, uniqueCount, topTags };
  }, [contacts]);


  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <nav className="sticky top-0 z-40 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Connex
        </h1>
        <div className="flex items-center gap-4">
          <span className="hidden md:block text-sm font-medium text-slate-600 dark:text-zinc-400">
            Hi, {user?.name || 'User'} 👋
          </span>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all duration-200 border border-slate-200 dark:border-zinc-700"
          >
            {theme === 'light' ? (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors border border-rose-100 dark:border-rose-900/30"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8 pb-24"> 
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div 
            onClick={() => setActiveFilter('all')}
            className={`cursor-pointer bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border transition-all duration-200 group relative overflow-hidden ${activeFilter === 'all' ? 'ring-2 ring-indigo-500/50 border-indigo-500' : 'border-slate-200 dark:border-zinc-800 hover:shadow-md'}`}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Total Contacts</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setActiveFilter(activeFilter === 'favorites' ? 'all' : 'favorites')}
            className={`cursor-pointer bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border transition-all duration-200 group relative overflow-hidden ${activeFilter === 'favorites' ? 'ring-2 ring-amber-500/50 border-amber-500' : 'border-slate-200 dark:border-zinc-800 hover:shadow-md'}`}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Favorites</p>
                <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{stats.favs}</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 hover:shadow-md transition-shadow group relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
             
            <div className="flex items-center justify-between relative z-10 mb-2">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Top Tags</p>
                <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{stats.uniqueCount}</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {stats.topTags.length > 0 ? (
                stats.topTags.map(([tag, count], index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-100 dark:border-purple-800/50"
                  >
                    #{tag} <span className="ml-1 opacity-70 font-bold">×{count}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 dark:text-zinc-500 italic">No tags assigned yet</span>
              )}
            </div>
          </div>
        </div> 

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search contact by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-zinc-700 rounded-xl leading-5 bg-white dark:bg-zinc-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-colors shadow-sm text-slate-900 dark:text-white"
            />
          </div>
          
          <div className="flex flex-wrap items-center justify-end gap-3 w-full lg:w-auto">
            
            <TagFilterDropdown 
              allTags={allUniqueTags} 
              activeTag={selectedTag} 
              onSelectTag={setSelectedTag} 
            />

            <button 
              onClick={exportContacts}
              disabled={loading || contacts.length === 0}
              title="Download Backup (.json)"
              className="inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium rounded-xl shadow-sm border border-emerald-200 dark:border-emerald-800 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Export
            </button>

            <label className="inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium rounded-xl shadow-sm border border-indigo-200 dark:border-indigo-800 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-all cursor-pointer whitespace-nowrap">
              <input 
                type="file" 
                accept=".json,.vcf,text/vcard"
                className="hidden" 
                onChange={importContacts}
                disabled={loading}
              />
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Sync Phone
            </label>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex justify-center items-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/30 text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-900 transition-all active:scale-95 whitespace-nowrap"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Contact
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : processedData.totalCount === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700">
            <svg className="mx-auto h-12 w-12 text-slate-400 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
              {searchTerm ? `No results for "${searchTerm}"` : selectedTag ? `No contacts with tag #${selectedTag}` : 'No contacts found'}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
              {(searchTerm || selectedTag) ? 'Try clearing filters or search term.' : 'Add your first contact to get started.'}
            </p>
            {!searchTerm && !selectedTag && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add First Contact
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(processedData.groups).map(([letter, list]) => (
              <section 
                key={letter}
                ref={(el) => { sectionRefs.current[letter] = el; }}
                className="scroll-mt-24" 
              >
                <div className="sticky top-20 z-10 mb-4 inline-flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-700 shadow-sm">
                  <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">{letter}</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">
                    {list.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {list.map((contact) => {
                    let avatarColor = getColorIndex(contact._id);
                    
                    return (
                      <div 
                        key={contact._id} 
                        className="group relative bg-white/5 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-zinc-700/50 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full min-h-[240px]"
                      >
                        
                        <div 
                          className={`absolute top-0 left-0 right-0 h-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                            ${contact.isFavorite 
                              ? 'opacity-100 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500' 
                              : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                            }`}
                        ></div>

                        <div className="p-5 flex flex-col gap-4 flex-grow"> 
                          
                          <div className="relative flex items-start justify-between gap-3 pb-2">
                            
                            <div className="flex items-center gap-3 min-w-0 flex-grow pr-16"> 
                              
                              <div className={`w-12 h-12 rounded-xl ${avatarColor} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md ring-2 ring-white/5 dark:ring-black/20`}>
                                {getInitials(contact.firstName, contact.lastName)}
                              </div>
                              
                              <div className="min-w-0 flex flex-col justify-center">
                                
                                <h3 
                                  className="text-base md:text-lg font-semibold text-slate-900 dark:text-white leading-tight tracking-tight break-words"
                                  title={`${contact.firstName} ${contact.lastName}`}
                                >
                                  {contact.firstName}{' '}
                                  <span className="text-slate-500 dark:text-zinc-400 font-normal">
                                    {contact.lastName}
                                  </span>
                                </h3>
                                
                                <p 
                                  className="text-xs md:text-sm text-slate-500 dark:text-zinc-400 mt-1 truncate cursor-help font-light opacity-80 hover:opacity-100 transition-opacity"
                                  title={contact.email}
                                >
                                  {contact.email || 'No email provided'}
                                </p>
                              </div>
                            </div>

                            <div className="absolute top-0 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-zinc-900/90 dark:bg-black/80 backdrop-blur-md p-1.5 rounded-lg shadow-lg border border-zinc-700/50 z-30">
                              
                              <button 
                                onClick={() => openEditModal(contact)}
                                className="p-1.5 rounded-md text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 active:bg-blue-500/20 transition-all duration-200"
                                title="Edit Contact"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>

                              <button 
                                onClick={() => handleDelete(contact._id)}
                                className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-500/10 active:bg-red-500/20 transition-all duration-200"
                                title="Delete Contact"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>

                              <button 
                                onClick={() => handleToggleFavorite(contact._id)}
                                className={`p-1.5 rounded-md transition-all duration-200 ${
                                  contact.isFavorite 
                                    ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]' 
                                    : 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'
                                }`}
                                title={contact.isFavorite ? "Remove Favorite" : "Add Favorite"}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <div className="flex-grow"></div> 

                          {(contact.company || (contact.tags && contact.tags.length > 0)) && (
                            <div className="flex flex-col gap-2 pt-1 pb-3 border-b border-slate-200/50 dark:border-zinc-700/50">
                              
                              {contact.company && (
                                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 dark:text-zinc-300 font-medium bg-slate-100/50 dark:bg-zinc-800/50 px-2 py-1 rounded-md w-fit max-w-full">
                                  <svg className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                  <span className="truncate">{contact.company}</span>
                                </div>
                              )}
                              
                              {contact.tags && contact.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {contact.tags.slice(0, 3).map((tag, idx) => (
                                    <span 
                                      key={idx} 
                                      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] md:text-[11px] font-bold uppercase tracking-wide bg-indigo-50/80 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50"
                                    >
                                      #{String(tag).toLowerCase()}
                                    </span>
                                  ))}
                                  {contact.tags.length > 3 && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] md:text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-zinc-800">
                                      +{contact.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 pt-3">
                            
                            <a 
                              href={getTelLink(contact.phone)}
                              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100/80 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-200 font-semibold text-xs md:text-sm hover:bg-indigo-600 hover:text-white active:scale-95 transition-all shadow-sm border border-transparent hover:border-indigo-500 backdrop-blur-sm"
                            >
                              <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                              Call
                            </a>

                            <a 
                              href={getWaLink(contact.phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-semibold text-xs md:text-sm hover:bg-emerald-600 hover:text-white active:scale-95 transition-all shadow-sm border border-transparent hover:border-emerald-500 backdrop-blur-sm"
                            >
                              <svg className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.05-.52-.099-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a1.563 1.563 0 00-.347-.014c-.198.001-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                              Chat
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <AlphabetSidebar 
        onSelectLetter={handleSelectLetter} 
        activeLetter={activeLetter} 
      />

      <AddContactModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onContactSaved={(newData) => { 
          let updatedList;
          
          if(editingContact) {
            updatedList = contacts.map(c => c._id === newData._id ? newData : c);
          } else {
            updatedList = [...contacts, newData];
          }
          
          setContacts(updatedList);
          closeModal();
          toast.success(editingContact ? 'Contact updated!' : 'New contact added!');
        }} 
        initialData={editingContact}
      />
    </div>
  );
};

export default Dashboard;
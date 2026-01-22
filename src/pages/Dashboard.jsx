import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { authService } from '../services/authService';
import FirmsTable from '../components/FirmsTable';
import AutocompleteInput from '../components/AutocompleteInput';

function Dashboard() {
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firmFilter, setFirmFilter] = useState('');
  const [advocateSearch, setAdvocateSearch] = useState('');
  const [notification, setNotification] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(new Set());
  const [firmNames, setFirmNames] = useState([]);
  const [advocateNames, setAdvocateNames] = useState([]);
  const searchTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const admin = authService.getAdmin();

  // Load dropdown options once on mount
  useEffect(() => {
    loadFirmNames();
    loadAdvocateNames();
    loadFirms();
  }, []);

  useEffect(() => {
    loadFirms();
  }, [firmFilter]);

  // Load firm names for dropdown
  const loadFirmNames = async () => {
    try {
      const response = await adminAPI.getAllFirmsWithAdvocates();
      if (response.success && response.data && response.data.firms) {
        const names = response.data.firms
          .map(firm => firm.lName || firm.firmName)
          .filter(name => name && name.trim());
        setFirmNames([...new Set(names)]);
      }
    } catch (err) {
      console.error('Error loading firm names:', err);
    }
  };

  // Load advocate names for dropdown
  const loadAdvocateNames = async (selectedFirmName = null) => {
    try {
      if (selectedFirmName && firms.length > 0) {
        const selectedFirm = firms.find(
          firm => (firm.lName || firm.firmName) === selectedFirmName
        );
        if (selectedFirm && selectedFirm.advocates) {
          const names = selectedFirm.advocates
            .map(advocate => advocate.name)
            .filter(name => name && name.trim());
          setAdvocateNames([...new Set(names)]);
          return;
        }
      }
      
      const response = await adminAPI.getAllAdvocates();
      if (response.success && response.data) {
        const names = response.data
          .map(advocate => advocate.name)
          .filter(name => name && name.trim());
        setAdvocateNames([...new Set(names)]);
      }
    } catch (err) {
      console.error('Error loading advocate names:', err);
    }
  };

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      loadFirms();
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [advocateSearch]);

  const loadFirms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAllFirmsWithAdvocates(
        firmFilter || null
      );
      
      if (response.success && response.data) {
        let firmsData = response.data.firms || [];
        
        if (advocateSearch.trim()) {
          const searchTerm = advocateSearch.toLowerCase();
          firmsData = firmsData
            .map(firm => {
              const matchingAdvocates = (firm.advocates || []).filter(advocate => 
                (advocate.name?.toLowerCase().includes(searchTerm)) ||
                (advocate.email?.toLowerCase().includes(searchTerm)) ||
                (advocate.phone?.toLowerCase().includes(searchTerm))
              );
              
              return {
                ...firm,
                advocates: matchingAdvocates.map(adv => ({ ...adv })),
                advocateCount: matchingAdvocates.length
              };
            })
            .filter(firm => firm.advocates && firm.advocates.length > 0);
        }
        
        setFirms(firmsData);
        
        if (firmFilter && firmsData.length > 0) {
          const selectedFirm = firmsData.find(
            firm => {
              const firmName = (firm.lName || firm.firmName || '').toLowerCase();
              const filterName = firmFilter.toLowerCase();
              return firmName === filterName || firmName.includes(filterName);
            }
          );
          if (selectedFirm && selectedFirm.advocates && selectedFirm.advocates.length > 0) {
            const names = selectedFirm.advocates
              .map(advocate => advocate.name)
              .filter(name => name && name.trim());
            setAdvocateNames([...new Set(names)]);
          } else {
            setAdvocateNames([]);
          }
        } else if (!firmFilter) {
          const response = await adminAPI.getAllAdvocates();
          if (response.success && response.data) {
            const names = response.data
              .map(advocate => advocate.name)
              .filter(name => name && name.trim());
            setAdvocateNames([...new Set(names)]);
          }
        }
      } else {
        setError('Failed to load firms data');
      }
    } catch (err) {
      console.error('Error loading firms:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load firms');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = (userId, newStatus) => {
    setFirms(prevFirms => 
      prevFirms.map(firm => ({
        ...firm,
        advocates: firm.advocates?.map(advocate => 
          advocate.id === userId 
            ? { ...advocate, status: newStatus }
            : advocate
        ) || []
      }))
    );
  };

  const handleActivate = async (userId, userName) => {
    setLoadingUsers(prev => new Set(prev).add(userId));
    try {
      const response = await adminAPI.activateUser(userId);
      if (response.success) {
        updateUserStatus(userId, 'Active');
        showNotification(`User "${userName}" activated successfully. Activation email sent.`, 'success');
      } else {
        showNotification(`Failed to activate user: ${response.message}`, 'error');
      }
    } catch (err) {
      console.error('Error activating user:', err);
      showNotification(
        `Error activating user: ${err.response?.data?.message || err.message}`,
        'error'
      );
    } finally {
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleDeactivate = async (userId, userName) => {
    setLoadingUsers(prev => new Set(prev).add(userId));
    try {
      const response = await adminAPI.deactivateUser(userId);
      if (response.success) {
        updateUserStatus(userId, 'Inactive');
        showNotification(`User "${userName}" deactivated successfully.`, 'success');
      } else {
        showNotification(`Failed to deactivate user: ${response.message}`, 'error');
      }
    } catch (err) {
      console.error('Error deactivating user:', err);
      showNotification(
        `Error deactivating user: ${err.response?.data?.message || err.message}`,
        'error'
      );
    } finally {
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleLogout = () => {
    authService.clearAuth();
    navigate('/login');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 hover:opacity-75"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-primary-purple text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="mt-2 text-purple-100">Manage Firms & Advocates</p>
            </div>
            <div className="flex items-center gap-4">
              {admin && (
                <span className="text-purple-100 text-sm">
                  {admin.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white text-primary-purple rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
          {/* Navigation Tabs */}
          <div className="mt-4 flex gap-4 border-t border-purple-400 pt-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Firms & Advocates
            </button>
            <button
              onClick={() => navigate('/courts')}
              className="px-4 py-2 text-purple-100 hover:text-white hover:bg-purple-600 rounded-lg transition-colors text-sm font-medium"
            >
              Court Master
            </button>
          </div>
        </div>
      </header>

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Firm Name Filter */}
            <div>
              <AutocompleteInput
                label="Filter by Firm Name"
                value={firmFilter}
                onChange={(value) => {
                  setFirmFilter(value);
                  setAdvocateSearch('');
                }}
                options={firmNames}
                placeholder="Select or type firm name..."
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>

            {/* Advocate Search */}
            <div>
              <AutocompleteInput
                label="Search Advocates"
                value={advocateSearch}
                onChange={(value) => {
                  setAdvocateSearch(value);
                  if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                  }
                  searchTimeoutRef.current = setTimeout(() => {
                    loadFirms();
                  }, 300);
                }}
                options={advocateNames}
                placeholder="Select or type advocate name..."
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
                onSelect={() => {
                  if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                  }
                  loadFirms();
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-red-900">Error Loading Data</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={loadFirms}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : firms.length > 0 ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Firms ({firms.length})
              </h2>
              <button
                onClick={loadFirms}
                disabled={loading}
                className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                  loading
                    ? 'bg-primary-purple-dark cursor-not-allowed opacity-75'
                    : 'bg-primary-purple hover:bg-primary-purple-dark'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </button>
            </div>
            <FirmsTable
              firms={firms}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
              loadingUsers={loadingUsers}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Firms Found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {firmFilter
                ? 'No firms match your filter. Try a different search term.'
                : 'The Admin Panel will display firms and advocates once users register.'}
            </p>
            <button
              onClick={loadFirms}
              disabled={loading}
              className={`mt-6 px-4 py-2 text-white rounded-lg transition-colors inline-flex items-center gap-2 ${
                loading
                  ? 'bg-primary-purple-dark cursor-not-allowed opacity-75'
                  : 'bg-primary-purple hover:bg-primary-purple-dark'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;

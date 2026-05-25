import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { authService } from '../services/authService';

function CaseDetails() {
  const navigate = useNavigate();
  const admin = authService.getAdmin();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [petitionTypes, setPetitionTypes] = useState([]);

  const [filters, setFilters] = useState([
    { id: 0, type: 'keyword', value: '' },
  ]);
  const [filterCount, setFilterCount] = useState(0);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  const filterRef = useRef(null);
  const addRef = useRef(null);

  const filterOptions = [
    { key: 'keyword', label: 'Keyword', placeholder: 'Search...' },
    { key: 'lawyer', label: 'Lawyer', placeholder: 'Lawyer name...' },
    { key: 'petitionType', label: 'Petition Type', placeholder: 'e.g. Bail, Criminal...' },
    { key: 'accused', label: 'Accused', placeholder: 'Accused name...' },
    { key: 'respondent', label: 'Respondent', placeholder: 'Police station, bank...' },
  ];

  const petitionTypeOptions = ['Bail', 'Criminal', 'Civil', 'Property', 'Family', 'Consumer', 'Writ', 'Others'];

  useEffect(() => {
    loadPetitionTypes();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterDropdown(false);
      }
      if (addRef.current && !addRef.current.contains(e.target)) {
        setShowAddDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      runSearch();
    }, 400);
    return () => clearTimeout(timeout);
  }, [filters]);

  const loadPetitionTypes = async () => {
    try {
      const response = await adminAPI.getPetitionTypes();
      if (response.success && response.data) {
        setPetitionTypes(response.data.map((pt) => pt.pt_text || pt.ptText));
      }
    } catch (_) {
      // Use hardcoded fallback
    }
  };

  const runSearch = async () => {
    const activeFilters = filters.filter((f) => f.value.trim());
    if (activeFilters.length === 0) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = {};
      activeFilters.forEach((f) => {
        if (f.type === 'keyword') params.keyword = f.value;
        else if (f.type === 'lawyer') params.lawyer = f.value;
        else if (f.type === 'petitionType') params.petitionType = f.value;
        else if (f.type === 'accused') params.accusedName = f.value;
        else if (f.type === 'respondent') params.respondent = f.value;
      });

      const response = await adminAPI.searchCases(params);
      if (response.success) {
        setResults(response.data || []);
      } else {
        setError(response.message || 'Search failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const selectFilter = (type) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === 0 ? { ...f, type, value: '' } : f))
    );
    setShowFilterDropdown(false);
  };

  const addNewFilter = (type) => {
    const newId = filterCount + 1;
    setFilterCount(newId);
    setFilters((prev) => [...prev, { id: newId, type, value: '' }]);
    setShowAddDropdown(false);
  };

  const removeFilter = (id) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFilterValue = (id, value) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value } : f))
    );
  };

  const getLabel = (type) => {
    return filterOptions.find((o) => o.key === type)?.label || 'Keyword';
  };

  const getPlaceholder = (type) => {
    return filterOptions.find((o) => o.key === type)?.placeholder || 'Search...';
  };

  const handleLogout = () => {
    authService.clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-purple text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="mt-2 text-purple-100">Case Details</p>
            </div>
            <div className="flex items-center gap-4">
              {admin && (
                <span className="text-purple-100 text-sm">{admin.email}</span>
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
              className="px-4 py-2 text-purple-100 hover:text-white hover:bg-purple-600 rounded-lg transition-colors text-sm font-medium"
            >
              Firms & Advocates
            </button>
            <button
              onClick={() => navigate('/courts')}
              className="px-4 py-2 text-purple-100 hover:text-white hover:bg-purple-600 rounded-lg transition-colors text-sm font-medium"
            >
              Courts
            </button>
            <button
              onClick={() => navigate('/court-types')}
              className="px-4 py-2 text-purple-100 hover:text-white hover:bg-purple-600 rounded-lg transition-colors text-sm font-medium"
            >
              Court Types
            </button>
            <button
              onClick={() => navigate('/case-details')}
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Case Details
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Row */}
        <div className="flex items-center gap-3 flex-wrap mb-6">
          {/* Filter Boxes */}
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white"
            >
              <span className="px-3 py-2.5 bg-gray-100 text-xs font-semibold text-gray-600 border-r border-gray-300 whitespace-nowrap">
                {getLabel(filter.type)}
              </span>
              {filter.type === 'petitionType' ? (
                <select
                  value={filter.value}
                  onChange={(e) => updateFilterValue(filter.id, e.target.value)}
                  className="px-3 py-2.5 text-sm border-none outline-none w-44 bg-white"
                >
                  <option value="">All</option>
                  {petitionTypeOptions.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={filter.value}
                  onChange={(e) => updateFilterValue(filter.id, e.target.value)}
                  placeholder={getPlaceholder(filter.type)}
                  className="px-3 py-2.5 text-sm border-none outline-none w-44"
                />
              )}
              {filter.id !== 0 && (
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="px-2 text-gray-400 hover:text-red-500 text-lg"
                >
                  &times;
                </button>
              )}
            </div>
          ))}

          {/* Filter Button */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowAddDropdown(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-purple text-white rounded-lg text-sm font-medium hover:bg-primary-purple-dark transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
            {showFilterDropdown && (
              <div className="absolute left-0 top-full mt-1 z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => selectFilter(opt.key)}
                    className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Button */}
          {filters.length > 0 && (
            <div className="relative" ref={addRef}>
              <button
                onClick={() => {
                  setShowAddDropdown(!showAddDropdown);
                  setShowFilterDropdown(false);
                }}
                className="flex items-center justify-center p-2.5 bg-primary-purple text-white rounded-lg hover:bg-primary-purple-dark transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              {showAddDropdown && (
                <div className="absolute left-0 top-full mt-1 z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => addNewFilter(opt.key)}
                      className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Results</h2>
          {hasSearched && (
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {results.length} case{results.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="animate-spin h-8 w-8 mx-auto text-primary-purple" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 text-sm text-gray-500">Searching...</p>
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="mt-3 text-sm text-gray-500">No cases match your filters.</p>
          </div>
        ) : results.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-purple">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Case ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Lawyer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Accused</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Respondent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Petition</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((c, idx) => (
                    <tr key={c.caseId || idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-primary-purple">
                        {c.caseId || c.case_id || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {c.description || c.desc || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {c.lawyerName || c.lawyer_name || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {c.accusedNames || c.accused_names || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {c.respondentNames || c.respondent_names || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">
                          {c.petitionTypes || c.petition_types || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            c.status === 'active' || c.status === 'Active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {c.status || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="mt-3 text-sm text-gray-500">
              Use the search and filter options above to find cases.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default CaseDetails;

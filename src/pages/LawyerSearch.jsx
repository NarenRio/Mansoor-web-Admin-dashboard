import { useState, useEffect, useRef, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { REGION_DISTRICTS, DISTRICT_CITIES_EXTRA } from '../data/districtsByState';

const MOCK_LAWYERS = [
  { id: 1, name: 'Adv. Rajesh Kumar', email: 'rajesh.kumar@lawfirm.in', phone: '+91 98765 43210', specialization: 'Criminal Law', firm: 'Kumar & Associates', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', pincode: '600001', address: '12, Mount Road, Chennai', cases: 47, status: 'Active' },
  { id: 2, name: 'Adv. Priya Nair', email: 'priya.nair@legalaid.in', phone: '+91 94567 12345', specialization: 'Family Law', firm: 'Nair Legal Services', city: 'Kochi', district: 'Ernakulam', state: 'Kerala', pincode: '682001', address: '8, MG Road, Kochi', cases: 32, status: 'Active' },
  { id: 3, name: 'Adv. Suresh Babu', email: 'suresh.babu@counsel.in', phone: '+91 99887 76655', specialization: 'Property Law', firm: 'Babu & Partners', city: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', pincode: '641001', address: '45, RS Puram, Coimbatore', cases: 58, status: 'Active' },
  { id: 4, name: 'Adv. Meena Sundaram', email: 'meena.s@advocates.in', phone: '+91 87654 32109', specialization: 'Civil Law', firm: 'Sundaram Legal Chambers', city: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', pincode: '625001', address: '22, West Masi Street, Madurai', cases: 25, status: 'Active' },
  { id: 5, name: 'Adv. Arun Prakash', email: 'arun.p@lawhouse.in', phone: '+91 97531 24680', specialization: 'Corporate Law', firm: 'Prakash & Co', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', pincode: '560001', address: '101, MG Road, Bengaluru', cases: 73, status: 'Active' },
  { id: 6, name: 'Adv. Lakshmi Devi', email: 'lakshmi.d@lawcorp.in', phone: '+91 86420 97531', specialization: 'Tax Law', firm: 'Devi & Associates', city: 'Thiruvananthapuram', district: 'Thiruvananthapuram', state: 'Kerala', pincode: '695001', address: '3, Vazhuthacaud, Thiruvananthapuram', cases: 19, status: 'Active' },
  { id: 7, name: 'Adv. Venkatesh Iyer', email: 'venkatesh@iyerlaw.in', phone: '+91 91234 56789', specialization: 'Criminal Law', firm: 'Iyer Legal Solutions', city: 'Salem', district: 'Salem', state: 'Tamil Nadu', pincode: '636001', address: '67, Cherry Road, Salem', cases: 41, status: 'Inactive' },
  { id: 8, name: 'Adv. Divya Menon', email: 'divya.menon@counsel.in', phone: '+91 90876 54321', specialization: 'Labour Law', firm: 'Menon & Menon Advocates', city: 'Kozhikode', district: 'Kozhikode', state: 'Kerala', pincode: '673001', address: '15, SM Street, Kozhikode', cases: 28, status: 'Active' },
  { id: 9, name: 'Adv. Karthik Rajan', email: 'karthik.r@advocates.in', phone: '+91 89012 34567', specialization: 'Intellectual Property', firm: 'Rajan IP Counsel', city: 'Mysuru', district: 'Mysuru', state: 'Karnataka', pincode: '570001', address: '9, Sayyaji Rao Road, Mysuru', cases: 15, status: 'Active' },
  { id: 10, name: 'Adv. Anitha Krishnan', email: 'anitha.k@legalfirm.in', phone: '+91 78901 23456', specialization: 'Family Law', firm: 'Krishnan & Associates', city: 'Tiruchirappalli', district: 'Tiruchirappalli', state: 'Tamil Nadu', pincode: '620001', address: '31, Cantonment, Tiruchirappalli', cases: 36, status: 'Active' },
  { id: 11, name: 'Adv. Mohan Das', email: 'mohan.das@lawpoint.in', phone: '+91 96543 21098', specialization: 'Property Law', firm: 'Das Legal Group', city: 'Mangaluru', district: 'Dakshina Kannada', state: 'Karnataka', pincode: '575001', address: '44, Hampankatta, Mangaluru', cases: 52, status: 'Active' },
  { id: 12, name: 'Adv. Saranya Pillai', email: 'saranya.p@lawaid.in', phone: '+91 85432 10987', specialization: 'Consumer Law', firm: 'Pillai Law Office', city: 'Kollam', district: 'Kollam', state: 'Kerala', pincode: '691001', address: '7, Chinnakkada, Kollam', cases: 22, status: 'Active' },
  { id: 13, name: 'Adv. Gopal Reddy', email: 'gopal.r@reddy-law.in', phone: '+91 74321 09876', specialization: 'Civil Law', firm: 'Reddy & Reddy Associates', city: 'Belagavi', district: 'Belagavi', state: 'Karnataka', pincode: '590001', address: '56, College Road, Belagavi', cases: 61, status: 'Active' },
  { id: 14, name: 'Adv. Nithya Shankar', email: 'nithya.s@lawchambers.in', phone: '+91 93210 98765', specialization: 'Criminal Law', firm: 'Shankar Legal Services', city: 'Vellore', district: 'Vellore', state: 'Tamil Nadu', pincode: '632001', address: '18, Long Bazaar, Vellore', cases: 33, status: 'Active' },
  { id: 15, name: 'Adv. Ramesh Hegde', email: 'ramesh.h@hegdelaw.in', phone: '+91 82109 87654', specialization: 'Corporate Law', firm: 'Hegde & Partners', city: 'Hubballi', district: 'Dharwad', state: 'Karnataka', pincode: '580001', address: '29, Lamington Road, Hubballi', cases: 44, status: 'Inactive' },
  { id: 16, name: 'Adv. Jayanthi Raman', email: 'jayanthi.r@jrlaw.in', phone: '+91 71098 76543', specialization: 'Tax Law', firm: 'Raman Tax Advocates', city: 'Thanjavur', district: 'Thanjavur', state: 'Tamil Nadu', pincode: '613001', address: '5, South Main Street, Thanjavur', cases: 17, status: 'Active' },
  { id: 17, name: 'Adv. Harish Gowda', email: 'harish.g@advocatesg.in', phone: '+91 90987 65432', specialization: 'Labour Law', firm: 'Gowda Law Firm', city: 'Hassan', district: 'Hassan', state: 'Karnataka', pincode: '573201', address: '12, BM Road, Hassan', cases: 29, status: 'Active' },
  { id: 18, name: 'Adv. Revathi Sundaram', email: 'revathi@sundaramlaw.in', phone: '+91 80987 65432', specialization: 'Family Law', firm: 'Sundaram Legal Aid', city: 'Tirunelveli', district: 'Tirunelveli', state: 'Tamil Nadu', pincode: '627001', address: '14, High Ground, Tirunelveli', cases: 38, status: 'Active' },
  { id: 19, name: 'Adv. Siddharth Jain', email: 'siddharth@jainlaw.in', phone: '+91 79876 54321', specialization: 'Intellectual Property', firm: 'Jain IP Associates', city: 'Whitefield', district: 'Bengaluru Urban', state: 'Karnataka', pincode: '560066', address: '202, ITPL Road, Whitefield', cases: 21, status: 'Active' },
  { id: 20, name: 'Adv. Deepa Thomas', email: 'deepa.t@thomaslaw.in', phone: '+91 68765 43210', specialization: 'Consumer Law', firm: 'Thomas & Associates', city: 'Thrissur', district: 'Thrissur', state: 'Kerala', pincode: '680001', address: '33, Round South, Thrissur', cases: 26, status: 'Active' },
];

const SPECIALIZATIONS = [
  'Criminal Law', 'Family Law', 'Property Law', 'Civil Law',
  'Corporate Law', 'Tax Law', 'Labour Law', 'Intellectual Property', 'Consumer Law',
];

const ALL_STATES = Object.keys(REGION_DISTRICTS).sort();

function getDistrictsForState(state) {
  if (!state) return [];
  return (REGION_DISTRICTS[state] || []).sort();
}

function getCitiesForDistrict(state, district) {
  if (!state || !district) return [];
  const extras = DISTRICT_CITIES_EXTRA[state]?.[district] || [];
  return extras.length > 0 ? extras.sort() : [district];
}

const filterOptions = [
  { key: 'keyword', label: 'Keyword', placeholder: 'Name, firm, email...' },
  { key: 'state', label: 'State', placeholder: 'Select state...' },
  { key: 'district', label: 'District', placeholder: 'Select district...' },
  { key: 'city', label: 'City', placeholder: 'City name...' },
  { key: 'specialization', label: 'Specialization', placeholder: 'Select specialization...' },
];

function LawyerSearch() {
  const navigate = useNavigate();
  const admin = authService.getAdmin();

  const [filters, setFilters] = useState([
    { id: 0, type: 'keyword', value: '' },
  ]);
  const [filterCount, setFilterCount] = useState(0);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  const filterRef = useRef(null);
  const addRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setShowFilterDropdown(false);
      if (addRef.current && !addRef.current.contains(e.target))
        setShowAddDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => runSearch(), 400);
    return () => clearTimeout(timeout);
  }, [filters]);

  const getFilterValue = (type) =>
    filters.find((f) => f.type === type)?.value || '';

  const runSearch = () => {
    const activeFilters = filters.filter((f) => f.value.trim());
    if (activeFilters.length === 0) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setCurrentPage(1);

    setTimeout(() => {
      let filtered = [...MOCK_LAWYERS];

      activeFilters.forEach((f) => {
        const val = f.value.trim().toLowerCase();
        switch (f.type) {
          case 'state':
            filtered = filtered.filter((l) => l.state.toLowerCase() === val);
            break;
          case 'district':
            filtered = filtered.filter((l) => l.district.toLowerCase() === val);
            break;
          case 'city':
            filtered = filtered.filter((l) => l.city.toLowerCase().includes(val));
            break;
          case 'specialization':
            filtered = filtered.filter((l) => l.specialization.toLowerCase() === val);
            break;
          case 'keyword':
            filtered = filtered.filter(
              (l) =>
                l.name.toLowerCase().includes(val) ||
                l.firm.toLowerCase().includes(val) ||
                l.specialization.toLowerCase().includes(val) ||
                l.email.toLowerCase().includes(val) ||
                l.city.toLowerCase().includes(val)
            );
            break;
        }
      });

      setResults(filtered);
      setLoading(false);
    }, 300);
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

  const getLabel = (type) =>
    filterOptions.find((o) => o.key === type)?.label || 'Keyword';

  const getPlaceholder = (type) =>
    filterOptions.find((o) => o.key === type)?.placeholder || 'Search...';

  const renderFilterInput = (filter) => {
    switch (filter.type) {
      case 'state':
        return (
          <select
            value={filter.value}
            onChange={(e) => updateFilterValue(filter.id, e.target.value)}
            className="px-3 py-2.5 text-sm border-none outline-none w-48 bg-white"
          >
            <option value="">All</option>
            {ALL_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        );
      case 'district': {
        const stateVal = getFilterValue('state');
        const districts = getDistrictsForState(stateVal);
        return (
          <select
            value={filter.value}
            onChange={(e) => updateFilterValue(filter.id, e.target.value)}
            className="px-3 py-2.5 text-sm border-none outline-none w-48 bg-white"
          >
            <option value="">All</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        );
      }
      case 'city': {
        const stateVal = getFilterValue('state');
        const districtVal = getFilterValue('district');
        const cities = getCitiesForDistrict(stateVal, districtVal);
        if (cities.length > 0) {
          return (
            <select
              value={filter.value}
              onChange={(e) => updateFilterValue(filter.id, e.target.value)}
              className="px-3 py-2.5 text-sm border-none outline-none w-48 bg-white"
            >
              <option value="">All</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          );
        }
        return (
          <input
            type="text"
            value={filter.value}
            onChange={(e) => updateFilterValue(filter.id, e.target.value)}
            placeholder={getPlaceholder(filter.type)}
            className="px-3 py-2.5 text-sm border-none outline-none w-48"
          />
        );
      }
      case 'specialization':
        return (
          <select
            value={filter.value}
            onChange={(e) => updateFilterValue(filter.id, e.target.value)}
            className="px-3 py-2.5 text-sm border-none outline-none w-48 bg-white"
          >
            <option value="">All</option>
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={filter.value}
            onChange={(e) => updateFilterValue(filter.id, e.target.value)}
            placeholder={getPlaceholder(filter.type)}
            className="px-3 py-2.5 text-sm border-none outline-none w-48"
          />
        );
    }
  };

  const totalPages = Math.ceil(results.length / resultsPerPage);
  const paginatedResults = results.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

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
              <p className="mt-2 text-purple-100">Lawyer Search</p>
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
              className="px-4 py-2 text-purple-100 hover:text-white hover:bg-purple-600 rounded-lg transition-colors text-sm font-medium"
            >
              Case Details
            </button>
            <button
              onClick={() => navigate('/lawyer-search')}
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Lawyer Search
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Row — filter chips + Filter button + Add button */}
        <div className="flex items-center gap-3 flex-wrap mb-6">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white"
            >
              <span className="px-3 py-2.5 bg-gray-100 text-xs font-semibold text-gray-600 border-r border-gray-300 whitespace-nowrap">
                {getLabel(filter.type)}
              </span>
              {renderFilterInput(filter)}
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
              {results.length} lawyer{results.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="animate-spin h-8 w-8 mx-auto text-primary-purple" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 text-sm text-gray-500">Searching lawyers...</p>
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="mt-3 text-sm text-gray-500">No lawyers match your filters.</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-purple">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Lawyer Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Specialization</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Firm</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Cases</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedResults.map((lawyer) => (
                      <Fragment key={lawyer.id}>
                        <tr
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${expandedRow === lawyer.id ? 'bg-purple-50' : ''}`}
                          onClick={() => setExpandedRow(expandedRow === lawyer.id ? null : lawyer.id)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-primary-purple flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {lawyer.name.split(' ').filter((_, i) => i > 0).map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-gray-900">{lawyer.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              {lawyer.specialization}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{lawyer.firm}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-800">{lawyer.city}</div>
                            <div className="text-xs text-gray-400">{lawyer.district}, {lawyer.state}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-800">{lawyer.phone}</div>
                            <div className="text-xs text-gray-400">{lawyer.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold text-primary-purple">{lawyer.cases}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              lawyer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {lawyer.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <svg
                              className={`w-4 h-4 text-gray-400 transition-transform ${expandedRow === lawyer.id ? 'rotate-180' : ''}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </td>
                        </tr>

                        {expandedRow === lawyer.id && (
                          <tr className="bg-purple-50">
                            <td colSpan={8} className="px-4 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-lg p-4 border border-gray-100">
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact Details</h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                      <span className="text-gray-700">{lawyer.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                      <span className="text-gray-700">{lawyer.phone}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                      <span className="text-gray-700">{lawyer.address}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-100">
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Office Location</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">City</span><span className="text-gray-800 font-medium">{lawyer.city}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">District</span><span className="text-gray-800 font-medium">{lawyer.district}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">State</span><span className="text-gray-800 font-medium">{lawyer.state}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">PIN Code</span><span className="text-gray-800 font-medium">{lawyer.pincode}</span></div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-100">
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Case Experience</h4>
                                  <div className="text-center py-2">
                                    <div className="text-3xl font-bold text-primary-purple">{lawyer.cases}</div>
                                    <div className="text-xs text-gray-500 mt-1">Total Cases Handled</div>
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex justify-between text-sm"><span className="text-gray-500">Specialization</span><span className="text-gray-800 font-medium">{lawyer.specialization}</span></div>
                                    <div className="flex justify-between text-sm mt-1"><span className="text-gray-500">Firm</span><span className="text-gray-800 font-medium">{lawyer.firm}</span></div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * resultsPerPage + 1}–{Math.min(currentPage * resultsPerPage, results.length)} of {results.length} lawyers
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded text-sm font-medium transition-colors ${currentPage === page ? 'bg-primary-purple text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="mt-3 text-sm text-gray-500">
              Use the search and filter options above to find lawyers.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default LawyerSearch;

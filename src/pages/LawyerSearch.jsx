import { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { adminAPI } from '../services/api';
import {
  ALL_INDIAN_STATES,
  getDistrictsForState,
  getAllDistricts,
  getCitiesForDistrict,
  getCitiesForDistrictName,
  getAllCitiesForState,
  getAllCities,
} from '../data/districtsByState';

const ALL_STATES = [...ALL_INDIAN_STATES].sort();

const RIO_NAVY_BTN =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#1a3a6b] text-white shadow-sm transition-colors hover:bg-[#152e55] disabled:cursor-not-allowed disabled:opacity-50';
const RIO_TOOLBAR_INPUT =
  'h-9 rounded border border-gray-300 bg-white px-2.5 text-sm text-gray-800 shadow-sm focus:border-[#1a3a6b] focus:outline-none focus:ring-1 focus:ring-[#1a3a6b]';

const FILTER_MENU_OPTIONS = [
  { id: 'keyword', label: 'Keyword' },
  { id: 'name', label: 'Name' },
  { id: 'region', label: 'Region' },
  { id: 'qualification', label: 'Qualification' },
];

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function nameMatches(lawyerName, query) {
  const name = normalizeText(lawyerName);
  const q = normalizeText(query);
  if (!q) return false;
  if (name.includes(q)) return true;
  const stripped = name.replace(/^adv\.?\s*/i, '');
  return stripped.includes(q) || q.includes(stripped);
}

function mapAdvocateToLawyer(row) {
  return {
    id: row.id,
    name: row.name || '',
    email: row.email || '',
    phone: row.phone || '',
    qualification: row.qualification || '',
    firm: row.firmName || row.firm || '—',
    city: row.city || '',
    state: row.state || '',
    pincode: row.pincode || '',
    district: row.city || '',
    address: row.address || '',
    status: row.status || 'Pending',
    cases: row.cases ?? 0,
    createdAt: row.createdAt,
  };
}

function filterLawyersClientSide(lawyers, params = {}) {
  const { state, district, city, name, keyword, qualification, districtCities } = params;
  let list = [...lawyers];

  if (state?.trim()) {
    const s = normalizeText(state);
    list = list.filter(
      (l) =>
        normalizeText(l.state) === s ||
        normalizeText(l.address).includes(s)
    );
  }

  if (district?.trim()) {
    const d = normalizeText(district);
    const cityList = String(districtCities || '')
      .split(',')
      .map((c) => normalizeText(c))
      .filter(Boolean);
    list = list.filter((l) => {
      const lc = normalizeText(l.city);
      if (cityList.length && cityList.includes(lc)) return true;
      if (lc === d) return true;
      return normalizeText(l.address).includes(d);
    });
  }

  if (city?.trim()) {
    const c = normalizeText(city);
    list = list.filter(
      (l) => normalizeText(l.city) === c || normalizeText(l.address).includes(c)
    );
  }

  if (name?.trim()) {
    list = list.filter((l) => nameMatches(l.name, name));
  }

  if (keyword?.trim()) {
    const k = normalizeText(keyword);
    list = list.filter((l) => {
      const blob = [
        l.name,
        l.email,
        l.phone,
        l.qualification,
        l.firm,
        l.city,
        l.address,
      ]
        .map(normalizeText)
        .join(' ');
      return blob.includes(k);
    });
  }

  if (qualification?.trim()) {
    const q = normalizeText(qualification);
    list = list.filter((l) => normalizeText(l.qualification) === q);
  }

  return list;
}

async function fetchLawyersForSearch(params = {}) {
  try {
    const res = await adminAPI.getLawyersForSearch(params);
    if (res.success) return res.data || [];
    return [];
  } catch (err) {
    if (err.response?.status !== 404) throw err;
    const res = await adminAPI.getAllAdvocates();
    if (!res.success) return [];
    const mapped = (res.data || []).map(mapAdvocateToLawyer);
    return filterLawyersClientSide(mapped, params);
  }
}

function LawyerSearch() {
  const navigate = useNavigate();
  const admin = authService.getAdmin();

  const [activeFilters, setActiveFilters] = useState([]);
  const [addFilterMenuOpen, setAddFilterMenuOpen] = useState(false);
  const [keywordFilter, setKeywordFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [qualificationFilter, setQualificationFilter] = useState('');
  const [allLawyers, setAllLawyers] = useState([]);
  const [lawyersLoading, setLawyersLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [regionState, setRegionState] = useState('');
  const [regionDistrict, setRegionDistrict] = useState('');
  const [regionCity, setRegionCity] = useState('');

  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [registeredCount, setRegisteredCount] = useState(null);
  const [dbFilterOptions, setDbFilterOptions] = useState({ states: [], cities: [] });
  const resultsPerPage = 10;

  const toolbarRef = useRef(null);
  const funnelBtnRef = useRef(null);
  const plusBtnRef = useRef(null);
  const filterMenuRef = useRef(null);
  const [filterMenuPos, setFilterMenuPos] = useState({ top: 0, left: 0 });

  const openAddFilterMenu = () => {
    const anchor = funnelBtnRef.current;
    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      setFilterMenuPos({ top: rect.bottom + 4, left: rect.left });
    }
    setAddFilterMenuOpen(true);
  };

  const renderAddFilterMenu = () =>
    addFilterMenuOpen ? (
      <div
        ref={filterMenuRef}
        className="fixed z-[200] min-w-[11rem] overflow-hidden rounded border border-gray-300 bg-white shadow-lg"
        style={{ top: filterMenuPos.top, left: filterMenuPos.left }}
      >
        <p className="border-b border-gray-200 px-3 py-2 text-sm font-bold text-gray-900">
          Add Filter
        </p>
        {FILTER_MENU_OPTIONS.map((opt) => {
          const alreadyAdded = activeFilters.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              disabled={alreadyAdded}
              onClick={() => addFilter(opt.id)}
              className={`block w-full px-3 py-2.5 text-left text-sm ${
                alreadyAdded
                  ? 'cursor-not-allowed text-gray-400 bg-gray-50'
                  : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              {opt.label}
              {alreadyAdded ? ' (added)' : ''}
            </button>
          );
        })}
      </div>
    ) : null;

  const stateOptions = useMemo(() => {
    const merged = new Set([...ALL_STATES, ...(dbFilterOptions.states || [])]);
    return [...merged].sort();
  }, [dbFilterOptions.states]);

  const districtOptions = useMemo(() => {
    const fromStatic = regionState
      ? getDistrictsForState(regionState)
      : getAllDistricts();
    const merged = new Set(fromStatic);
    (dbFilterOptions.districts || []).forEach((d) => merged.add(d));
    return [...merged].sort();
  }, [regionState, dbFilterOptions.districts]);

  const cityOptions = useMemo(() => {
    let fromStatic = [];
    if (regionState && regionDistrict) {
      fromStatic = getCitiesForDistrict(regionState, regionDistrict);
    } else if (regionDistrict) {
      fromStatic = getCitiesForDistrictName(regionDistrict);
    } else if (regionState) {
      fromStatic = getAllCitiesForState(regionState);
    } else {
      fromStatic = getAllCities();
    }
    const merged = new Set(fromStatic);
    (dbFilterOptions.cities || []).forEach((c) => merged.add(c));
    return [...merged].sort();
  }, [regionState, regionDistrict, dbFilterOptions.cities]);

  const qualificationOptions = useMemo(() => {
    const set = new Set();
    allLawyers.forEach((l) => {
      if (l.qualification?.trim()) set.add(l.qualification.trim());
    });
    return [...set].sort();
  }, [allLawyers]);

  const loadRegisteredCount = async (fallbackTotal) => {
    try {
      const res = await adminAPI.getRegisteredLawyerCount();
      if (res.success) {
        setRegisteredCount(res.data?.total ?? 0);
        return;
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error('Error fetching registered lawyer count:', err);
      }
    }
    if (fallbackTotal !== undefined) setRegisteredCount(fallbackTotal);
  };

  const loadRegisteredLawyers = async () => {
    try {
      setLawyersLoading(true);
      setFetchError(null);
      const lawyers = await fetchLawyersForSearch({});

      // Default view: show all registered lawyers sorted A → Z.
      const sorted = [...lawyers].sort((a, b) =>
        (a.name || '').localeCompare(b.name || '', undefined, {
          sensitivity: 'base',
        })
      );

      setAllLawyers(sorted);
      setResults(sorted);
      setHasSearched(true);
      await loadRegisteredCount(sorted.length);

      if (sorted.length === 0) {
        setFetchError('No registered lawyers found in the database.');
      }
    } catch (err) {
      const is404 = err.response?.status === 404;
      setFetchError(
        is404
          ? 'Lawyer search API not found. Restart the backend (npm run dev in Mansoor-s-App-Backend) and click refresh.'
          : err.response?.data?.message || err.message || 'Failed to load lawyers'
      );
      setAllLawyers([]);
      setResults([]);
      setRegisteredCount(0);
      setHasSearched(false);
    } finally {
      setLawyersLoading(false);
    }
  };

  useEffect(() => {
    loadRegisteredLawyers();
    adminAPI
      .getLawyerSearchFilterOptions()
      .then((res) => {
        if (res.success && res.data) setDbFilterOptions(res.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const inToolbar = toolbarRef.current?.contains(e.target);
      const inMenu = filterMenuRef.current?.contains(e.target);
      if (!inToolbar && !inMenu) {
        setAddFilterMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!lawyersLoading) runSearch();
    }, 400);
    return () => clearTimeout(timeout);
  }, [
    lawyersLoading,
    activeFilters,
    keywordFilter,
    nameFilter,
    qualificationFilter,
    regionState,
    regionDistrict,
    regionCity,
  ]);

  const hasActiveFilterValues =
    keywordFilter.trim() ||
    nameFilter.trim() ||
    qualificationFilter ||
    regionState ||
    regionDistrict ||
    regionCity;

  const buildSearchParams = () => {
    const params = {};
    if (activeFilters.includes('region')) {
      if (regionState) params.state = regionState;
      if (regionDistrict) {
        params.district = regionDistrict;
        const cities = regionState
          ? getCitiesForDistrict(regionState, regionDistrict)
          : getCitiesForDistrictName(regionDistrict);
        if (cities.length) params.districtCities = cities.join(',');
      }
      if (regionCity) params.city = regionCity;
    }
    if (activeFilters.includes('name') && nameFilter.trim()) {
      params.name = nameFilter.trim();
    }
    if (activeFilters.includes('qualification') && qualificationFilter) {
      params.qualification = qualificationFilter;
    }
    if (activeFilters.includes('keyword') && keywordFilter.trim()) {
      params.keyword = keywordFilter.trim();
    }
    return params;
  };

  const hasSearchableValues = () => {
    if (activeFilters.includes('keyword') && keywordFilter.trim()) return true;
    if (activeFilters.includes('name') && nameFilter.trim()) return true;
    if (activeFilters.includes('qualification') && qualificationFilter) return true;
    if (
      activeFilters.includes('region') &&
      (regionState || regionDistrict || regionCity)
    ) {
      return true;
    }
    return false;
  };

  const runSearch = async () => {
    if (activeFilters.length === 0) {
      setResults(allLawyers);
      setHasSearched(true);
      setCurrentPage(1);
      return;
    }

    if (!hasSearchableValues()) {
      setResults(allLawyers);
      setHasSearched(true);
      setCurrentPage(1);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setCurrentPage(1);

    try {
      const params = buildSearchParams();
      const lawyers = await fetchLawyersForSearch(params);
      setResults(lawyers);
      setFetchError(null);
    } catch (err) {
      setResults([]);
      const is404 = err.response?.status === 404;
      setFetchError(
        is404
          ? 'Lawyer search API not found. Restart the backend and click refresh.'
          : err.response?.data?.message || err.message || 'Search failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const addFilter = (id) => {
    setAddFilterMenuOpen(false);
    setActiveFilters((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeFilter = (id) => {
    setActiveFilters((prev) => prev.filter((f) => f !== id));
    if (id === 'keyword') setKeywordFilter('');
    if (id === 'name') setNameFilter('');
    if (id === 'qualification') setQualificationFilter('');
    if (id === 'region') {
      setRegionState('');
      setRegionDistrict('');
      setRegionCity('');
    }
  };

  const removeAllFilters = () => {
    setActiveFilters([]);
    setKeywordFilter('');
    setNameFilter('');
    setQualificationFilter('');
    setRegionState('');
    setRegionDistrict('');
    setRegionCity('');
    setResults(allLawyers);
    setHasSearched(true);
    setCurrentPage(1);
  };

  const clearFilterValues = () => {
    setKeywordFilter('');
    setNameFilter('');
    setQualificationFilter('');
    setRegionState('');
    setRegionDistrict('');
    setRegionCity('');
  };

  const filterLabel = (id) =>
    FILTER_MENU_OPTIONS.find((o) => o.id === id)?.label || id;

  const handleStateChange = (value) => {
    setRegionState(value);
    if (
      regionDistrict &&
      value &&
      !getDistrictsForState(value).includes(regionDistrict)
    ) {
      setRegionDistrict('');
      setRegionCity('');
    } else if (!value && regionDistrict) {
      setRegionCity('');
    } else if (!value) {
      setRegionDistrict('');
      setRegionCity('');
    } else {
      setRegionCity('');
    }
  };

  const handleDistrictChange = (value) => {
    setRegionDistrict(value);
    setRegionCity('');
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
        {/* Registered Users Count */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-800">Registered Users</span>
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-purple text-white">
              {registeredCount !== null ? registeredCount : '...'}
            </span>
            <span className="text-xs text-gray-400 ml-1">Total registered lawyers in the system</span>
          </div>
        </div>

        {/* Results — same layout as Active users panel */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Results</h2>
          {hasSearched && (
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {results.length} lawyer{results.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>

        <div className="rounded border border-gray-300 bg-white shadow-sm">
          <div
            ref={toolbarRef}
            className="relative overflow-visible border-b border-gray-300 bg-[#f0f0f0] px-3 py-2"
          >
            {/* Refresh / clear — pinned top-right, never moves when filters wrap */}
            <div className="absolute right-3 top-2 z-10 flex items-center gap-1.5">
              <button
                type="button"
                onClick={async () => {
                  await loadRegisteredLawyers();
                  if (activeFilters.length) await runSearch();
                }}
                disabled={lawyersLoading || loading}
                className={RIO_NAVY_BTN}
                title="Refresh search"
              >
                <svg
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              {hasActiveFilterValues && (
                <button
                  type="button"
                  onClick={clearFilterValues}
                  className={RIO_NAVY_BTN}
                  title="Clear filter values"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filters grow downward; + stays on first row */}
            <div className="flex min-w-0 items-start gap-2 pr-20">
              <button
                ref={funnelBtnRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (addFilterMenuOpen) {
                    setAddFilterMenuOpen(false);
                  } else {
                    openAddFilterMenu();
                  }
                }}
                disabled={loading}
                aria-expanded={addFilterMenuOpen}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded border border-gray-300 bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50"
                title="Add filter"
              >
                <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>

              {activeFilters.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={removeAllFilters}
                    className={RIO_NAVY_BTN}
                    title="Remove all filters"
                  >
                    <span className="text-lg font-bold leading-none">−</span>
                  </button>

                  <button
                    ref={plusBtnRef}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (addFilterMenuOpen) {
                        setAddFilterMenuOpen(false);
                      } else {
                        openAddFilterMenu();
                      }
                    }}
                    className={`${RIO_NAVY_BTN} shrink-0`}
                    title="Add another filter"
                    disabled={activeFilters.length >= FILTER_MENU_OPTIONS.length}
                  >
                    <span className="text-lg font-bold leading-none">+</span>
                  </button>

                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  {activeFilters.map((filterId) => (
                    <div
                      key={filterId}
                      className="inline-flex max-w-full flex-wrap items-center gap-1.5 rounded border border-gray-300 bg-white px-2 py-1 shadow-sm"
                    >
                      <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-[#1a3a6b]">
                        {filterLabel(filterId)}
                      </span>

                      {filterId === 'keyword' && (
                        <input
                          type="search"
                          value={keywordFilter}
                          onChange={(e) => setKeywordFilter(e.target.value)}
                          placeholder="Name, firm, email..."
                          className={`${RIO_TOOLBAR_INPUT} min-w-[10rem] w-[12rem]`}
                        />
                      )}

                      {filterId === 'name' && (
                        <input
                          type="search"
                          value={nameFilter}
                          onChange={(e) => setNameFilter(e.target.value)}
                          placeholder="Lawyer name..."
                          className={`${RIO_TOOLBAR_INPUT} min-w-[10rem] w-[12rem]`}
                        />
                      )}

                      {filterId === 'qualification' && (
                        <select
                          value={qualificationFilter}
                          onChange={(e) => setQualificationFilter(e.target.value)}
                          className={`${RIO_TOOLBAR_INPUT} min-w-[10rem] w-[12rem]`}
                        >
                          <option value="">Select qualification</option>
                          {qualificationOptions.map((q) => (
                            <option key={q} value={q}>{q}</option>
                          ))}
                        </select>
                      )}

                      {filterId === 'region' && (
                        <div className="inline-flex flex-wrap items-center gap-2">
                          <div className="flex shrink-0 items-center gap-1">
                            <label
                              htmlFor="lawyer-search-state"
                              className="shrink-0 text-xs font-semibold text-gray-800"
                            >
                              State
                            </label>
                            <select
                              id="lawyer-search-state"
                              value={regionState}
                              onChange={(e) => handleStateChange(e.target.value)}
                              className={`${RIO_TOOLBAR_INPUT} w-[8.5rem]`}
                            >
                              <option value="">All states</option>
                              {stateOptions.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <label
                              htmlFor="lawyer-search-district"
                              className="shrink-0 text-xs font-semibold text-gray-800"
                            >
                              District
                            </label>
                            <select
                              id="lawyer-search-district"
                              value={regionDistrict}
                              onChange={(e) => handleDistrictChange(e.target.value)}
                              className={`${RIO_TOOLBAR_INPUT} w-[8.5rem]`}
                              title="Select district"
                            >
                              <option value="">All districts</option>
                              {districtOptions.map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <label
                              htmlFor="lawyer-search-city"
                              className="shrink-0 text-xs font-semibold text-gray-800"
                            >
                              City
                            </label>
                            <select
                              id="lawyer-search-city"
                              value={regionCity}
                              onChange={(e) => setRegionCity(e.target.value)}
                              className={`${RIO_TOOLBAR_INPUT} w-[9rem]`}
                              title="Select city"
                            >
                              <option value="">All cities</option>
                              {cityOptions.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => removeFilter(filterId)}
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        title={`Remove ${filterLabel(filterId)} filter`}
                        aria-label={`Remove ${filterLabel(filterId)} filter`}
                      >
                        <span className="text-sm leading-none">×</span>
                      </button>
                    </div>
                  ))}
                  </div>
                </>
              )}
            </div>
          </div>
          {renderAddFilterMenu()}

          {loading || lawyersLoading ? (
            <div className="px-4 py-12 text-center">
              <svg className="animate-spin h-8 w-8 mx-auto text-[#1a3a6b]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-3 text-sm text-gray-500">Searching lawyers...</p>
            </div>
          ) : (
            <div className="max-h-[560px] overflow-auto">
              <table className="min-w-full border-collapse">
                <thead className="sticky top-0 bg-[#1a3a6b]">
                    <tr>
                      <th className="w-12 border-r border-[#152e55] px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-white">
                        #
                      </th>
                      <th className="border-r border-[#152e55] px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-white">
                        Advocate
                      </th>
                      <th className="border-r border-[#152e55] px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-white">
                        Qualification
                      </th>
                      <th className="border-r border-[#152e55] px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-white">
                        Firm
                      </th>
                      <th className="border-r border-[#152e55] px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-white">
                        Location
                      </th>
                      <th className="border-r border-[#152e55] px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-white">
                        Contact
                      </th>
                      <th className="border-r border-[#152e55] px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-white">
                        Cases
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-white">
                        Status
                      </th>
                      <th className="w-10 px-2 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {!hasSearched ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center">
                          <p className="text-sm font-medium text-gray-700">
                            {fetchError
                              ? fetchError
                              : lawyersLoading
                                ? 'Loading registered lawyers…'
                                : 'Use the filter above to search lawyers'}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {!fetchError && !lawyersLoading &&
                              'Click the funnel icon, choose Keyword, Name, Region, or Qualification'}
                          </p>
                        </td>
                      </tr>
                    ) : allLawyers.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center">
                          <p className="text-sm font-medium text-gray-700">
                            {fetchError || 'No registered lawyers loaded'}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Restart the backend and click the refresh button.
                          </p>
                        </td>
                      </tr>
                    ) : paginatedResults.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center">
                          <p className="text-sm font-medium text-gray-700">
                            No lawyers match your filters
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            For name search use Add Filter → Name, or Keyword to search name, firm, email, and phone.
                          </p>
                        </td>
                      </tr>
                    ) : (
                    paginatedResults.map((lawyer, index) => (
                      <Fragment key={lawyer.id}>
                        <tr
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${expandedRow === lawyer.id ? 'bg-purple-50' : ''}`}
                          onClick={() => setExpandedRow(expandedRow === lawyer.id ? null : lawyer.id)}
                        >
                          <td className="px-4 py-3 text-center text-sm text-gray-400">
                            {(currentPage - 1) * resultsPerPage + index + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-primary-purple">
                                {getInitials(lawyer.name)}
                              </span>
                              <span className="text-sm font-medium text-gray-900">{lawyer.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-800">
                              {lawyer.qualification || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{lawyer.firm}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-800">{lawyer.city || '—'}</div>
                            <div className="text-xs text-gray-400">
                              {[lawyer.city, lawyer.state].filter(Boolean).join(', ') || '—'}
                            </div>
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
                              lawyer.status === 'Active'
                                ? 'bg-green-100 text-green-700'
                                : lawyer.status === 'Inactive'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-gray-100 text-gray-600'
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
                            <td colSpan={9} className="px-4 py-4">
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
                                    <div className="flex justify-between"><span className="text-gray-500">State</span><span className="text-gray-800 font-medium">{lawyer.state || '—'}</span></div>
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
                                    <div className="flex justify-between text-sm"><span className="text-gray-500">Qualification</span><span className="text-gray-800 font-medium">{lawyer.qualification || '—'}</span></div>
                                    <div className="flex justify-between text-sm mt-1"><span className="text-gray-500">Firm</span><span className="text-gray-800 font-medium">{lawyer.firm}</span></div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )))}
                  </tbody>
                </table>
            </div>
          )}

          {hasSearched && results.length > 0 && totalPages > 1 && (
              <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50">
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
                      className={`w-8 h-8 rounded text-sm font-medium transition-colors ${currentPage === page ? 'bg-[#1a3a6b] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
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
        </div>
      </main>
    </div>
  );
}

export default LawyerSearch;

import { useMemo, useState, useCallback, useRef, useEffect, Fragment } from 'react';
import {
  getRegionList,
  getDistrictsForRegion,
  getCourtsForDistrictInRegion,
  getSeedCourtsForDistrict,
  resolveUserDistrict,
  canonicalDistrict,
  canonicalRegion,
  resolveDistrictInRegion,
  courtMatchesFilter,
  normalizeFilterValue,
} from '../data/regionCourtHierarchy';

const DEFAULT_PAGE_SIZE = 10;

const SORT_KEYS = {
  name: 'name',
  total: 'allMinutes',
};

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

function parseDurationToMinutes(label) {
  if (!label || label === '—') return -1;
  const hm = String(label).match(/(\d+)h\s*(\d+)?m?/);
  if (hm) return parseInt(hm[1], 10) * 60 + (parseInt(hm[2], 10) || 0);
  const min = String(label).match(/^(\d+)\s*min/);
  if (min) return parseInt(min[1], 10);
  if (label === '< 1 min') return 0;
  return -1;
}

function formatMinutes(totalMin) {
  const m = Math.max(0, Math.floor(Number(totalMin) || 0));
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h > 0) return `${h}h ${min}m`;
  if (m > 0) return `${m} min`;
  return '0 min';
}

function UserDurationDetails({ timeToday, sessions }) {
  return (
    <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
      <div className="mb-4 flex items-center justify-between rounded-lg border border-purple-100 bg-white px-4 py-3">
        <span className="text-sm font-medium text-gray-600">Time today</span>
        <span className="text-lg font-bold text-primary-purple">{timeToday || '0 min'}</span>
      </div>
      {!sessions?.length ? (
        <p className="text-sm text-gray-500">No session records.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <th className="px-4 py-2.5">Login</th>
                <th className="px-4 py-2.5">Logout</th>
                <th className="px-4 py-2.5 text-right">Duration</th>
                <th className="px-4 py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((s, idx) => (
                <tr key={idx} className={s.isActive ? 'bg-green-50/50' : ''}>
                  <td className="whitespace-nowrap px-4 py-2.5 text-gray-800">
                    {s.startTime || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">
                    {s.isActive ? '—' : s.endTime || '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium tabular-nums text-gray-900">
                    {s.durationLabel || '—'}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                        s.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s.isActive ? 'Online' : 'Out'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LaLawOnlineActivityPanel({
  users = [],
  loading = false,
  error = null,
  onRefresh,
  idleMinutes = 15,
  timezoneLabel = 'IST',
  regionHierarchy = null,
}) {
  const [nameFilter, setNameFilter] = useState('');
  const [firmFilter, setFirmFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [courtFilter, setCourtFilter] = useState('');
  const [addFilterMenuOpen, setAddFilterMenuOpen] = useState(false);
  /** name | firm | region — active filter row on toolbar */
  const [activeFilterMenu, setActiveFilterMenu] = useState(null);
  const filterDropdownRef = useRef(null);

  const RIO_NAVY_BTN =
    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#1a3a6b] text-white shadow-sm transition-colors hover:bg-[#152e55] disabled:cursor-not-allowed disabled:opacity-50';
  const RIO_TOOLBAR_INPUT =
    'h-9 rounded border border-gray-300 bg-white px-2.5 text-sm text-gray-800 shadow-sm focus:border-[#1a3a6b] focus:outline-none focus:ring-1 focus:ring-[#1a3a6b]';
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onlineCount = users.length;

  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  const firmOptions = useMemo(() => {
    const map = new Map();
    users.forEach((u) => {
      const f = u.firmName || 'Independent';
      map.set(f, (map.get(f) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [users]);

  const hierarchy = regionHierarchy || {};

  const allRegionOptions = useMemo(() => getRegionList(hierarchy), [hierarchy]);

  const onlineCountInRegion = useCallback(
    (regionName) =>
      users.filter(
        (u) =>
          normalizeFilterValue(u.region || 'Unspecified') ===
          normalizeFilterValue(regionName)
      ).length,
    [users]
  );

  const allDistrictOptions = useMemo(
    () => getDistrictsForRegion(stateFilter, hierarchy),
    [stateFilter, hierarchy]
  );

  /** Courts from seed + hierarchy only (not tied to online advocates) */
  const allCourtOptions = useMemo(() => {
    if (!stateFilter || !districtFilter) return [];
    const region = canonicalRegion(stateFilter);
    const district = resolveDistrictInRegion(region, districtFilter);
    const names = new Set([
      ...getSeedCourtsForDistrict(region, district),
      ...getCourtsForDistrictInRegion(region, district, hierarchy),
    ]);
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [stateFilter, districtFilter, hierarchy]);

  const countByDistrict = useMemo(() => {
    const map = new Map();
    users.forEach((u) => {
      const r = u.region || 'Unspecified';
      if (
        stateFilter &&
        normalizeFilterValue(canonicalRegion(r)) !==
          normalizeFilterValue(canonicalRegion(stateFilter))
      ) {
        return;
      }
      const d = resolveUserDistrict(u);
      map.set(d, (map.get(d) || 0) + 1);
    });
    return map;
  }, [users, stateFilter]);

  const countByCourt = useMemo(() => {
    const map = new Map();
    allCourtOptions.forEach((name) => map.set(name, 0));
    users.forEach((u) => {
      const r = u.region || 'Unspecified';
      if (
        stateFilter &&
        normalizeFilterValue(canonicalRegion(r)) !==
          normalizeFilterValue(canonicalRegion(stateFilter))
      ) {
        return;
      }
      const d = resolveUserDistrict(u);
      if (
        districtFilter &&
        normalizeFilterValue(d) !==
          normalizeFilterValue(
            resolveDistrictInRegion(canonicalRegion(stateFilter), districtFilter)
          )
      ) {
        return;
      }
      const c = u.courtName || '';
      allCourtOptions.forEach((name) => {
        if (courtMatchesFilter(c, name)) {
          map.set(name, (map.get(name) || 0) + 1);
        }
      });
    });
    return map;
  }, [users, stateFilter, districtFilter, allCourtOptions]);

  const filteredUsers = useMemo(() => {
    const q = nameFilter.trim().toLowerCase();
    return users.filter((user) => {
      const region = user.region || 'Unspecified';
      const district = resolveUserDistrict(user);
      const court = user.courtName || 'Unspecified';
      if (
        stateFilter &&
        normalizeFilterValue(canonicalRegion(region)) !==
          normalizeFilterValue(canonicalRegion(stateFilter))
      ) {
        return false;
      }
      if (
        districtFilter &&
        normalizeFilterValue(district) !==
          normalizeFilterValue(
            resolveDistrictInRegion(canonicalRegion(stateFilter), districtFilter)
          )
      ) {
        return false;
      }
      if (courtFilter && !courtMatchesFilter(court, courtFilter)) {
        return false;
      }
      if (firmFilter) {
        const f = (user.firmName || 'Independent').toLowerCase();
        if (!f.includes(firmFilter.toLowerCase())) return false;
      }
      if (q) {
        const hay = [user.name, user.email]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [users, nameFilter, stateFilter, districtFilter, courtFilter, firmFilter]);

  const sortedUsers = useMemo(() => {
    const key = SORT_KEYS[sortKey] || sortKey;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filteredUsers].sort((a, b) => {
      let av = a[key];
      let bv = b[key];
      if (key === 'name') {
        return (a.name || '').localeCompare(b.name || '') * dir;
      }
      if (av == null || av < 0) av = sortDir === 'asc' ? Infinity : -Infinity;
      if (bv == null || bv < 0) bv = sortDir === 'asc' ? Infinity : -Infinity;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [filteredUsers, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / DEFAULT_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageUsers = useMemo(() => {
    const start = (safePage - 1) * DEFAULT_PAGE_SIZE;
    return sortedUsers.slice(start, start + DEFAULT_PAGE_SIZE);
  }, [sortedUsers, safePage]);

  const rangeStart = sortedUsers.length === 0 ? 0 : (safePage - 1) * DEFAULT_PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * DEFAULT_PAGE_SIZE, sortedUsers.length);

  const handleSort = useCallback((key) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDir('asc');
      return key;
    });
    setPage(1);
  }, []);

  const clearFilters = () => {
    setNameFilter('');
    setFirmFilter('');
    setStateFilter('');
    setDistrictFilter('');
    setCourtFilter('');
    setActiveFilterMenu(null);
    setPage(1);
  };

  const addFilter = (type) => {
    setActiveFilterMenu(type);
    setAddFilterMenuOpen(false);
  };

  const removeActiveFilter = () => {
    if (activeFilterMenu === 'name') setNameFilter('');
    else if (activeFilterMenu === 'firm') setFirmFilter('');
    else if (activeFilterMenu === 'region') {
      setStateFilter('');
      setDistrictFilter('');
      setCourtFilter('');
    }
    setActiveFilterMenu(null);
    setPage(1);
  };

  const activeFilterLabel =
    activeFilterMenu === 'name'
      ? 'Name'
      : activeFilterMenu === 'firm'
        ? 'Firm'
        : activeFilterMenu === 'region'
          ? 'Region'
          : '';

  useEffect(() => {
    if (!addFilterMenuOpen) return undefined;
    const onPointerDown = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setAddFilterMenuOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setAddFilterMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [addFilterMenuOpen]);

  const handleStateChange = (value) => {
    setStateFilter(value);
    setDistrictFilter('');
    setCourtFilter('');
    setPage(1);
  };

  const handleDistrictChange = (value) => {
    setDistrictFilter(value);
    setCourtFilter('');
    setPage(1);
  };

  const hasFilters = Boolean(
    nameFilter.trim() || firmFilter || stateFilter || districtFilter || courtFilter
  );

  const colCount = 3;

  const sortMark = (key) => {
    if (sortKey !== key) return null;
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <section className="overflow-visible rounded-lg border border-gray-200 bg-white shadow-md">
      {/* Collapsed bar — active users count only */}
      <button
        type="button"
        onClick={() => setPanelOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors ${
          panelOpen ? 'border-b border-gray-200 bg-purple-50' : 'bg-white hover:bg-gray-50'
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            {!loading && onlineCount > 0 && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            )}
            <span
              className={`relative h-2.5 w-2.5 rounded-full ${
                loading ? 'bg-gray-300' : onlineCount > 0 ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          </span>
          <span className="text-base font-bold text-gray-900">Active users</span>
          <span className="rounded-full bg-primary-purple px-3 py-0.5 text-sm font-bold tabular-nums text-white">
            {loading ? '…' : onlineCount}
          </span>
          {!panelOpen && !loading && (
            <span className="truncate text-sm text-slate-400">
              Expand to view online advocates
            </span>
          )}
        </div>
        <svg
          className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${panelOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {panelOpen && (
        <>
          <div className="border-b border-gray-200 bg-white px-5 py-2.5">
            <p className="text-xs text-gray-600">
              Auto logout {idleMinutes} min idle · {timezoneLabel}
            </p>
          </div>

      <div className="px-6 py-4">
        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {loading && !users.length && (
          <p className="mb-3 text-center text-sm text-gray-500">Loading online users…</p>
        )}
        <>
            <p className="mb-3 text-sm text-gray-600">
              {sortedUsers.length > 0 ? (
                <>
                  Showing <span className="font-semibold text-gray-900">{rangeStart}–{rangeEnd}</span> of{' '}
                  <span className="font-semibold text-gray-900">{sortedUsers.length}</span>
                  {hasFilters ? (
                    <span className="text-gray-500"> filtered · {onlineCount} online total</span>
                  ) : (
                    <span className="text-gray-500"> online advocates</span>
                  )}
                </>
              ) : (
                <>
                  <span className="font-semibold text-gray-900">0</span>
                  <span className="text-gray-500">
                    {hasFilters ? ' advocates match filters' : ' advocates online'}
                    {onlineCount > 0 ? ` · ${onlineCount} online total` : ''}
                  </span>
                </>
              )}
              <span className="text-gray-400"> · Click total time for session history</span>
            </p>

            <div className="overflow-hidden rounded border border-gray-300 bg-white shadow-sm">
              <div
                ref={filterDropdownRef}
                className={`relative flex items-center gap-2 border-b border-gray-300 bg-[#f0f0f0] px-3 py-2 ${
                  activeFilterMenu === 'region' ? 'flex-nowrap overflow-x-auto' : 'flex-wrap'
                }`}
              >
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddFilterMenuOpen((o) => !o);
                    }}
                    disabled={loading}
                    aria-expanded={addFilterMenuOpen}
                    className="inline-flex h-9 w-9 items-center justify-center rounded border border-gray-300 bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50"
                    title="Add filter"
                  >
                    <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </button>
                  {addFilterMenuOpen && (
                    <div className="absolute left-0 top-full z-50 mt-1 min-w-[11rem] overflow-hidden rounded border border-gray-300 bg-white shadow-lg">
                      <p className="border-b border-gray-200 px-3 py-2 text-sm font-bold text-gray-900">
                        Add Filter
                      </p>
                      {[
                        { id: 'name', label: 'Name' },
                        { id: 'firm', label: 'Firm' },
                        { id: 'region', label: 'Region' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => addFilter(opt.id)}
                          className="block w-full px-3 py-2.5 text-left text-sm text-gray-800 hover:bg-gray-100"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {activeFilterMenu && (
                  <>
                    <button
                      type="button"
                      onClick={removeActiveFilter}
                      className={RIO_NAVY_BTN}
                      title="Remove filter"
                    >
                      <span className="text-lg font-bold leading-none">−</span>
                    </button>
                    {activeFilterMenu !== 'region' && (
                      <span className="shrink-0 text-sm font-semibold text-gray-800">
                        {activeFilterLabel}
                      </span>
                    )}

                    {(activeFilterMenu === 'name' || activeFilterMenu === 'firm') && (
                      <input
                        type="search"
                        autoFocus
                        value={activeFilterMenu === 'name' ? nameFilter : firmFilter}
                        onChange={(e) => {
                          if (activeFilterMenu === 'name') setNameFilter(e.target.value);
                          else setFirmFilter(e.target.value);
                          setPage(1);
                        }}
                        placeholder="Search"
                        list={activeFilterMenu === 'firm' ? 'la-law-firm-suggestions' : undefined}
                        className={`${RIO_TOOLBAR_INPUT} min-w-[12rem] flex-1`}
                      />
                    )}

                    {activeFilterMenu === 'region' && (
                      <div className="inline-flex shrink-0 flex-nowrap items-center gap-2">
                        <div className="flex shrink-0 items-center gap-1.5">
                          <label
                            htmlFor="la-law-state-filter"
                            className="shrink-0 text-sm font-semibold text-gray-800"
                          >
                            State
                          </label>
                          <select
                            id="la-law-state-filter"
                            value={stateFilter}
                            onChange={(e) => handleStateChange(e.target.value)}
                            className={`${RIO_TOOLBAR_INPUT} w-[9.5rem] max-w-[9.5rem]`}
                          >
                            <option value="">All states</option>
                            {allRegionOptions.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <label
                            htmlFor="la-law-district-filter"
                            className={`shrink-0 text-sm font-semibold ${
                              stateFilter ? 'text-gray-800' : 'text-gray-400'
                            }`}
                          >
                            District
                          </label>
                          <select
                            id="la-law-district-filter"
                            value={districtFilter}
                            disabled={!stateFilter}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            className={`${RIO_TOOLBAR_INPUT} w-[9.5rem] max-w-[9.5rem] disabled:cursor-not-allowed disabled:bg-gray-100`}
                            title={stateFilter ? 'Select district' : 'Select state first'}
                          >
                            <option value="">
                              {stateFilter ? 'All districts' : 'Select state first'}
                            </option>
                            {allDistrictOptions.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <label
                            htmlFor="la-law-court-filter"
                            className={`shrink-0 text-sm font-semibold ${
                              stateFilter && districtFilter ? 'text-gray-800' : 'text-gray-400'
                            }`}
                          >
                            Court
                          </label>
                          <select
                            id="la-law-court-filter"
                            value={courtFilter}
                            disabled={!stateFilter || !districtFilter}
                            onChange={(e) => {
                              setCourtFilter(e.target.value);
                              setPage(1);
                            }}
                            className={`${RIO_TOOLBAR_INPUT} min-w-[12rem] max-w-[16rem] disabled:cursor-not-allowed disabled:bg-gray-100`}
                            title={
                              districtFilter
                                ? `${allCourtOptions.length} court(s) — select one`
                                : 'Select district first'
                            }
                          >
                            <option value="">
                              {districtFilter
                                ? `All courts (${allCourtOptions.length})`
                                : 'Select district first'}
                            </option>
                            {allCourtOptions.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setAddFilterMenuOpen(true)}
                      className={RIO_NAVY_BTN}
                      title="Add another filter"
                    >
                      <span className="text-lg font-bold leading-none">+</span>
                    </button>
                  </>
                )}

                <div className="ml-auto flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRefresh();
                    }}
                    disabled={!onRefresh || isRefreshing}
                    className={RIO_NAVY_BTN}
                    title={onRefresh ? 'Refresh online users and filters' : 'Refresh not available'}
                    aria-busy={isRefreshing}
                  >
                    <svg
                      className={`h-4 w-4 ${isRefreshing || loading ? 'animate-spin' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className={RIO_NAVY_BTN}
                      title="Clear all filters"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {activeFilterMenu === 'firm' && (
                <datalist id="la-law-firm-suggestions">
                  {firmOptions.map((f) => (
                    <option key={f.name} value={f.name} />
                  ))}
                </datalist>
              )}

              <div className="max-h-[480px] overflow-auto">
                <table className="min-w-full border-collapse">
                  <thead className="sticky top-0 bg-[#1a3a6b]">
                    <tr>
                      <th className="w-12 border-r border-[#152e55] px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-white">
                        #
                      </th>
                      <th className="border-r border-[#152e55] px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-white">
                        <button
                          type="button"
                          onClick={() => handleSort('name')}
                          className="hover:text-amber-200"
                        >
                          Advocate{sortMark('name')}
                        </button>
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wide text-white">
                        <button
                          type="button"
                          onClick={() => handleSort('total')}
                          className="hover:text-amber-200"
                        >
                          Total time{sortMark('total')}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {pageUsers.length === 0 ? (
                      <tr>
                        <td colSpan={colCount} className="px-4 py-12 text-center">
                          <p className="text-sm font-medium text-gray-700">
                            {onlineCount === 0 && !hasFilters
                              ? 'No users online'
                              : 'No advocates match your filters'}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {onlineCount === 0 && !hasFilters
                              ? 'Advocates appear here when they are online. Region filters still list all courts.'
                              : 'Try another state, district, or court — courts stay available even with no online advocates in that area.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                    pageUsers.map((user, index) => {
                      const rowNum = (safePage - 1) * DEFAULT_PAGE_SIZE + index + 1;
                      const open = expandedUserId === user.id;

                      return (
                        <Fragment key={user.id}>
                          <tr className={open ? 'bg-purple-50' : 'hover:bg-gray-50'}>
                            <td className="px-4 py-3 text-center text-sm text-gray-400">
                              {rowNum}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-primary-purple">
                                  {getInitials(user.name)}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-gray-900">
                                    {user.name}
                                  </p>
                                  <p className="truncate text-xs text-gray-500">
                                    {user.firmName || '—'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedUserId((id) => (id === user.id ? null : user.id))
                                }
                                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold tabular-nums ${
                                  open
                                    ? 'bg-primary-purple text-white'
                                    : 'text-primary-purple hover:bg-purple-50'
                                }`}
                              >
                                {user.timeSpentAll || '0 min'}
                                <span className="text-xs opacity-70">{open ? '▲' : '▼'}</span>
                              </button>
                            </td>
                          </tr>
                          {open && (
                            <tr>
                              <td colSpan={colCount} className="p-0">
                                <UserDurationDetails
                                  timeToday={user.timeSpentToday}
                                  sessions={user.userSessions}
                                />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 border-t border-gray-200 bg-[#f0f0f0] px-3 py-3">
                  <span className="mr-1 text-xs font-medium text-gray-600">Page</span>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setPage(pageNum)}
                      aria-label={`Page ${pageNum}`}
                      aria-current={pageNum === safePage ? 'page' : undefined}
                      className={`inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded px-2 text-sm font-semibold tabular-nums shadow-sm transition-colors ${
                        pageNum === safePage
                          ? 'bg-[#1a3a6b] text-white'
                          : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  {safePage < totalPages && (
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className={`${RIO_NAVY_BTN} ml-1`}
                      title={`Next page (${safePage + 1} of ${totalPages})`}
                      aria-label={`Go to page ${safePage + 1}`}
                    >
                      <span className="text-lg font-bold leading-none">+</span>
                    </button>
                  )}
                </div>
              )}
            </div>
        </>
      </div>
        </>
      )}
    </section>
  );
}

export function enrichOnlineActivity(onlineUsers, sessions = [], timeSpentUsers = []) {
  const activeSessionByLawyer = {};
  const sessionsByLawyer = {};

  sessions.forEach((s) => {
    const id = s.lawyerId;
    if (!sessionsByLawyer[id]) sessionsByLawyer[id] = [];
    sessionsByLawyer[id].push(s);
    if (s.isActive && !activeSessionByLawyer[id]) {
      activeSessionByLawyer[id] = s;
    }
  });

  const usageById = {};
  timeSpentUsers.forEach((u) => {
    usageById[u.id] = {
      todayLabel: u.timeSpentTodayLabel || '0 min',
      todayMinutes: Math.floor((u.todaySeconds || 0) / 60),
      allLabel: u.timeSpentAllLabel || u.timeSpentLabel || '0 min',
      allMinutes: Math.floor((u.allSeconds || 0) / 60),
    };
  });

  return onlineUsers.map((u) => {
    const active = activeSessionByLawyer[u.id];
    const usage = usageById[u.id];
    const userSessions = sessionsByLawyer[u.id] || [];
    const sessionSumMinutes = userSessions.reduce(
      (sum, s) => sum + (s.durationMinutes || 0),
      0
    );

    let allMinutes = usage?.allMinutes ?? 0;
    let allLabel = usage?.allLabel;
    if (!usage && sessionSumMinutes > 0) {
      allMinutes = sessionSumMinutes;
      allLabel = formatMinutes(sessionSumMinutes);
    }
    if (!allLabel) allLabel = '0 min';

    const sessionMinutes =
      active?.durationMinutes != null
        ? active.durationMinutes
        : parseDurationToMinutes(active?.durationLabel);

    return {
      ...u,
      currentSessionDuration: active?.durationLabel || '—',
      timeSpentToday: usage?.todayLabel || '0 min',
      timeSpentAll: allLabel,
      sessionMinutes: sessionMinutes >= 0 ? sessionMinutes : -1,
      todayMinutes: usage?.todayMinutes ?? 0,
      allMinutes,
      userSessions,
    };
  });
}

export default LaLawOnlineActivityPanel;

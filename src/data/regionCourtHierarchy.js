/**
 * State (region) → District → Court names (all courts in that district)
 */

import { REGION_DISTRICTS, DISTRICT_CITIES_EXTRA } from './districtsByState.js';

export { REGION_DISTRICTS } from './districtsByState.js';

export function normalizeFilterValue(value) {
  return (value || '').trim().toLowerCase();
}

function isPoliceStationName(name) {
  return /police\s*station/i.test(name || '');
}

const DISTRICT_ALIASES = {
  bangalore: 'Bengaluru Urban',
  bengaluru: 'Bengaluru Urban',
  'bengaluru urban': 'Bengaluru Urban',
  'bengaluru rural': 'Bengaluru Rural',
  mysore: 'Mysuru',
  mysuru: 'Mysuru',
  mangalore: 'Dakshina Kannada',
  mangaluru: 'Dakshina Kannada',
  belgaum: 'Belagavi',
  bellary: 'Ballari',
  hubli: 'Dharwad',
  hubballi: 'Dharwad',
  cbe: 'Coimbatore',
  coimbatore: 'Coimbatore',
  madras: 'Chennai',
  chennai: 'Chennai',
  trivandrum: 'Thiruvananthapuram',
  kochi: 'Ernakulam',
  ernakulam: 'Ernakulam',
  calicut: 'Kozhikode',
  nagercoil: 'Kanniyakumari',
  ooty: 'The Nilgiris',
  udhagamandalam: 'The Nilgiris',
  nilgiris: 'The Nilgiris',
  hosur: 'Krishnagiri',
  kanchipuram: 'Kancheepuram',
  kanyakumari: 'Kanniyakumari',
  sivaganga: 'Sivagangai',
  tirupattur: 'Tirupathur',
  viluppuram: 'Viluppuram',
  kasargod: 'Kasaragod',
  chamarajanagara: 'Chamarajanagar',
  chamarajanagar: 'Chamarajanagar',
  vijayanagar: 'Vijayanagara',
  chikmagalur: 'Chikkamagaluru',
  chikmagalore: 'Chikkamagaluru',
  chikballapur: 'Chikkaballapur',
  tumkur: 'Tumakuru',
  shimoga: 'Shivamogga',
  gulbarga: 'Kalaburagi',
  'uttar kannada': 'Uttara Kannada',
  'dakshina kannada': 'Dakshina Kannada',
  ramanagaram: 'Ramanagara',
  'bangalore urban': 'Bengaluru Urban',
  'bangalore rural': 'Bengaluru Rural',
  nilgiri: 'The Nilgiris',
  mayiladuthurai: 'Mayiladuthurai',
  chengalpet: 'Chengalpattu',
  chengalpattu: 'Chengalpattu',
  palghat: 'Palakkad',
  quilon: 'Kollam',
  alleppey: 'Alappuzha',
};

const REGION_ALIASES = {
  tn: 'Tamil Nadu',
  'tamil nadu': 'Tamil Nadu',
  tamilnadu: 'Tamil Nadu',
  'tamil-nadu': 'Tamil Nadu',
  'tamil naidu': 'Tamil Nadu',
  ka: 'Karnataka',
  karnataka: 'Karnataka',
  kl: 'Kerala',
  kerala: 'Kerala',
  ap: 'Andhra Pradesh',
  'andhra pradesh': 'Andhra Pradesh',
  ar: 'Arunachal Pradesh',
  'arunachal pradesh': 'Arunachal Pradesh',
  as: 'Assam',
  assam: 'Assam',
  br: 'Bihar',
  bihar: 'Bihar',
  cg: 'Chhattisgarh',
  chhattisgarh: 'Chhattisgarh',
  ga: 'Goa',
  goa: 'Goa',
  gj: 'Gujarat',
  gujarat: 'Gujarat',
  hr: 'Haryana',
  haryana: 'Haryana',
  hp: 'Himachal Pradesh',
  'himachal pradesh': 'Himachal Pradesh',
  jh: 'Jharkhand',
  jharkhand: 'Jharkhand',
  mp: 'Madhya Pradesh',
  'madhya pradesh': 'Madhya Pradesh',
  mh: 'Maharashtra',
  maharashtra: 'Maharashtra',
  mn: 'Manipur',
  manipur: 'Manipur',
  ml: 'Meghalaya',
  meghalaya: 'Meghalaya',
  mz: 'Mizoram',
  mizoram: 'Mizoram',
  nl: 'Nagaland',
  nagaland: 'Nagaland',
  or: 'Odisha',
  od: 'Odisha',
  odisha: 'Odisha',
  pb: 'Punjab',
  punjab: 'Punjab',
  rj: 'Rajasthan',
  rajasthan: 'Rajasthan',
  sk: 'Sikkim',
  sikkim: 'Sikkim',
  ts: 'Telangana',
  telangana: 'Telangana',
  tr: 'Tripura',
  tripura: 'Tripura',
  up: 'Uttar Pradesh',
  'uttar pradesh': 'Uttar Pradesh',
  uk: 'Uttarakhand',
  uttarakhand: 'Uttarakhand',
  wb: 'West Bengal',
  'west bengal': 'West Bengal',
  an: 'Andaman and Nicobar Islands',
  'andaman and nicobar islands': 'Andaman and Nicobar Islands',
  ch: 'Chandigarh',
  chandigarh: 'Chandigarh',
  dl: 'Delhi',
  delhi: 'Delhi',
  jk: 'Jammu and Kashmir',
  'jammu and kashmir': 'Jammu and Kashmir',
  la: 'Ladakh',
  ladakh: 'Ladakh',
  ld: 'Lakshadweep',
  lakshadweep: 'Lakshadweep',
  py: 'Puducherry',
  puducherry: 'Puducherry',
  pondicherry: 'Puducherry',
};

/** Default main courts for every district */
const STANDARD_DISTRICT_COURTS = [
  'Principal District Court',
  'Additional District Courts',
  'Judicial Magistrate Courts',
  'Family Court',
];

/** District-specific court lists (override standard set) */
const DISTRICT_COURT_OVERRIDES = {
  'Tamil Nadu': {
    Chennai: [
      'Principal District Court',
      'Additional District Courts',
      'Chief Metropolitan Magistrate Court',
      'City Civil Court',
      'Judicial Magistrate Courts',
      'Family Court',
      'Mahila Court',
      'Labour Court',
    ],
    Coimbatore: [
      'Principal District Court',
      'Additional District Courts',
      'Judicial Magistrate Courts',
      'Family Court',
      'Mahila Court',
      'Labour Court',
      'Special POCSO Court',
    ],
    Madurai: [
      'Principal District Court',
      'Additional District Courts',
      'Judicial Magistrate Courts',
      'Family Court',
      'Mahila Court',
    ],
  },
  Karnataka: {
    'Bengaluru Urban': [
      'City Civil and Sessions Court',
      'Principal District Court',
      'Additional District Courts',
      'Judicial Magistrate Courts',
      'Family Court',
      'Labour Court',
    ],
    Mysuru: [
      'Principal District Court',
      'Additional District Courts',
      'Judicial Magistrate Courts',
      'Family Court',
    ],
    'Dakshina Kannada': [
      'Principal District Court',
      'Additional District Courts',
      'Judicial Magistrate Courts',
      'Family Court',
    ],
  },
  Kerala: {
    Ernakulam: [
      'Principal District Court',
      'Additional District Courts',
      'Judicial Magistrate Courts',
      'Family Court',
      'Motor Accidents Claims Tribunal',
    ],
    Thiruvananthapuram: [
      'Principal District Court',
      'Additional District Courts',
      'Judicial Magistrate Courts',
      'Family Court',
    ],
    Kozhikode: [
      'Principal District Court',
      'Additional District Courts',
      'Judicial Magistrate Courts',
      'Family Court',
    ],
  },
};

function buildDistrictCourtsFromRegions() {
  const map = {};
  Object.entries(REGION_DISTRICTS).forEach(([region, districts]) => {
    map[region] = {};
    districts.forEach((district) => {
      const override = DISTRICT_COURT_OVERRIDES[region]?.[district];
      map[region][district] = override
        ? [...override]
        : [...STANDARD_DISTRICT_COURTS];
    });
  });
  return map;
}

function buildDefaultDistrictCities() {
  const map = {};
  Object.entries(REGION_DISTRICTS).forEach(([region, districts]) => {
    map[region] = {};
    districts.forEach((district) => {
      map[region][district] = [district];
    });
  });
  Object.entries(DISTRICT_CITIES_EXTRA).forEach(([region, byDistrict]) => {
    if (!map[region]) map[region] = {};
    Object.entries(byDistrict).forEach(([district, cities]) => {
      map[region][district] = [...new Set([district, ...cities])];
    });
  });
  return map;
}

/** Cities/localities mapped to each district (Court Master city field) */
export const DISTRICT_CITIES = buildDefaultDistrictCities();

/** All districts: default + override court lists */
export const DISTRICT_COURTS = buildDistrictCourtsFromRegions();

export function canonicalDistrict(name) {
  const key = normalizeFilterValue(name);
  return DISTRICT_ALIASES[key] || (name || '').trim();
}

/** Normalize state/region name to Tamil Nadu, Karnataka, or Kerala */
export function canonicalRegion(name) {
  const key = normalizeFilterValue(name);
  return REGION_ALIASES[key] || (name || '').trim();
}

/** Map filter/API district label to official district in REGION_DISTRICTS */
export function resolveDistrictInRegion(region, district) {
  if (!region || !district) return district || '';
  const r = canonicalRegion(region);
  const districts = REGION_DISTRICTS[r] || [];
  if (!districts.length) return canonicalDistrict(district) || district;

  const dNorm = normalizeFilterValue(district);
  const canon = canonicalDistrict(district);

  const exact = districts.find(
    (d) => normalizeFilterValue(d) === dNorm || normalizeFilterValue(d) === normalizeFilterValue(canon)
  );
  if (exact) return exact;

  const partial = districts.find((d) => {
    const n = normalizeFilterValue(d);
    return n.includes(dNorm) || dNorm.includes(n);
  });
  if (partial) return partial;

  return canon || district;
}

/** Which district a Court Master row belongs to */
export function resolveDistrictForCourt(region, row) {
  if (!region) return null;
  const r = canonicalRegion(region);
  const explicit = (row.courtDistrict || row.court_district || '').trim();
  if (explicit) return resolveDistrictInRegion(r, explicit);

  const city = (row.courtCity || row.court_city || '').trim();
  if (!city) return null;

  const cityNorm = normalizeFilterValue(city);
  const districts = REGION_DISTRICTS[r] || [];
  const direct = districts.find((d) => normalizeFilterValue(d) === cityNorm);
  if (direct) return resolveDistrictInRegion(r, direct);

  const cityMap = DISTRICT_CITIES[r] || {};
  for (const [district, cities] of Object.entries(cityMap)) {
    if (cities.some((c) => normalizeFilterValue(c) === cityNorm)) {
      return district;
    }
  }

  return resolveDistrictInRegion(r, city);
}

/** Trial / default court names for a district (always available in filters) */
export function getSeedCourtsForDistrict(region, district) {
  if (!region || !district) return [];
  const r = canonicalRegion(region);
  const resolved = resolveDistrictInRegion(r, district);
  const canon = canonicalDistrict(resolved);
  const override =
    DISTRICT_COURT_OVERRIDES[r]?.[canon] ||
    DISTRICT_COURT_OVERRIDES[r]?.[resolved] ||
    DISTRICT_COURT_OVERRIDES[r]?.[district];
  if (override?.length) return [...override];
  const fromMap =
    DISTRICT_COURTS[r]?.[canon] ||
    DISTRICT_COURTS[r]?.[resolved] ||
    DISTRICT_COURTS[r]?.[district];
  if (fromMap?.length) return [...fromMap];
  return [...STANDARD_DISTRICT_COURTS];
}

function collectCourtsForDistrict(hierarchy, region, district) {
  if (!region || !district) return [];
  const r = canonicalRegion(region);
  const resolved = resolveDistrictInRegion(r, district);
  const canon = canonicalDistrict(resolved);
  const names = new Set();

  getSeedCourtsForDistrict(r, resolved).forEach((c) => names.add(c));

  const regionKeys = [r, region].filter(
    (key, i, arr) => key && arr.indexOf(key) === i
  );

  const addFromBucket = (bucket, key) => {
    if (!key || !bucket?.[key]) return;
    const list = bucket[key];
    if (!Array.isArray(list)) return;
    list.forEach((c) => {
      if (c && !isPoliceStationName(c)) names.add(c);
    });
  };

  regionKeys.forEach((regionKey) => {
    const regionBucket = hierarchy[regionKey] || {};
    addFromBucket(regionBucket, resolved);
    addFromBucket(regionBucket, district);
    if (canon !== resolved) addFromBucket(regionBucket, canon);

    const cities =
      DISTRICT_CITIES[r]?.[canon] ||
      DISTRICT_CITIES[r]?.[resolved] ||
      DISTRICT_CITIES[r]?.[district] ||
      [];
    cities.forEach((city) => addFromBucket(regionBucket, city));
  });

  return [...names].sort((a, b) => a.localeCompare(b));
}

function ensureDistrict(hierarchy, region, district) {
  if (!hierarchy[region]) hierarchy[region] = {};
  if (!hierarchy[region][district]) hierarchy[region][district] = [];
}

function addCourtToDistrict(hierarchy, region, district, court) {
  if (!court) return;
  const r = canonicalRegion(region);
  const d = resolveDistrictInRegion(r, district);
  ensureDistrict(hierarchy, r, d);
  const list = hierarchy[r][d];
  if (!list.some((c) => normalizeFilterValue(c) === normalizeFilterValue(court))) {
    list.push(court);
  }
}

/** Seed district keys per state */
export function seedRegionDistricts(hierarchy = {}) {
  const out = { ...hierarchy };
  Object.entries(REGION_DISTRICTS).forEach(([region, districts]) => {
    districts.forEach((d) => ensureDistrict(out, region, d));
  });
  return out;
}

/** Seed court lists for every district in every state */
export function seedDistrictCourts(hierarchy = {}) {
  const out = { ...hierarchy };
  Object.entries(DISTRICT_COURTS).forEach(([region, districts]) => {
    Object.entries(districts).forEach(([district, courts]) => {
      courts.forEach((court) => addCourtToDistrict(out, region, district, court));
    });
  });
  return out;
}

/** Match advocate court name to a filter option (exact or partial) */
export function courtMatchesFilter(userCourt, filterCourt) {
  if (!filterCourt) return true;
  const u = normalizeFilterValue(userCourt);
  const f = normalizeFilterValue(filterCourt);
  if (!u || u === 'unspecified') return false;
  if (u === f) return true;
  return u.includes(f) || f.includes(u);
}

/**
 * { [state]: { [district]: [courtName, ...] } }
 */
export function buildRegionHierarchyFromCourts(apiCourts = []) {
  const hierarchy = seedDistrictCourts(seedRegionDistricts({}));

  apiCourts.forEach((row) => {
    const region = canonicalRegion((row.courtState || row.court_state || '').trim());
    const court = (row.courtName || row.court_name || '').trim();
    if (!region || !court || isPoliceStationName(court)) return;

    const district = resolveDistrictForCourt(region, row);
    if (!district) return;

    addCourtToDistrict(hierarchy, region, district, court);
  });

  Object.keys(hierarchy).forEach((region) => {
    Object.keys(hierarchy[region]).forEach((district) => {
      hierarchy[region][district].sort((a, b) => a.localeCompare(b));
    });
  });

  return hierarchy;
}

export function getRegionList(hierarchy = {}) {
  const fromApi = Object.keys(hierarchy)
    .filter((r) => r && r !== 'Unspecified')
    .map((r) => canonicalRegion(r));
  const fromSeed = Object.keys(REGION_DISTRICTS);
  return [...new Set([...fromApi, ...fromSeed])].sort((a, b) => a.localeCompare(b));
}

export function getDistrictsForRegion(region, hierarchy = {}) {
  if (!region) return [];
  const r = canonicalRegion(region);
  const fromHierarchy = hierarchy[r] ? Object.keys(hierarchy[r]) : [];
  const altHierarchy =
    region !== r && hierarchy[region] ? Object.keys(hierarchy[region]) : [];
  const fromSeed = REGION_DISTRICTS[r] ? [...REGION_DISTRICTS[r]] : [];
  const merged = [...fromHierarchy, ...altHierarchy, ...fromSeed].map((d) =>
    resolveDistrictInRegion(r, d)
  );
  return [...new Set(merged)].sort((a, b) => a.localeCompare(b));
}

/** All court names in the selected district (seed + Court Master + city buckets) */
export function getCourtsForDistrictInRegion(region, district, hierarchy = {}) {
  const r = canonicalRegion(region);
  const d = resolveDistrictInRegion(r, district);
  return collectCourtsForDistrict(hierarchy, r, d);
}

/** Merge API court-filter payload with local district/court seeds */
export function mergeCourtFilterApiResponse(data = {}) {
  const rows = [];

  Object.entries(data.hierarchy || {}).forEach(([region, byDistrict]) => {
    if (!byDistrict || typeof byDistrict !== 'object') return;
    Object.entries(byDistrict).forEach(([district, courtList]) => {
      if (!Array.isArray(courtList)) return;
      courtList.forEach((courtName) => {
        if (courtName) {
          rows.push({
            courtState: region,
            courtDistrict: district,
            courtName,
          });
        }
      });
    });
  });

  Object.entries(data.districtCourts || {}).forEach(([region, byDistrict]) => {
    if (!byDistrict || typeof byDistrict !== 'object') return;
    Object.entries(byDistrict).forEach(([district, courtList]) => {
      if (!Array.isArray(courtList)) return;
      courtList.forEach((courtName) => {
        if (courtName) {
          rows.push({
            courtState: region,
            courtDistrict: district,
            courtName,
          });
        }
      });
    });
  });

  return buildRegionHierarchyFromCourts(rows);
}

export function resolveUserDistrict(user) {
  const raw = user.district || '';
  if (raw && raw !== 'Unspecified') {
    return canonicalDistrict(raw) || raw;
  }
  const city = user.city || '';
  if (city && city !== 'Unspecified') {
    return canonicalDistrict(city) || city;
  }
  return raw || 'Unspecified';
}

/** Mock data: all states/districts with full seeded court lists */
export const MOCK_REGION_HIERARCHY = buildRegionHierarchyFromCourts([]);

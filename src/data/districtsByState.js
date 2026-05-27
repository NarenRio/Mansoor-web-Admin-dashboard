/**
 * All revenue districts per state (Tamil Nadu 38, Karnataka 31, Kerala 14).
 * Source: state government / census administrative lists.
 */

export const ALL_INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export const REGION_DISTRICTS = {
  'Tamil Nadu': [
    'Ariyalur',
    'Chengalpattu',
    'Chennai',
    'Coimbatore',
    'Cuddalore',
    'Dharmapuri',
    'Dindigul',
    'Erode',
    'Kallakurichi',
    'Kancheepuram',
    'Kanniyakumari',
    'Karur',
    'Krishnagiri',
    'Madurai',
    'Mayiladuthurai',
    'Nagapattinam',
    'Namakkal',
    'Perambalur',
    'Pudukkottai',
    'Ramanathapuram',
    'Ranipet',
    'Salem',
    'Sivagangai',
    'Tenkasi',
    'Thanjavur',
    'Theni',
    'The Nilgiris',
    'Thoothukudi',
    'Tiruchirappalli',
    'Tirunelveli',
    'Tirupathur',
    'Tiruppur',
    'Tiruvallur',
    'Tiruvannamalai',
    'Tiruvarur',
    'Vellore',
    'Viluppuram',
    'Virudhunagar',
  ],
  Karnataka: [
    'Bagalkot',
    'Ballari',
    'Belagavi',
    'Bengaluru Rural',
    'Bengaluru Urban',
    'Bidar',
    'Chamarajanagar',
    'Chikkaballapur',
    'Chikkamagaluru',
    'Chitradurga',
    'Dakshina Kannada',
    'Davanagere',
    'Dharwad',
    'Gadag',
    'Hassan',
    'Haveri',
    'Kalaburagi',
    'Kodagu',
    'Kolar',
    'Koppal',
    'Mandya',
    'Mysuru',
    'Raichur',
    'Ramanagara',
    'Shivamogga',
    'Tumakuru',
    'Udupi',
    'Uttara Kannada',
    'Vijayanagara',
    'Vijayapura',
    'Yadgir',
  ],
  Kerala: [
    'Alappuzha',
    'Ernakulam',
    'Idukki',
    'Kannur',
    'Kasaragod',
    'Kollam',
    'Kottayam',
    'Kozhikode',
    'Malappuram',
    'Palakkad',
    'Pathanamthitta',
    'Thiruvananthapuram',
    'Thrissur',
    'Wayanad',
  ],
};

/** Extra city/locality names per district (merged with district name as default city) */
export const DISTRICT_CITIES_EXTRA = {
  'Tamil Nadu': {
    Coimbatore: ['Coimbatore', 'Sulur', 'Pollachi', 'Mettupalayam'],
    Chennai: ['Chennai', 'Tambaram', 'Ambattur', 'Avadi'],
    Madurai: ['Madurai', 'Melur'],
    Salem: ['Salem', 'Attur', 'Mettur'],
    Tiruchirappalli: ['Tiruchirappalli', 'Srirangam'],
    Kanniyakumari: ['Nagercoil', 'Kanniyakumari'],
    'The Nilgiris': ['Udhagamandalam', 'Ooty', 'Coonoor'],
    Krishnagiri: ['Hosur', 'Krishnagiri'],
  },
  Karnataka: {
    'Bengaluru Urban': ['Bengaluru', 'Bangalore', 'Jayanagar', 'Whitefield', 'Indiranagar'],
    'Bengaluru Rural': ['Devanahalli', 'Doddaballapura', 'Nelamangala'],
    Mysuru: ['Mysuru', 'Mysore', 'Nanjangud'],
    'Dakshina Kannada': ['Mangaluru', 'Mangalore', 'Puttur'],
    Belagavi: ['Belagavi', 'Belgaum'],
    Dharwad: ['Dharwad', 'Hubballi', 'Hubli'],
  },
  Kerala: {
    Ernakulam: ['Kochi', 'Ernakulam', 'Aluva', 'Kakkanad'],
    Thiruvananthapuram: ['Thiruvananthapuram', 'Trivandrum', 'Attingal'],
    Kozhikode: ['Kozhikode', 'Calicut'],
  },
};

export function getDistrictsForState(state) {
  if (!state) return [];
  return (REGION_DISTRICTS[state] || []).slice().sort();
}

export function getAllDistricts() {
  const set = new Set();
  Object.values(REGION_DISTRICTS).forEach((districts) => {
    districts.forEach((d) => set.add(d));
  });
  return [...set].sort();
}

export function getCitiesForDistrict(state, district) {
  if (!state || !district) return [];
  const extras = DISTRICT_CITIES_EXTRA[state]?.[district] || [];
  return extras.length > 0 ? [...extras].sort() : [district];
}

/** Cities for a district name when state is unknown (e.g. "All states" selected). */
export function getCitiesForDistrictName(district) {
  if (!district) return [];
  const set = new Set();
  for (const [state, districts] of Object.entries(REGION_DISTRICTS)) {
    if (districts.includes(district)) {
      getCitiesForDistrict(state, district).forEach((c) => set.add(c));
    }
  }
  if (set.size === 0) set.add(district);
  return [...set].sort();
}

export function getAllCitiesForState(state) {
  if (!state) return [];
  const set = new Set();
  (REGION_DISTRICTS[state] || []).forEach((district) => {
    getCitiesForDistrict(state, district).forEach((c) => set.add(c));
  });
  return [...set].sort();
}

export function getAllCities() {
  const set = new Set();
  Object.entries(REGION_DISTRICTS).forEach(([state, districts]) => {
    districts.forEach((district) => {
      getCitiesForDistrict(state, district).forEach((c) => set.add(c));
    });
  });
  return [...set].sort();
}

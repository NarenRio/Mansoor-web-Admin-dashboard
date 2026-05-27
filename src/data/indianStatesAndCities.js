const INDIAN_STATES_AND_CITIES = {
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool',
    'Kakinada', 'Rajahmundry', 'Tirupati', 'Kadapa', 'Anantapur',
    'Eluru', 'Ongole', 'Srikakulam', 'Chittoor', 'Machilipatnam',
    'Adoni', 'Tenali', 'Proddatur', 'Nandyal', 'Bhimavaram',
  ],
  'Arunachal Pradesh': [
    'Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro',
    'Bomdila', 'Along', 'Tezu', 'Roing', 'Changlang',
  ],
  'Assam': [
    'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon',
    'Tinsukia', 'Tezpur', 'Bongaigaon', 'Karimganj', 'Goalpara',
    'Sivasagar', 'Lakhimpur', 'Diphu', 'Nalbari', 'Dhubri',
  ],
  'Bihar': [
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia',
    'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar',
    'Munger', 'Chhapra', 'Samastipur', 'Hajipur', 'Sasaram',
    'Dehri', 'Siwan', 'Motihari', 'Nawada', 'Bettiah',
  ],
  'Chhattisgarh': [
    'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg',
    'Rajnandgaon', 'Jagdalpur', 'Ambikapur', 'Raigarh', 'Dhamtari',
    'Mahasamund', 'Chirmiri', 'Kanker', 'Kawardha', 'Janjgir',
  ],
  'Goa': [
    'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda',
    'Bicholim', 'Curchorem', 'Sanquelim', 'Cuncolim', 'Quepem',
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar',
    'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad',
    'Morbi', 'Mehsana', 'Bharuch', 'Vapi', 'Navsari',
    'Veraval', 'Porbandar', 'Godhra', 'Bhuj', 'Palanpur',
  ],
  'Haryana': [
    'Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Yamunanagar',
    'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula',
    'Bhiwani', 'Sirsa', 'Jind', 'Thanesar', 'Kaithal',
    'Rewari', 'Palwal', 'Hansi', 'Bahadurgarh', 'Mahendragarh',
  ],
  'Himachal Pradesh': [
    'Shimla', 'Manali', 'Dharamshala', 'Solan', 'Mandi',
    'Palampur', 'Bilaspur', 'Kullu', 'Hamirpur', 'Una',
    'Nahan', 'Chamba', 'Kangra', 'Sundernagar', 'Rampur',
  ],
  'Jharkhand': [
    'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar',
    'Hazaribagh', 'Giridih', 'Ramgarh', 'Phusro', 'Medininagar',
    'Dumka', 'Chaibasa', 'Chatra', 'Gumla', 'Lohardaga',
  ],
  'Karnataka': [
    'Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi',
    'Kalaburagi', 'Davanagere', 'Ballari', 'Shivamogga', 'Tumakuru',
    'Udupi', 'Vijayapura', 'Hassan', 'Chitradurga', 'Raichur',
    'Bidar', 'Mandya', 'Gadag', 'Kolar', 'Chikkamagaluru',
    'Bagalkot', 'Haveri', 'Dharwad', 'Koppal', 'Kodagu',
    'Ramanagara', 'Chamarajanagar', 'Yadgir', 'Chikkaballapur',
  ],
  'Kerala': [
    'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam',
    'Alappuzha', 'Palakkad', 'Malappuram', 'Kannur', 'Kasaragod',
    'Kottayam', 'Idukki', 'Ernakulam', 'Pathanamthitta', 'Wayanad',
  ],
  'Madhya Pradesh': [
    'Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain',
    'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa',
    'Murwara', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena',
    'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha',
  ],
  'Maharashtra': [
    'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik',
    'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Navi Mumbai',
    'Sangli', 'Malegaon', 'Jalgaon', 'Akola', 'Latur',
    'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Nanded',
    'Satara', 'Ratnagiri', 'Osmanabad', 'Beed', 'Wardha',
  ],
  'Manipur': [
    'Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching',
    'Ukhrul', 'Senapati', 'Tamenglong', 'Chandel', 'Jiribam',
  ],
  'Meghalaya': [
    'Shillong', 'Tura', 'Jowai', 'Nongstoin', 'Williamnagar',
    'Baghmara', 'Resubelpara', 'Ampati', 'Mairang', 'Nongpoh',
  ],
  'Mizoram': [
    'Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib',
    'Lawngtlai', 'Mamit', 'Saiha', 'Hnahthial', 'Khawzawl',
  ],
  'Nagaland': [
    'Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha',
    'Mon', 'Zunheboto', 'Phek', 'Kiphire', 'Longleng',
  ],
  'Odisha': [
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur',
    'Puri', 'Balasore', 'Baripada', 'Bhadrak', 'Jharsuguda',
    'Jeypore', 'Angul', 'Kendrapara', 'Jajpur', 'Dhenkanal',
  ],
  'Punjab': [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda',
    'Mohali', 'Pathankot', 'Hoshiarpur', 'Moga', 'Batala',
    'Abohar', 'Malerkotla', 'Khanna', 'Muktsar', 'Barnala',
    'Rajpura', 'Firozpur', 'Kapurthala', 'Faridkot', 'Sangrur',
  ],
  'Rajasthan': [
    'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner',
    'Ajmer', 'Bhilwara', 'Alwar', 'Sikar', 'Sri Ganganagar',
    'Pali', 'Bharatpur', 'Tonk', 'Kishangarh', 'Beawar',
    'Hanumangarh', 'Dhaulpur', 'Gangapur City', 'Sawai Madhopur', 'Churu',
  ],
  'Sikkim': [
    'Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo',
    'Singtam', 'Jorethang', 'Ravangla', 'Pelling', 'Lachung',
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
    'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur',
    'Ranipet', 'Karur', 'Kancheepuram', 'Hosur', 'Tiruvannamalai', 'Pollachi',
    'Kumbakonam', 'Ambur', 'Viluppuram', 'Ariyalur', 'Chengalpattu', 'Cuddalore',
    'Dharmapuri', 'Kallakurichi', 'Kanniyakumari', 'Krishnagiri', 'Mayiladuthurai',
    'Nagapattinam', 'Namakkal', 'Perambalur', 'Pudukkottai', 'Ramanathapuram',
    'Sivagangai', 'Tenkasi', 'Theni', 'The Nilgiris', 'Tirupathur', 'Tiruvallur',
    'Tiruvarur', 'Virudhunagar', 'Nagercoil', 'Sivakasi', 'Rajapalayam',
    'Mettupalayam', 'Sriperumbudur', 'Tambaram', 'Avadi', 'Neyveli',
  ],
  'Telangana': [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam',
    'Mahbubnagar', 'Ramagundam', 'Nalgonda', 'Adilabad', 'Suryapet',
    'Miryalaguda', 'Siddipet', 'Mancherial', 'Jagtial', 'Nirmal',
  ],
  'Tripura': [
    'Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Belonia',
    'Ambassa', 'Khowai', 'Sabroom', 'Sonamura', 'Amarpur',
  ],
  'Uttar Pradesh': [
    'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut',
    'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad', 'Ghaziabad',
    'Noida', 'Saharanpur', 'Gorakhpur', 'Firozabad', 'Jhansi',
    'Muzaffarnagar', 'Mathura', 'Rampur', 'Shahjahanpur', 'Ayodhya',
    'Sultanpur', 'Fatehpur', 'Rae Bareli', 'Sitapur', 'Lakhimpur Kheri',
  ],
  'Uttarakhand': [
    'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur',
    'Kashipur', 'Rishikesh', 'Nainital', 'Almora', 'Pithoragarh',
    'Mussoorie', 'Pauri', 'Tehri', 'Uttarkashi', 'Chamoli',
  ],
  'West Bengal': [
    'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri',
    'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur',
    'Shantipur', 'Haldia', 'Raiganj', 'Krishnanagar', 'Nabadwip',
    'Medinipur', 'Jalpaiguri', 'Balurghat', 'Basirhat', 'Bankura',
  ],
  'Andaman and Nicobar Islands': [
    'Port Blair', 'Bamboo Flat', 'Garacharma', 'Prothrapur', 'Diglipur',
  ],
  'Chandigarh': [
    'Chandigarh',
  ],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'Silvassa', 'Daman', 'Diu',
  ],
  'Delhi': [
    'New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Saket',
    'Janakpuri', 'Laxmi Nagar', 'Karol Bagh', 'Pitampura', 'Shahdara',
  ],
  'Jammu and Kashmir': [
    'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore',
    'Kathua', 'Udhampur', 'Poonch', 'Rajouri', 'Kupwara',
  ],
  'Ladakh': [
    'Leh', 'Kargil',
  ],
  'Lakshadweep': [
    'Kavaratti', 'Agatti', 'Minicoy', 'Amini',
  ],
  'Puducherry': [
    'Puducherry', 'Karaikal', 'Mahe', 'Yanam',
  ],
};

export const INDIAN_STATES = Object.keys(INDIAN_STATES_AND_CITIES).sort();

export function getCitiesForState(state) {
  return INDIAN_STATES_AND_CITIES[state] || [];
}

export default INDIAN_STATES_AND_CITIES;

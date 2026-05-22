import { useMemo } from 'react';
import LaLawOnlineActivityPanel from '../components/LaLawOnlineActivityPanel';
import {
  MOCK_REGION_HIERARCHY,
  getRegionList,
  getDistrictsForRegion,
  getCourtsForDistrictInRegion,
} from '../data/regionCourtHierarchy';

const FIRMS = [
  'Sharma & Associates',
  'Menon Legal Chambers',
  'Iyer & Co.',
  'Desai Law Office',
];

const REGIONS = getRegionList(MOCK_REGION_HIERARCHY);

function buildMockOnlineUsers(count = 24) {
  return Array.from({ length: count }, (_, i) => {
    const id = 1000 + i;
    const region = REGIONS[i % REGIONS.length];
    const districts = getDistrictsForRegion(region, MOCK_REGION_HIERARCHY);
    const district = districts[i % districts.length];
    const courts = getCourtsForDistrictInRegion(region, district, MOCK_REGION_HIERARCHY);
    const courtName = courts[i % courts.length] || courts[0] || 'Unspecified';
    const sessionMin = 10 + (i % 90);
    const todayMin = sessionMin + (i % 60);
    const hours = Math.floor(sessionMin / 60);
    const sm = sessionMin % 60;
    const sessionLabel = hours > 0 ? `${hours}h ${sm}m` : `${sessionMin} min`;
    const th = Math.floor(todayMin / 60);
    const tm = todayMin % 60;
    const todayLabel = th > 0 ? `${th}h ${tm}m` : `${todayMin} min`;
    const allMin = todayMin + 120 + (i % 200);
    const ah = Math.floor(allMin / 60);
    const am = allMin % 60;
    const allLabel = ah > 0 ? `${ah}h ${am}m` : `${allMin} min`;

    return {
      id,
      name: `Adv. Sample ${id}`,
      email: `advocate${id}@example.com`,
      firmName: FIRMS[i % FIRMS.length],
      region,
      district,
      courtName,
      timeSpentToday: todayLabel,
      timeSpentAll: allLabel,
      todayMinutes: todayMin,
      allMinutes: allMin,
      userSessions: [
        {
          lawyerId: id,
          startTime: '22 May 2026, 06:30:00 AM',
          endTime: '22 May 2026, 08:15:00 AM',
          durationLabel: '1h 45m',
          isActive: false,
        },
        {
          lawyerId: id,
          startTime: '22 May 2026, 09:10:22 AM',
          endTime: 'Active',
          durationLabel: sessionLabel,
          isActive: true,
        },
      ],
    };
  });
}

function LaLawActivityMockupPage() {
  const mockUsers = useMemo(() => buildMockOnlineUsers(24), []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-purple text-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Active users</h1>
          <p className="mt-1 text-sm text-purple-100">UI preview with sample data (for review)</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <LaLawOnlineActivityPanel
          users={mockUsers}
          loading={false}
          idleMinutes={15}
          timezoneLabel="IST"
          regionHierarchy={MOCK_REGION_HIERARCHY}
          onRefresh={() => window.location.reload()}
        />
      </main>
    </div>
  );
}

export default LaLawActivityMockupPage;

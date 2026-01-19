import { useState, memo } from 'react';
import AdvocatesTable from './AdvocatesTable';

const FirmsTable = memo(({ firms, onActivate, onDeactivate, loadingUsers }) => {
  const [expandedFirmId, setExpandedFirmId] = useState(null);

  const toggleExpand = (firmId) => {
    setExpandedFirmId(expandedFirmId === firmId ? null : firmId);
  };

  if (!firms || firms.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500">No firms found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-primary-purple">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Firm Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Advocates
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {firms.map((firm) => {
              const firmId = firm.lId || firm.id || firm.firmId;
              const isExpanded = expandedFirmId === firmId;
              const advocateCount = firm.advocateCount || firm.advocates?.length || 0;

              return (
                <>
                  <tr
                    key={firmId}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      isExpanded ? 'bg-purple-50' : ''
                    }`}
                    onClick={() => toggleExpand(firmId)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-primary-purple text-white font-semibold mr-3">
                          {(firm.lName || firm.firmName || 'F')[0].toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {firm.lName || firm.firmName || 'Unknown Firm'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {firm.lEmail || firm.email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {firm.lPhone || firm.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {firm.lAddress || firm.address || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {advocateCount} {advocateCount === 1 ? 'Advocate' : 'Advocates'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(firmId);
                        }}
                        className="text-primary-purple hover:text-primary-purple-dark"
                      >
                        <svg
                          className={`w-5 h-5 transition-transform ${
                            isExpanded ? 'transform rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  {isExpanded && firm.advocates && firm.advocates.length > 0 && (
                    <tr>
                      <td colSpan="6" className="px-0 py-0">
                        <div className="bg-gray-50 px-6 py-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            Advocates for {firm.lName || firm.firmName}
                          </h4>
                          <AdvocatesTable
                            advocates={firm.advocates}
                            onActivate={onActivate}
                            onDeactivate={onDeactivate}
                            loadingUsers={loadingUsers}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

FirmsTable.displayName = 'FirmsTable';

export default FirmsTable;


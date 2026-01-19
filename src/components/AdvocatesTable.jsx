import { memo } from 'react';

const AdvocatesTable = memo(({ advocates, onActivate, onDeactivate, loadingUsers = new Set() }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (!advocates || advocates.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        No advocates found for this firm.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Address
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
              Email Verified
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {advocates.map((advocate) => {
            const status = advocate.status || 'Pending';
            const isActive = status.toLowerCase() === 'active';
            // Handle emailVerified - it can be true, false, null, undefined, 'true', 'false', etc.
            const emailVerified = advocate.emailVerified === true || 
                                  advocate.emailVerified === 'true' || 
                                  advocate.emailVerified === 1 ||
                                  (typeof advocate.emailVerified === 'boolean' && advocate.emailVerified === true);

            return (
              <tr key={advocate.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-semibold mr-3">
                      {(advocate.name || 'A')[0].toUpperCase()}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {advocate.name || '-'}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {advocate.email || '-'}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {advocate.phone || '-'}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {advocate.address || '-'}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(
                      status
                    )}`}
                  >
                    {status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {emailVerified ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-300">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-300">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Not Verified
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {(() => {
                    const isLoading = loadingUsers.has(advocate.id);
                    
                    if (isActive) {
                      return (
                        <button
                          onClick={() => onDeactivate(advocate.id, advocate.name)}
                          disabled={isLoading}
                          className={`px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            isLoading
                              ? 'bg-red-400 cursor-not-allowed'
                              : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                          }`}
                        >
                          {isLoading ? (
                            <span className="flex items-center gap-1">
                              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </span>
                          ) : (
                            'Deactivate'
                          )}
                        </button>
                      );
                    } else if (emailVerified) {
                      return (
                        <button
                          onClick={() => onActivate(advocate.id, advocate.name)}
                          disabled={isLoading}
                          className={`px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            isLoading
                              ? 'bg-green-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                          }`}
                        >
                          {isLoading ? (
                            <span className="flex items-center gap-1">
                              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </span>
                          ) : (
                            'Activate'
                          )}
                        </button>
                      );
                    } else {
                      return (
                        <span className="px-3 py-1.5 text-xs text-gray-500">
                          Email not verified
                        </span>
                      );
                    }
                  })()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

AdvocatesTable.displayName = 'AdvocatesTable';

export default AdvocatesTable;


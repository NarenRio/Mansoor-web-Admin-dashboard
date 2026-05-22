import { useMemo, useState } from 'react';

function UserTimeSpentPanel({
  users,
  sessions = [],
  loading,
  error,
  onRefresh,
  totalTodayLabel,
  totalAllLabel,
  timezoneLabel = 'IST',
}) {
  const [expandedUserId, setExpandedUserId] = useState(null);

  const sessionsByUser = useMemo(() => {
    const map = {};
    sessions.forEach((session) => {
      const id = session.lawyerId;
      if (!map[id]) map[id] = [];
      map[id].push(session);
    });
    return map;
  }, [sessions]);

  const toggleUser = (userId) => {
    setExpandedUserId((prev) => (prev === userId ? null : userId));
  };

  return (
    <section className="mb-8 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Time spent by user
            </h2>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-semibold text-primary-purple">
                {loading ? '…' : users.length}
              </span>{' '}
              user{users.length !== 1 ? 's' : ''} with usage data
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Click a name to see total time worked and sessions ({timezoneLabel})
              {totalTodayLabel != null && (
                <span>
                  {' '}
                  · All users today: {totalTodayLabel}
                </span>
              )}
              {totalAllLabel != null && (
                <span> · All users total: {totalAllLabel}</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-primary-purple text-white rounded-lg hover:bg-primary-purple-dark disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="px-6 py-4">
        {loading && users.length === 0 ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-gray-500">No usage data yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            {users.map((user) => {
              const isOpen = expandedUserId === user.id;
              const userSessions = sessionsByUser[user.id] || [];

              return (
                <li key={user.id} className="bg-white">
                  <button
                    type="button"
                    onClick={() => toggleUser(user.id)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-purple-50 transition-colors ${
                      isOpen ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <svg
                        className={`w-5 h-5 text-primary-purple shrink-0 transition-transform ${
                          isOpen ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                          {user.firmName ? ` · ${user.firmName}` : ''}
                        </p>
                      </div>
                    </div>
                    {!isOpen && (
                      <span className="text-xs text-gray-400 shrink-0">
                        Click to view time
                      </span>
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-0 bg-gray-50 border-t border-gray-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 mt-3">
                        <div className="bg-white rounded-lg border border-green-200 px-4 py-3">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Today
                          </p>
                          <p className="text-lg font-bold text-green-700 mt-1">
                            {user.timeSpentTodayLabel || '0 min'}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {user.sessionCountToday ?? 0} session
                            {(user.sessionCountToday ?? 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg border border-purple-200 px-4 py-3">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Total time worked
                          </p>
                          <p className="text-lg font-bold text-primary-purple mt-1">
                            {user.timeSpentAllLabel || '0 min'}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {user.sessionCountAll ?? user.sessionCount ?? 0}{' '}
                            session
                            {(user.sessionCountAll ?? user.sessionCount ?? 0) !== 1
                              ? 's'
                              : ''}{' '}
                            all time
                          </p>
                        </div>
                      </div>

                      <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">
                        Sessions (start & end)
                      </h4>
                      {userSessions.length === 0 ? (
                        <p className="text-sm text-gray-500">No session rows found.</p>
                      ) : (
                        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="text-left text-gray-500 bg-gray-50 border-b">
                                <th className="px-3 py-2 font-medium">Start</th>
                                <th className="px-3 py-2 font-medium">End</th>
                                <th className="px-3 py-2 font-medium text-right">
                                  Duration
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {userSessions.map((session, index) => (
                                <tr key={index}>
                                  <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                                    {session.startTime || '—'}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    {session.isActive ? (
                                      <span className="text-green-700 font-medium">
                                        {session.endTime}
                                      </span>
                                    ) : (
                                      <span className="text-gray-700">
                                        {session.endTime}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-right text-gray-600">
                                    {session.durationLabel}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

export default UserTimeSpentPanel;

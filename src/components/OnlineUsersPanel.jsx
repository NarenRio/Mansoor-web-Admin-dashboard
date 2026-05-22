function OnlineUsersPanel({ users, loading, error, onRefresh, idleMinutes = 10, timezoneLabel = 'IST' }) {
  return (
    <section className="mb-8 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-purple-50">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Online now ({loading ? '…' : users.length})
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Active in the last {idleMinutes} min ({timezoneLabel})
            </p>
          </div>
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

      <div className="px-6 py-4">
        {loading && users.length === 0 ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-gray-500">No lawyers are online right now.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {users.map((user) => (
              <li
                key={user.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
              >
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="text-sm text-right">
                  <p className="text-gray-500">{user.firmName || 'No firm'}</p>
                  <p className="text-green-700 font-medium mt-0.5">
                    {user.activeAgoLabel || 'Active just now'}
                  </p>
                  {user.lastActiveAtDisplay && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {user.lastActiveAtDisplay} ({timezoneLabel})
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default OnlineUsersPanel;

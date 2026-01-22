import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { authService } from '../services/authService';

function CourtTypeMaster() {
  const navigate = useNavigate();
  const admin = authService.getAdmin();
  const [courtTypes, setCourtTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCourtType, setEditingCourtType] = useState(null);
  const [formData, setFormData] = useState({
    courtTypeName: ''
  });

  const handleLogout = () => {
    authService.clearAuth();
    navigate('/login');
  };

  useEffect(() => {
    loadCourtTypes();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCourtTypes();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadCourtTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAllCourtTypes(searchTerm || null);
      if (response.success) {
        setCourtTypes(response.data || []);
      } else {
        setError(response.message || 'Failed to load court types');
      }
    } catch (err) {
      console.error('Error loading court types:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load court types');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenModal = (courtType = null) => {
    if (courtType) {
      setEditingCourtType(courtType);
      setFormData({
        courtTypeName: courtType.courtTypeName || ''
      });
    } else {
      setEditingCourtType(null);
      setFormData({
        courtTypeName: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourtType(null);
    setFormData({
      courtTypeName: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourtType) {
        const response = await adminAPI.updateCourtType(editingCourtType.id, formData);
        if (response.success) {
          showNotification('Court type updated successfully', 'success');
          handleCloseModal();
          loadCourtTypes();
        } else {
          showNotification(response.message || 'Failed to update court type', 'error');
        }
      } else {
        const response = await adminAPI.createCourtType(formData);
        if (response.success) {
          showNotification('Court type created successfully', 'success');
          handleCloseModal();
          loadCourtTypes();
        } else {
          showNotification(response.message || 'Failed to create court type', 'error');
        }
      }
    } catch (err) {
      console.error('Error saving court type:', err);
      showNotification(
        err.response?.data?.message || err.message || 'Failed to save court type',
        'error'
      );
    }
  };

  const handleDelete = async (courtTypeId) => {
    if (!window.confirm('Are you sure you want to delete this court type?')) {
      return;
    }

    try {
      const response = await adminAPI.deleteCourtType(courtTypeId);
      if (response.success) {
        showNotification('Court type deleted successfully', 'success');
        loadCourtTypes();
      } else {
        showNotification(response.message || 'Failed to delete court type', 'error');
      }
    } catch (err) {
      console.error('Error deleting court type:', err);
      showNotification(
        err.response?.data?.message || err.message || 'Failed to delete court type',
        'error'
      );
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 hover:opacity-75"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-primary-purple text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="mt-2 text-purple-100">Court Master - Court Types</p>
            </div>
            <div className="flex items-center gap-4">
              {admin && (
                <span className="text-purple-100 text-sm">
                  {admin.email}
                </span>
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
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Court Types
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Add Button */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search court types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-2 bg-primary-purple text-white rounded-lg hover:bg-primary-purple-dark transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Court Type
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-red-900">Error Loading Data</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={loadCourtTypes}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : courtTypes.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-primary-purple">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Court Type Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courtTypes.map((courtType) => (
                    <tr key={courtType.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{courtType.courtTypeName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(courtType)}
                          className="text-primary-purple hover:text-primary-purple-dark mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(courtType.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Court Types Found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm
                ? 'No court types match your search. Try a different term.'
                : 'Get started by adding your first court type.'}
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-6 px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-primary-purple-dark transition-colors"
            >
              Add Court Type
            </button>
          </div>
        )}
      </main>

      {/* Modal for Add/Edit Court Type */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCourtType ? 'Edit Court Type' : 'Add New Court Type'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Court Type Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="courtTypeName"
                    value={formData.courtTypeName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-purple"
                    placeholder="e.g., District Court"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-primary-purple-dark transition-colors"
                  >
                    {editingCourtType ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourtTypeMaster;

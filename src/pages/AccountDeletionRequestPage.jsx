import { useState } from 'react';
import { publicAPI } from '../services/api';

const initialForm = {
  fullName: '',
  email: '',
  phoneNumber: '',
  requestedDataAction: 'delete_account_and_personal_data',
  specificDataDetails: '',
  reason: '',
};

function AccountDeletionRequestPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const onFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await publicAPI.submitAccountDeletionRequest(form);
      setSuccessMessage(
        response?.message ||
          'Your account deletion request has been submitted successfully.'
      );
      setForm(initialForm);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          'Failed to submit request. Please try again later.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isSpecificDelete = form.requestedDataAction === 'delete_specific_data';

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-700 to-purple-600 p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              La Law Account Deletion Request
            </h1>
            <p className="mt-2 text-purple-100">
              Submit your request to delete account data. No login is required.
            </p>
            <p className="mt-2 text-purple-100 text-sm">
              Provided by RIO Bizsols Private Limited.
            </p>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Step 1
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  Provide your registered account details.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Step 2
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  Choose full deletion, account-only, or specific-data deletion.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Step 3
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  Submit request. Our team reviews and processes it manually.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900">Data that can be deleted</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Account/profile details, case records, complainant and accused details,
                  petition entries, and uploaded/generated documents linked to your account.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900">Retention note</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Deletion requests are reviewed manually. Some data may be retained until
                  review is completed and actioned by our team.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <h3 className="font-semibold text-gray-900">Request processing timeline</h3>
              <p className="mt-2 text-sm text-gray-700">
                We aim to review and action account deletion requests within 7 business days.
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={onFieldChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Registered Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={onFieldChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phoneNumber">
                Phone Number (optional)
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="text"
                value={form.phoneNumber}
                onChange={onFieldChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="requestedDataAction"
              >
                Requested Action *
              </label>
              <select
                id="requestedDataAction"
                name="requestedDataAction"
                required
                value={form.requestedDataAction}
                onChange={onFieldChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="delete_account_and_personal_data">
                  Delete account and associated personal/app data
                </option>
                <option value="delete_account_only">Delete account only</option>
                <option value="delete_specific_data">Delete specific data only</option>
              </select>
            </div>

            {isSpecificDelete ? (
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="specificDataDetails"
                >
                  Specific Data to Delete *
                </label>
                <textarea
                  id="specificDataDetails"
                  name="specificDataDetails"
                  rows={4}
                  required
                  value={form.specificDataDetails}
                  onChange={onFieldChange}
                  placeholder="Example: Delete my case records for case number XXX, uploaded ID card, and generated petition PDFs."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            ) : null}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="reason">
                Additional Details (optional)
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={4}
                value={form.reason}
                onChange={onFieldChange}
                placeholder="Mention any specific data or account details to help us process your request."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {errorMessage ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-700 text-sm">
                {successMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full md:w-auto px-5 py-2.5 rounded-lg text-white font-medium ${
                submitting
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Deletion Request'}
            </button>
            </form>

            <p className="mt-6 text-xs text-gray-500">
              For support, contact: info@riobizsols.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountDeletionRequestPage;

import { useEffect, useMemo, useState } from 'react';
import { publicAPI } from '../services/api';

const STEPS = [
  { id: 'email', label: 'Email' },
  { id: 'otp', label: 'Verify' },
  { id: 'confirm', label: 'Confirm' },
  { id: 'progress', label: 'Delete' },
  { id: 'done', label: 'Done' },
];

const PROGRESS_STAGES = [
  { pct: 15, label: 'Verifying your request…' },
  { pct: 40, label: 'Locating your La LAW account…' },
  { pct: 70, label: 'Removing account credentials…' },
  { pct: 90, label: 'Sending confirmation email…' },
  { pct: 100, label: 'Account deleted' },
];

function AccountDeletionRequestPage() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [deletionToken, setDeletionToken] = useState('');
  const [accountName, setAccountName] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [typedDelete, setTypedDelete] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [deletedAt, setDeletedAt] = useState('');

  const stepIndex = useMemo(
    () => Math.max(0, STEPS.findIndex((s) => s.id === step)),
    [step]
  );

  const expectedConfirmPhrase = useMemo(() => {
    const name = String(accountName || '').trim();
    return name ? `DELETE ${name}` : 'DELETE';
  }, [accountName]);

  const confirmationMatches = useMemo(() => {
    return (
      typedDelete.trim().replace(/\s+/g, ' ').toLowerCase() ===
      expectedConfirmPhrase.replace(/\s+/g, ' ').toLowerCase()
    );
  }, [typedDelete, expectedConfirmPhrase]);

  useEffect(() => {
    setError('');
  }, [step]);

  const requestOtp = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await publicAPI.requestDeletionOtp({ email: email.trim() });
      setMaskedEmail(response?.data?.maskedEmail || email);
      setStep('otp');
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Could not send verification code. Try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await publicAPI.verifyDeletionOtp({
        email: email.trim(),
        otp: otp.trim(),
      });
      setDeletionToken(response?.data?.deletionToken || '');
      setAccountName(response?.data?.accountName || '');
      setStep('confirm');
    } catch (err) {
      setError(err?.response?.data?.message || 'Incorrect or expired code.');
    } finally {
      setBusy(false);
    }
  };

  const runProgress = async () => {
    for (const stage of PROGRESS_STAGES) {
      setProgress(stage.pct);
      setProgressLabel(stage.label);
      await new Promise((r) => setTimeout(r, stage.pct === 100 ? 200 : 550));
    }
  };

  const confirmDelete = async (event) => {
    event.preventDefault();
    if (!confirmationMatches || !understood) {
      setError(
        `Type "${expectedConfirmPhrase}" exactly and accept that this cannot be undone.`
      );
      return;
    }

    setStep('progress');
    setBusy(true);
    setError('');
    setProgress(8);
    setProgressLabel('Starting secure deletion…');

    const progressPromise = runProgress();

    try {
      const response = await publicAPI.confirmAccountDeletion({
        email: email.trim(),
        deletionToken,
        confirmationText: typedDelete.trim(),
      });
      await progressPromise;
      setDeletedAt(response?.data?.deletedAt || new Date().toISOString());
      setStep('done');
    } catch (err) {
      setProgress(0);
      setProgressLabel('');
      setStep('confirm');
      setError(
        err?.response?.data?.message ||
          'Deletion failed. Please verify again or contact support.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-50 via-slate-50 to-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-10 lg:py-14">
        <header className="mb-6 sm:mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
            La LAW
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            Delete your account
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Permanently remove your La LAW login account. This page works on phone,
            tablet, and desktop — no admin login required.
          </p>
        </header>

        {/* Step indicator */}
        <nav
          aria-label="Deletion steps"
          className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur sm:mb-8 sm:p-4"
        >
          <ol className="flex min-w-[280px] items-center justify-between gap-1 sm:gap-2">
            {STEPS.map((s, index) => {
              const active = index === stepIndex;
              const done = index < stepIndex;
              return (
                <li key={s.id} className="flex flex-1 flex-col items-center gap-1">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold sm:h-9 sm:w-9 sm:text-sm ${
                      done
                        ? 'bg-emerald-600 text-white'
                        : active
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {done ? '✓' : index + 1}
                  </span>
                  <span
                    className={`text-[10px] font-medium sm:text-xs ${
                      active ? 'text-rose-700' : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>

        <main className="flex-1 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-8">
          {error ? (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          {step === 'email' && (
            <form onSubmit={requestOtp} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                  Enter your registered email
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  We will send a one-time code to confirm it is your account.
                </p>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email address
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none ring-rose-500 transition focus:ring-2"
                />
              </label>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Deleting your account removes your La LAW login and all data linked
                to you in the system (profile, cases, petitions, documents, and
                related records). This cannot be undone.
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-rose-600 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300 sm:w-auto sm:min-w-[220px]"
              >
                {busy ? 'Sending code…' : 'Send verification code'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={verifyOtp} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                  Enter verification code
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Code sent to <span className="font-semibold">{maskedEmail}</span>. Valid
                  for 10 minutes.
                </p>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  6-digit OTP
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl tracking-[0.4em] outline-none ring-rose-500 transition focus:ring-2"
                />
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={busy || otp.length !== 6}
                  className="w-full rounded-xl bg-rose-600 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300 sm:flex-1"
                >
                  {busy ? 'Verifying…' : 'Verify code'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setOtp('');
                    setStep('email');
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex-1"
                >
                  Change email
                </button>
              </div>
            </form>
          )}

          {step === 'confirm' && (
            <form onSubmit={confirmDelete} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                  Final confirmation
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Account{accountName ? ` for ${accountName}` : ''} (
                  <span className="font-medium">{email}</span>) will be permanently
                  deleted.
                </p>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                <p className="font-semibold">This cannot be undone.</p>
                <p className="mt-2">
                  All of your La LAW data linked to this account will be removed,
                  including:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Login access and account credentials (email, password, profile)</li>
                  <li>Personal details (name, phone, address, qualification)</li>
                  <li>Uploaded ID card / identity documents</li>
                  <li>Case records created under your account</li>
                  <li>Accused and complainant details linked to your cases</li>
                  <li>Petition entries, answers, and generated petition documents</li>
                  <li>Saved signatures and document uploads tied to your account</li>
                  <li>App usage / session activity linked to your login</li>
                </ul>
                <p className="mt-3">
                  After deletion you will no longer be able to sign in to La LAW.
                  A confirmation email will be sent once the process is complete.
                </p>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Type{' '}
                  <span className="font-mono font-bold break-all">
                    {expectedConfirmPhrase}
                  </span>{' '}
                  to confirm
                </span>
                <input
                  type="text"
                  required
                  value={typedDelete}
                  onChange={(e) => setTypedDelete(e.target.value)}
                  placeholder={expectedConfirmPhrase}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-base outline-none ring-rose-500 transition focus:ring-2"
                />
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={understood}
                  onChange={(e) => setUnderstood(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span>
                  I understand this permanently deletes my La LAW account and I want to
                  continue.
                </span>
              </label>

              <button
                type="submit"
                disabled={busy || !confirmationMatches || !understood}
                className="w-full rounded-xl bg-rose-700 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                Permanently delete my account
              </button>
            </form>
          )}

          {step === 'progress' && (
            <div className="space-y-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                  Deleting account…
                </h2>
                <p className="mt-1 text-sm text-slate-600">{progressLabel}</p>
              </div>
              <div
                className="h-3 w-full overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-700 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-2xl font-bold tabular-nums text-rose-700">
                {progress}%
              </p>
              <p className="text-center text-xs text-slate-500">
                Please keep this page open until the process finishes.
              </p>
            </div>
          )}

          {step === 'done' && (
            <div className="space-y-5 text-center sm:text-left">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700 sm:mx-0">
                ✓
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                  Account deleted
                </h2>
                <p className="mt-2 text-sm text-slate-600 sm:text-base">
                  The La LAW account for <span className="font-semibold">{email}</span>{' '}
                  has been permanently removed.
                </p>
                {deletedAt ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Completed at {new Date(deletedAt).toLocaleString()}
                  </p>
                ) : null}
              </div>
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                A confirmation email has been sent. You can close this page.
              </p>
            </div>
          )}
        </main>

        <footer className="mt-6 text-center text-xs text-slate-500 sm:mt-8">
          Provided by RIO Bizsols Private Limited · Support:{' '}
          <a className="underline" href="mailto:info@riobizsols.com">
            info@riobizsols.com
          </a>
        </footer>
      </div>
    </div>
  );
}

export default AccountDeletionRequestPage;

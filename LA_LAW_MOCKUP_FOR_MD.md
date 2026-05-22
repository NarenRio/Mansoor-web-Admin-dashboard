# La Law — Online users (UI mockup for MD)

## Link to share

After you deploy the latest admin dashboard build, send your MD this URL:

**https://web.rioassetmanagement.net/la-law-activity-mockup**

If your admin site uses a different domain or folder, set it in `.env` before `npm run build`:

```env
VITE_PUBLIC_APP_URL=https://YOUR-ADMIN-DOMAIN.com
```

Then the mockup path is always: `{VITE_PUBLIC_APP_URL}/la-law-activity-mockup`

---

## Email text (copy-paste)

Subject: La Law admin — Online users screen (UI preview)

Hi,

Please review the new **La Law online users** section in the admin panel (sample data for layout only):

**https://web.rioassetmanagement.net/la-law-activity-mockup**

What to check:
1. **Active users** bar shows the live count; click it to open the list and filters.
2. **Total time** column — click a value to see **time today** and **login / logout** timestamps.
3. Auto logout after **15 minutes** with no app activity.

No login is required on this preview link. Live data will appear on the main admin dashboard after deployment.

Thanks.

---

## Deploy steps (so the link works for MD)

```bash
cd Mansoor-web-Admin-dashboard
npm run build
# Deploy dist/ to your server (Docker or static host), same as existing admin panel.
```

Mockup route: `/la-law-activity-mockup` (public, no admin login).

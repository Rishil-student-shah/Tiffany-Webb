# Progress — reviewer_m4_1

- **Last visited**: 2026-09-04T06:39:00Z
- **Status**: COMPLETED
- **Verdict**: REQUEST_CHANGES
- **Summary**:
  - Detailed static analysis of `server.js` (lines 1-1307) across all 8 security layers completed.
  - Layer 1 (Helmet), Layer 2 (CORS), Layer 4 (Recursive XSS), Layer 5 (SQL Parameterization & Route Shadowing elimination), Layer 6 (Secure Cookies), Layer 7 (Root Route Auth) verified as correctly implemented.
  - Critical Defect found in Layer 3: `loginLimiter` with `skipSuccessfulRequests: true` does NOT increment failed login attempts because `app.post('/login')` responds with status 200 via `res.render('login', ...)`, violating acceptance criterion R4.2.
  - Medium Risk found in Layer 8: Multer `fileFilter` for `video_file` permits non-whitelisted extensions if MIME is `application/octet-stream`.
  - Auth gap found in Notes API: `POST /api/leads/:id/notes` permits unauthenticated submissions and defaults author identity to Admin.
  - Handoff report prepared for parent.

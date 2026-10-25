# 🔒 KrishiSetu AI — Threat Model & Security Posture
**Smart India Hackathon (SIH) 2026 — DevSecOps & Security Governance Specification**

---

## 1. Threat Model & Vulnerability Matrix

| # | Threat Vector | Potential Impact | Engineered Mitigation Strategy | Implementation Status |
|:---:|:---|:---|:---|:---:|
| **T1** | **API Key & Secret Exposure** | Client inspection of browser network requests reveals paid LLM or database credentials, causing quota exhaustion or data breach. | • Client-supplied API keys (`body.api_key`) and `NEXT_PUBLIC_` secrets are strictly prohibited.<br>• All Gemini and database calls execute server-side using isolated `process.env.GEMINI_API_KEY`.<br>• Secret scrubbing verified in CI/CD. | **`[HARDENED]`** |
| **T2** | **Insecure Direct Object References (IDOR)** | Malicious farmer or buyer queries `/api/v1/settlements/{id}` or `/farmer/lots/{id}` belonging to another user. | • Token payload claims (`sub`, `role`) are validated on every database query.<br>• Farmers can only read/mutate lots where `farmer_id == current_user.id`.<br>• FPO Managers are constrained to their registered cluster jurisdiction. | **`[HARDENED]`** |
| **T3** | **Privilege Escalation / Role Bypass** | Farmer tampers with JWT role claim (e.g. changing `"role": "FARMER"` to `"ADMIN"`) to alter mandi prices. | • JWT tokens are signed server-side using HMAC-SHA256 with a 256-bit secret key.<br>• FastAPI dependency `require_roles(["ADMIN"])` verifies cryptographic token signature before executing route handlers.<br>• Tampered tokens return `HTTP 401 Unauthorized`. | **`[HARDENED]`** |
| **T4** | **Prompt Injection & Fake Client Context** | Attacker injects adversarial prompt text into AI chat or supplies fabricated account balances in client JSON. | • The AI chat gateway grounds all prompts using server-retrieved database records.<br>• Input text is sanitized and bounded.<br>• High-impact mutations (join pool, sell crop) require explicit user authorization via Confirmation Cards; the AI never has autonomous write access. | **`[HARDENED]`** |
| **T5** | **Double-Booking & Duplicate Settlements** | Concurrent requests cause a pool lot to be double-booked by two buyers, or a farmer settlement to be credited twice. | • Atomic reservation locks in `backend/app/api/v1/router.py` (`RESERVED_POOLS`).<br>• Idempotent state transitions return `HTTP 409 Conflict` on duplicate attempts.<br>• Integer paise financial accounting (`ADR-01`) eliminates floating-point drift. | **`[HARDENED]`** |
| **T6** | **Model Weight Theft (`/public` Scraping)** | Attacker opens Chrome DevTools Network tab and downloads proprietary `model.bin` / `model.json` neural weights. | • Proprietary YOLO11 and LightGBM model weights are hosted strictly behind authenticated server-side API endpoints (`/api/v1/vision/analyze`).<br>• **Zero** `.bin` or `.json` weights exist in the static `/public` directory (`ADR-09`). | **`[HARDENED]`** |
| **T7** | **Precise Farmer Location Leakage** | Scraping farm GPS coordinates allows predatory middlemen to target farmers directly, destroying price bargaining power. | • Public marketplace views display only aggregated cluster/tehsil labels (e.g. *"Baramati Hub, Pune"*).<br>• Farm-gate GPS coordinates are exposed only to the assigned FPO pickup truck driver in the authenticated dispatch manifest. | **`[HARDENED]`** |
| **T8** | **Clickjacking & Cross-Site Scripting (XSS)** | Embedding the application inside malicious iframes or executing injected scripts in regional chat prompts. | • HTTP Security headers configured in `next.config.ts`:<br>&nbsp;&nbsp;- `X-Frame-Options: SAMEORIGIN`<br>&nbsp;&nbsp;- `Content-Security-Policy` with restricted script and frame ancestors.<br>&nbsp;&nbsp;- `X-Content-Type-Options: nosniff`<br>&nbsp;&nbsp;- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` | **`[HARDENED]`** |
| **T9** | **Malicious File Uploads** | Attacker uploads malicious executables or oversized files disguised as crop photos to exploit image parsers. | • Server-side OpenCV decoding verifies valid image headers and pixel buffers.<br>• Discrete Laplacian sharpness and luminance gates reject non-agricultural files.<br>• 10MB maximum request size limit enforced at reverse proxy and API gateways. | **`[HARDENED]`** |
| **T10** | **Audit Trail Modification** | Corrupt operator attempts to alter historical produce weights in the database to pocket price differences. | • Cryptographic SHA-256 hash chaining ($H_i = \text{SHA256}(H_{i-1} \parallel \dots)$).<br>• Any back-door row edit alters the historical hash sequence, causing immediate chain verification failure in the admin audit monitor. | **`[HARDENED]`** |

---

## 2. Authentication & Credential Policy

1. **Password Hashing**: Salted cryptographic password hashing (`pbkdf2_sha256` or `bcrypt`) prevents plaintext credential exposure.
2. **Session Lifetimes**:
   * Access Tokens: Short-lived (60 minutes) signed JWTs.
   * Refresh Tokens: Server-rotated with revocation blacklists.
3. **Cookie Security**: Auth cookies are configured with `HttpOnly`, `Secure`, and `SameSite=Lax`.

---

## 3. Incident Reporting & Security Inquiries

Security vulnerabilities should be reported directly to the development team at `security@krishisetu.agri.org` or via private repository issues.

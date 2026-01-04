Incident response & hardening checklist
======================================

Use these steps when rebuilding the VPS after the xmrig/systemhelper incident. The goal is to restore from a clean base, patch the React/Next vulnerability (CVE-2025-55182 / React2Shell), and prevent reinfection.

1) Quarantine & rebuild
- Keep the old VPS powered off; do not reuse its image.
- Provision a new VPS with the latest OS patches (apt/yum update && upgrade).
- Create a non-root deploy user; disable root SSH login and enforce key-based auth.

2) Rotate every secret
- Replace all API keys (GEMINI_API_KEY*, OPENAI_API_KEY*, Google service account JSON, DB creds, any tokens). Assume exposure.
- Remove old SSH keys/authorized_keys entries; create fresh ones for the deploy user.

3) Clean deployment from source
- Clone this repo fresh; never copy artifacts from the compromised box.
- Run `npm ci` then `npm run build` on the new host only.
- Serve via a process manager (PM2/systemd) under the non-root user; isolate app files to owned directories (e.g., /var/www/balgh-app owned by deploy user).

4) Patch React/Next
- Upgrade Next/React/React-DOM to the latest patched versions that address CVE-2025-55182 (React2Shell). Rebuild after upgrading.
- Remove any unused build artifacts or writable temp dirs inside the web root. Keep `node_modules` and `.next` under user-owned paths only.

5) Lock down the runtime
- Firewall: allow only 80/443 and SSH from trusted IPs; block outbound except needed (egress allowlists for APIs).
- File permissions: no world-writable dirs in the project path; disable uploads to the code tree.
- Cron/systemd hygiene: ensure no rogue jobs or services are present. Only your app service and required timers.
- Logging: enable system/auth logs; rotate with logrotate; forward to a remote log sink if possible.

6) Detection & monitoring
- After deploy, run `npm run security:scan` (added to package.json) to audit packages.
- Add runtime checks: monitor CPU spikes; alert on new binaries appearing under /usr/local/bin or /var/www.
- Periodically `find / -name xmrig -o -name systemhelper 2>/dev/null` and review process lists (`ps aux`) for miners.

7) Integrity validation before going live
- Verify `npm ci` + `npm run build` completes cleanly; no extra binaries in the repo tree.
- Check `.env`/secrets are only readable by the deploy user; never commit them.

8) Post-incident notes
- Keep the old VPS offline for forensic review only (logs, `bash_history`, `auth.log`, web server logs).
- Document IPs/timestamps of suspicious activity; rotate any infrastructure tokens that might be shared (CI/CD, monitoring).

Quick commands (new host)
- sudo apt update && sudo apt upgrade -y   # or distro equivalent
- sudo adduser deploy && sudo usermod -aG sudo deploy
- sudo passwd -l root && sudo sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config && sudo systemctl restart sshd
- su - deploy
- git clone <repo> balgh-app && cd balgh-app
- npm ci && npm run build
- npm run security:scan
- set up systemd/PM2 for `npm run start` behind your reverse proxy with TLS

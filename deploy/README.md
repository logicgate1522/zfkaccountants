# ZFK Accountants production deployment

Source: this Git repository and the `production` branch. Images: private Docker Hub repositories under `abdullahibnasiddiquie`, tagged with the full Git commit SHA. Runtime secrets: `/opt/zfkaccountants/env/` on the VPS. Persistent data: `/opt/zfkaccountants/data/`.

## Services and ports

`docker-compose.prod.yml` creates dedicated PostgreSQL 16, Redis, Django API, tracking worker, and Next.js containers. PostgreSQL and Redis have no host-published ports. Nginx proxies `zfkaccountants.com` to `127.0.0.1:3005` and `api.zfkaccountants.com` to `127.0.0.1:8005`. Uploaded media and collected static files are persistent host mounts.

## Initial setup

The workflow copies and runs `bootstrap-vps.sh` on the first deployment. It creates only `/opt/zfkaccountants`, generates project runtime secrets, and leaves existing env files intact. The workflow authenticates Docker Hub with an isolated `$HOME/.docker-zfkaccountants` config. `init-nginx.sh` installs a temporary HTTP config, obtains a certificate for apex, www, and api with Certbot webroot `/opt/zfkaccountants/acme`, then installs the TLS config. Every Nginx reload follows a successful `nginx -t`.

GitHub repository secrets: `DOCKER_HUB_USERNAME`, `DOCKER_HUB_PAT`, `VPS_HOST`, `VPS_PORT`, `VPS_USER`, `VPS_SSH_KEY`, and `VPS_KNOWN_HOSTS`. `VPS_KNOWN_HOSTS` must be a verified host key for the custom SSH port, not an unchecked scan. Application secrets belong only in VPS runtime env files.

## Releases

Push to `production` or run the workflow manually. The workflow builds changed images, pushes SHA tags, bootstraps project paths when absent, copies configuration, then runs `deploy.sh` under a VPS `flock` lock. The script validates Compose, pulls images, backs up data, runs migrations, installs missing CMS defaults, collects static files, restarts application services, and checks loopback plus public HTTPS health endpoints. A failed migration or seed stops the release. It never runs `down -v` or removes database data.

A push builds only the images whose files changed since the previous push (`github.event.before`), not since the last successful release. If a release fails, a later push that touches only one side can skip images that never shipped. Run the workflow manually (`gh workflow run "Deploy production" --ref production`) to build and deploy everything.

The backend image receives a seed manifest generated from `frontend/scripts/seed-cms.mjs` and `frontend/src/data/` by CI. After migrations, `manage.py seed_site_defaults` installs the site's settings, quote form, page SEO, six articles, five content pages, and a baseline approved tracking plan. The command is transactional and records `_deployment_seed_version` in site settings. Seed v2 also fills an existing empty published quote-form row and repairs only the original incomplete library plan; it leaves drafts and owner-edited plans alone. Later releases leave admin edits and deletions alone; a deliberate content upgrade needs a new seed version or data migration. Frontend blocks already render their source defaults until edited in the CMS. No admin password or API token is needed for production seeding.

`image-tags.previous.env` preserves the prior image references. `rollback.sh` swaps to those tags and checks application health. **Database migrations are not automatically reversed**, so a binary rollback may require a forward fix or a separately planned database restore.

## Backups

`backup.sh` makes a compressed PostgreSQL dump and media archive in `/opt/zfkaccountants/backups`, retaining 14 days. The workflow installs a project-specific daily systemd timer after the first successful release. These backups share the same VPS and therefore do not protect against total server loss; copy them to independent storage as part of a disaster recovery plan.

The workflow also installs a Certbot deploy hook that validates and reloads Nginx only when the `zfkaccountants.com` certificate renews.

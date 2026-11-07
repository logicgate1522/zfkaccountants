# zfkaccountants

ZFK Accountants website and Django content management backend in one repository.

- [`frontend/`](frontend/README.md): Next.js website and CMS editing interface.
- [`backend/`](backend/README.md): Django API, CMS frontend kit, and integration documentation.

## Local development

Start the backend :

```bash
cd backend
python3.12 -m venv venv
./venv/bin/pip install -r requirements.txt
cp .env.example .env
# Configure the values in .env before continuing.
./venv/bin/python manage.py migrate
./venv/bin/python manage.py createsuperuser
./venv/bin/python manage.py runserver 8000
```

In a second terminal, start the frontend (Node.js 20.9+ within Node 20):

```bash
cd frontend
npm ci
cp .env.example .env.local
# Configure the API URL and matching revalidation secret.
npm run dev
```

See the component READMEs for configuration and CMS content seeding.
Local environment files, databases, uploaded media, dependencies, and generated
build output are excluded from Git. Preserve or transfer these separately when
moving an existing installation.

## Repository

Both components are tracked at https://github.com/logicgate1522/zfkaccountants.
Run Git commands from this project root; `backend/` is a regular directory.

## Deployment guides

- [This project's production deployment](deploy/README.md)
- [Reusable autonomous deployment agent prompt](docs/UNIVERSAL_PRODUCTION_DEPLOYMENT_AGENT_PROMPT.md)

# WeCare Deployment Rules & Guidelines

## 🚨 Core Directives
1. **Never commit a new `import` statement without adding the package to `backend/requirements.txt`.**
2. Before pushing to GitHub (which triggers Render automatically), run: `python backend/validate_imports.py`. If it fails, the deployment is blocked.

## Common Deployment Traps

### 1. The `jwt` vs `PyJWT` Collision
* **The Error:** A `ModuleNotFoundError: No module named 'jwt'` on Render.
* **The Cause:** You must import `jwt` in Python code, but the package we install must always be `PyJWT`.
* **The Fix:** Ensure `PyJWT>=2.8.0` is in `requirements.txt`. Never add just `jwt` to the requirements file; it is an obsolete library that breaks the auth layer.

### 2. Password Hashing (bcrypt)
* **The Error:** Cryptography/ffi or libffi errors.
* **The Cause:** `passlib` requires the `bcrypt` standard library to hash passwords securely. Standard `passlib` without the brackets does not install the hash engine.
* **The Fix:** Always specify `passlib[bcrypt]>=1.7.4` in the requirements.

### 3. Render Startup Configuration
* The Render startup command must be set exactly to:
  `uvicorn main:app --host 0.0.0.0 --port $PORT`
* The backend execution environment expects execution within the `backend/` directory, however `sys.path.append` inside `main.py` guarantees backward capability with executions from the repository root.

## Institutional Memory Checklist
- [ ] Did you add the pip install names to `validate_imports.py`'s mapping dictionary?
- [ ] Did you test endpoints with `uvicorn main:app` locally on your port?
- [ ] Are environment variables injected into the Render console? (`JWT_SECRET`, `GEMINI_API_KEY`, `MONGODB_URI`).

_This document ensures continuous stability for the deployment lifecycle of the WeCare API._

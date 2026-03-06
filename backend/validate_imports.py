import os
import sys
import ast
import re

# We map known import names to their PyPI package names
# (e.g., import jwt -> requires PyJWT)
KNOWN_PACKAGE_MAP = {
    "jwt": "PyJWT",
    "passlib": "passlib[bcrypt]",
    "dotenv": "python-dotenv",
    "google": "google-genai",
    "motor": "motor",
    "slowapi": "slowapi",
    "fastapi": "fastapi",
    "pydantic": "pydantic",
    "pymongo": "motor",
    "bson": "motor"
}

def get_stdlib_names():
    if hasattr(sys, 'stdlib_module_names'):
        return sys.stdlib_module_names
    return set()

def get_local_modules(backend_dir):
    return {f[:-3] for f in os.listdir(backend_dir) if f.endswith('.py')} | {"services", "routes", "utils"}

def parse_requirements(filepath):
    required_packages = set()
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            # Strip version specifiers like >=1.0.0
            pkg_name = re.split(r'[=<>~!]', line)[0].strip()
            required_packages.add(pkg_name.lower())
    return required_packages

def find_imports_in_file(filepath):
    imports = set()
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            tree = ast.parse(f.read(), filename=filepath)
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.add(alias.name.split('.')[0])
            elif isinstance(node, ast.ImportFrom):
                if node.module and node.level == 0:
                    imports.add(node.module.split('.')[0])
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
    return imports

def main():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    req_file = os.path.join(backend_dir, "requirements.txt")
    
    if not os.path.exists(req_file):
        print("ERROR: requirements.txt not found.")
        sys.exit(1)

    required_packages = parse_requirements(req_file)
    stdlib_names = get_stdlib_names()
    local_modules = get_local_modules(backend_dir)
    
    all_imports = set()
    for root, _, files in os.walk(backend_dir):
        if "venv" in root or "__pycache__" in root or "tests" in root:
            continue
        for file in files:
            if file.endswith(".py"):
                path = os.path.join(root, file)
                all_imports.update(find_imports_in_file(path))

    # Filter out standard library and local modules
    external_imports = all_imports - stdlib_names - local_modules

    missing_deps = []
    for imp in external_imports:
        # Resolve package name if it differs from import name
        expected_pkg = KNOWN_PACKAGE_MAP.get(imp, imp).lower()
        if expected_pkg not in required_packages:
            # Special case for passlib[bcrypt] which checks passlib in req file
            if "passlib" in expected_pkg and any("passlib" in req for req in required_packages):
                continue
            missing_deps.append((imp, KNOWN_PACKAGE_MAP.get(imp, imp)))

    if missing_deps:
        print("\n[FAIL] DEPLOYMENT BLOCKED: Missing Dependencies Detected!")
        print("The following imports are used in code but not found in requirements.txt:")
        for imp, pkg in missing_deps:
            print(f"  - Import '{imp}' requires package -> {pkg}")
        print("\nPlease update requirements.txt before deploying.")
        sys.exit(1)
    else:
        print("\n[OK] Dependency Audit Passed. All external imports are accounted for.")
        sys.exit(0)

if __name__ == "__main__":
    main()

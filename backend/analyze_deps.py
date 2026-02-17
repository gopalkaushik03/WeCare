import os
import re
import json
from pathlib import Path

# Configuration
ROOT_DIR = Path(r"c:\Users\Lenovo\Desktop\WeCare")
EXTENSIONS = {'.js', '.jsx', '.ts', '.tsx'}

# Regex for imports
# Covers: import x from 'y', import 'y', const x = require('y'), import('y')
IMPORT_RE = re.compile(r"""(?:import\s+(?:[\w\s{},*]+\s+from\s+)?|require\s*\(\s*|import\s*\(\s*)['"]([^'"]+)['"]""")

def resolve_path(import_path, current_file_path):
    """
    Resolves an import path to an absolute file path.
    """
    if import_path.startswith('.'):
        # Relative path
        resolved = (current_file_path.parent / import_path).resolve()
    elif import_path.startswith('@/'):
        # Alias path (mapped to root)
        resolved = (ROOT_DIR / import_path[2:]).resolve()
    else:
        # External dependency or node_module
        return None

    # Try to find the file with extensions
    if resolved.is_file():
        return resolved
    
    for ext in EXTENSIONS:
        candidate = resolved.with_suffix(ext)
        if candidate.is_file():
            return candidate
        # Check for index files
        candidate_index = resolved / f"index{ext}"
        if candidate_index.is_file():
            return candidate_index
            
    return None

def scan_files():
    all_files = set()
    imports_map = {} # target -> {sources}
    
    # directories to explore for source code
    dirs_to_scan = ['app', 'components', 'lib', 'context']
    
    print(f"Scanning directories: {dirs_to_scan}...")

    for d in dirs_to_scan:
        path = ROOT_DIR / d
        if not path.exists():
            continue
            
        for root, _, files in os.walk(path):
            if 'node_modules' in root or 'deprecated' in root:
                continue
                
            for file in files:
                if Path(file).suffix not in EXTENSIONS:
                    continue
                
                full_path = Path(root) / file
                all_files.add(full_path)
                
                try:
                    with open(full_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    matches = IMPORT_RE.findall(content)
                    for imp in matches:
                        resolved = resolve_path(imp, full_path)
                        if resolved:
                            if resolved not in imports_map:
                                imports_map[resolved] = set()
                            imports_map[resolved].add(full_path)
                            
                except Exception as e:
                    print(f"Error reading {full_path}: {e}")

    # Identify Orphans
    # Orphans are files in active dirs (components, lib, context) that are NOT imported
    # EXCEPT for app/ files which are implicitly imported by framework
    
    orphans = []
    active_files = []
    
    for f in all_files:
        is_app = 'app' in f.parts
        is_imported = f in imports_map
        
        if is_imported or is_app:
            active_files.append(f)
        else:
            orphans.append(f)

    # Legacy detection
    legacy_candidates = []
    for root, dirs, files in os.walk(ROOT_DIR):
        root_path = Path(root)
        if root_path == ROOT_DIR:
            for d in dirs:
                if d in ['backend', 'old', 'v1', 'temp', 'deprecated']:
                    legacy_candidates.append(d)
                # check if components/deprecated exists
                if d == 'components':
                    comp_path = ROOT_DIR / 'components'
                    if (comp_path / 'deprecated').exists():
                         legacy_candidates.append('components/deprecated')

    # Output results
    output_data = {
        "active_files": [str(f.relative_to(ROOT_DIR)) for f in sorted(active_files)],
        "active_count": len(active_files),
        "orphans": [str(f.relative_to(ROOT_DIR)) for f in sorted(orphans)],
        "legacy_candidates": sorted(list(set(legacy_candidates)))
    }
    
    with open(ROOT_DIR / 'backend' / 'analysis.json', 'w', encoding='utf-8') as f_out:
        json.dump(output_data, f_out, indent=2)
        
    print("Analysis complete. Written to backend/analysis.json")

if __name__ == "__main__":
    scan_files()

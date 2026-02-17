import sys
import os

# Add backend root to path to allow imports from services, routes, etc.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

"""
backend/verify_db.py

Pre-deployment database verification script for WeCare.

Run this BEFORE deploying to Render / Railway:
    cd backend
    python verify_db.py

Checks:
  1. Environment variables (MONGODB_URI, GEMINI_API_KEY)
  2. MongoDB connection (ping)
  3. All 3 required collections exist
  4. All 7 required indexes are present
  5. Sample insert into mood_entries
  6. Sample query for user history
  7. Cleanup of verification document

Exit code 0 = all good.  Exit code 1 = one or more checks failed.
"""

import asyncio
import os
import sys
from datetime import datetime, timezone

PASS_STR = "[PASS]"
FAIL_STR = "[FAIL]"

_results: list[tuple[str, bool, str]] = []


def record(check: str, passed: bool, detail: str = "") -> None:
    status = PASS_STR if passed else FAIL_STR
    line = f"  {status}  {check}"
    if detail:
        line += f" -- {detail}"
    print(line)
    _results.append((check, passed, detail))


async def main() -> int:
    from dotenv import load_dotenv
    load_dotenv(override=True)

    uri = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI")
    db_name = os.getenv("MONGODB_DB", "wecare")

    print()
    print("=" * 62)
    print("  WeCare -- Database Deployment Readiness Check")
    print("=" * 62)
    print()

    # -----------------------------------------------------------------
    # 1. Environment Variables
    # -----------------------------------------------------------------
    print("[ 1 ] Environment Variables")
    record("MONGODB_URI / MONGO_URI is set", bool(uri))
    record("GEMINI_API_KEY is set", bool(os.getenv("GEMINI_API_KEY")))
    print()

    if not uri:
        print(f"  {FAIL_STR}  Cannot proceed -- MONGODB_URI is not set.")
        print()
        return 1

    # -----------------------------------------------------------------
    # 2. MongoDB Connection
    # -----------------------------------------------------------------
    print("[ 2 ] MongoDB Connection")
    from motor.motor_asyncio import AsyncIOMotorClient
    from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

    client = None
    try:
        client = AsyncIOMotorClient(
            uri,
            serverSelectionTimeoutMS=8_000,
            connectTimeoutMS=8_000,
        )
        await client.admin.command("ping")
        record("Can connect to MongoDB Atlas", True)
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        record("Can connect to MongoDB Atlas", False, str(exc))
        print()
        print(f"  {FAIL_STR}  Connection failed -- aborting.")
        print()
        return 1
    except Exception as exc:
        record("Can connect to MongoDB Atlas", False, str(exc))
        return 1
    print()

    db = client[db_name]

    # -----------------------------------------------------------------
    # 3. Required Collections
    # -----------------------------------------------------------------
    print("[ 3 ] Required Collections")
    required_collections = ["users", "mood_entries", "analysis_logs"]
    existing = await db.list_collection_names()
    for col in required_collections:
        note = "" if col in existing else "will be created on first write"
        record(f"Collection '{col}' is accessible", col in existing, note)
    print()

    # -----------------------------------------------------------------
    # 4. Index Verification
    # -----------------------------------------------------------------
    print("[ 4 ] Index Verification")
    EXPECTED_INDEXES = {
        "users": ["idx_users_email_unique", "idx_users_created_at"],
        "mood_entries": [
            "idx_mood_entries_user_id",
            "idx_mood_entries_created_at",
            "idx_mood_entries_user_created",
        ],
        "analysis_logs": [
            "idx_analysis_logs_user_id",
            "idx_analysis_logs_created_at",
            "idx_analysis_logs_request_id",
        ],
    }

    for col_name, expected_names in EXPECTED_INDEXES.items():
        try:
            index_info = await db[col_name].index_information()
            present = set(index_info.keys())
            for idx_name in expected_names:
                record(
                    f"Index '{col_name}.{idx_name}'",
                    idx_name in present,
                    "" if idx_name in present else "MISSING -- run lifespan init",
                )
        except Exception as exc:
            record(f"Indexes for '{col_name}'", False, str(exc))
    print()

    # -----------------------------------------------------------------
    # 5. Sample Insert into mood_entries
    # -----------------------------------------------------------------
    print("[ 5 ] Sample Insert -> mood_entries")
    sample_doc = {
        "user_id": "__verify_db_script__",
        "mood": "Test mood from verify_db.py",
        "notes": "Pre-deployment verification insert",
        "cognitive_load_score": None,
        "ai_analysis": {"summary": "Verification test"},
        "risk_level": "low",
        "date": datetime.now(timezone.utc).date().isoformat(),
        "created_at": datetime.now(timezone.utc),
        "_verify": True,
    }
    inserted_id = None
    try:
        result = await db["mood_entries"].insert_one(sample_doc)
        inserted_id = str(result.inserted_id)
        record("Insert sample document", True, f"_id={inserted_id}")
    except Exception as exc:
        record("Insert sample document", False, str(exc))
    print()

    # -----------------------------------------------------------------
    # 6. Sample Query -- user history
    # -----------------------------------------------------------------
    print("[ 6 ] Sample Query -> mood_entries (user history)")
    try:
        cursor = db["mood_entries"].find(
            {"user_id": "__verify_db_script__"},
            {"_id": 0, "mood": 1, "date": 1},
        ).sort("created_at", -1).limit(5)
        docs = await cursor.to_list(5)
        record("Query user history", len(docs) > 0, f"{len(docs)} document(s) found")
    except Exception as exc:
        record("Query user history", False, str(exc))
    print()

    # -----------------------------------------------------------------
    # 7. Cleanup
    # -----------------------------------------------------------------
    if inserted_id:
        print("[ 7 ] Cleanup")
        try:
            from bson import ObjectId
            await db["mood_entries"].delete_one({"_id": ObjectId(inserted_id)})
            record("Cleanup verification document", True, f"deleted _id={inserted_id}")
        except Exception as exc:
            record("Cleanup verification document", False, str(exc))
        print()

    # -----------------------------------------------------------------
    # Summary
    # -----------------------------------------------------------------
    client.close()

    total = len(_results)
    passed = sum(1 for _, ok, _ in _results if ok)
    failed = total - passed

    print("=" * 62)
    print(f"  Results: {passed}/{total} checks passed   (failed: {failed})")
    print("=" * 62)
    print()

    if failed == 0:
        print(f"  {PASS_STR}  Database layer is DEPLOYMENT READY.")
        print()
        return 0
    else:
        print(f"  {FAIL_STR}  {failed} check(s) failed. Fix the issues above before deploying.")
        print()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

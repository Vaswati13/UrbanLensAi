import os
import json
import logging
from bson import ObjectId
from app.config import config

logger = logging.getLogger("urbanlens.database")
logging.basicConfig(level=logging.INFO)

# Attempt to import pymongo
try:
    import pymongo
    PYMONGO_AVAILABLE = True
except ImportError:
    PYMONGO_AVAILABLE = False
    logger.warning("pymongo not installed. Falling back to JSON file database.")

class JSONDatabase:
    """Fallback JSON database interface with matching PyMongo CRUD method names"""
    def __init__(self, filepath):
        self.filepath = filepath
        self.data = {
            "users": [],
            "reports": [],
            "settlements": [],
            "infrastructure": [],
            "predictions": [],
            "recommendations": [],
            "analytics": []
        }
        self.load()

    def load(self):
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, "r") as f:
                    content = json.load(f)
                    # Merge loaded keys
                    for key in content:
                        if key in self.data:
                            self.data[key] = content[key]
            except Exception as e:
                logger.error(f"Error loading JSON database: {e}")
                self.save()
        else:
            self.save()

    def save(self):
        try:
            with open(self.filepath, "w") as f:
                json.dump(self.data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error saving JSON database: {e}")

    class Collection:
        def __init__(self, db, name):
            self.db = db
            self.name = name

        def _get_list(self):
            if self.name not in self.db.data:
                self.db.data[self.name] = []
            return self.db.data[self.name]

        def find(self, query=None, limit=None):
            self.db.load()
            query = query or {}
            results = []
            for item in self._get_list():
                match = True
                for k, v in query.items():
                    if k == "_id" and isinstance(v, (dict, str)):
                        # Simple ObjectId or string comparison
                        val = str(v.get("$in")) if isinstance(v, dict) and "$in" in v else str(v)
                        if isinstance(v, dict) and "$in" in v:
                            if str(item.get("_id")) not in [str(x) for x in v["$in"]]:
                                match = False
                                break
                        elif str(item.get("_id")) != val:
                            match = False
                            break
                    elif item.get(k) != v:
                        match = False
                        break
                if match:
                    results.append(item)
            if limit:
                results = results[:limit]
            return results

        def find_one(self, query=None):
            self.db.load()
            query = query or {}
            for item in self._get_list():
                match = True
                for k, v in query.items():
                    if k == "_id":
                        val = str(v.get("$in")) if isinstance(v, dict) and "$in" in v else str(v)
                        if str(item.get("_id")) != val:
                            match = False
                            break
                    elif item.get(k) != v:
                        match = False
                        break
                if match:
                    return item
            return None

        def insert_one(self, document):
            self.db.load()
            if "_id" not in document:
                document["_id"] = str(ObjectId())
            else:
                document["_id"] = str(document["_id"])
            self._get_list().append(document)
            self.db.save()
            return InsertOneResult(document["_id"])

        def update_one(self, query, update):
            self.db.load()
            item = self.find_one(query)
            if not item:
                return UpdateResult(0, 0)
            
            # Simple handle for $set
            modified = 0
            if "$set" in update:
                for k, v in update["$set"].items():
                    item[k] = v
                    modified = 1
            else:
                for k, v in update.items():
                    item[k] = v
                    modified = 1
            if modified:
                self.db.save()
            return UpdateResult(1, modified)

        def delete_one(self, query):
            self.db.load()
            item = self.find_one(query)
            if item:
                self._get_list().remove(item)
                self.db.save()
                return DeleteResult(1)
            return DeleteResult(0)

        def count_documents(self, query=None):
            query = query or {}
            return len(self.find(query))

class InsertOneResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id

class UpdateResult:
    def __init__(self, matched_count, modified_count):
        self.matched_count = matched_count
        self.modified_count = modified_count

class DeleteResult:
    def __init__(self, deleted_count):
        self.deleted_count = deleted_count

class DatabaseClient:
    def __init__(self):
        self.client = None
        self.db = None
        self.use_fallback = True
        
        if PYMONGO_AVAILABLE:
            try:
                # 2-second timeout to avoid long hangs
                self.client = pymongo.MongoClient(config.MONGODB_URI, serverSelectionTimeoutMS=2000)
                # Check connection
                self.client.server_info()
                self.db = self.client[config.DB_NAME]
                self.use_fallback = False
                logger.info("Connected to MongoDB successfully.")
            except Exception as e:
                logger.warning(f"Could not connect to MongoDB: {e}. Using fallback JSON database.")
        
        if self.use_fallback:
            self.db = JSONDatabase(config.FALLBACK_DB_PATH)

    def get_collection(self, name):
        if self.use_fallback:
            return self.db.Collection(self.db, name)
        else:
            return self.db[name]

# Single database instance
db_client = DatabaseClient()

def get_db():
    return db_client

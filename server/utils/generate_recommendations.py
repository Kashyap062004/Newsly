import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import os

# Load .env variables
load_dotenv()
mongo_uri = os.getenv("MONGO_URI")

# Connect to MongoDB Atlas
client = MongoClient(mongo_uri)
db = client["test"]  # <-- Use your actual DB name from Atlas (e.g., "test" or "newsly")
users = db["users"]
activities = db["useractivities"]
# Load user activity data
df = pd.read_csv("user_activity.csv", encoding="utf-8-sig")

# Assign weights to actions
action_weights = {"view": 1, "like": 3, "bookmark": 5}
df["weight"] = df["action"].map(action_weights)

# Build user-item matrix
user_item = df.pivot_table(index="userId", columns="articleUrl", values="weight", aggfunc="sum", fill_value=0)

# Compute similarity between users
similarity = cosine_similarity(user_item)
similarity_df = pd.DataFrame(similarity, index=user_item.index, columns=user_item.index)

# Generate recommendations for each user
recommendations = {}
for user in user_item.index:
    # Find similar users
    similar_users = similarity_df[user].sort_values(ascending=False)[1:6]  # top 5 similar users
    # Articles read/liked/bookmarked by similar users but not by this user
    user_articles = set(user_item.columns[user_item.loc[user] > 0])
    similar_articles = set()
    for sim_user in similar_users.index:
        sim_user_articles = set(user_item.columns[user_item.loc[sim_user] > 0])
        similar_articles.update(sim_user_articles - user_articles)
    # Get top N articles (here, just all found)
    recommendations[user] = list(similar_articles)[:10]

# Update users in MongoDB with recommendations
for user_id, recs in recommendations.items():
    try:
        users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"recommendations": recs}}
        )
    except Exception as e:
        print(f"Failed for {user_id}: {e}")

print("Recommendations updated in MongoDB.")
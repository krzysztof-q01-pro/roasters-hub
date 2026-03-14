#!/usr/bin/env python3
"""
WAT Tool: research_reddit.py
Cel: Scrapowanie postów i komentarzy z kafowych subredditów dla potrzeb researchu person.
Użycie: python tools/research_reddit.py --subreddit Coffee --query "roaster recommendation" --limit 50

Wymagania:
    pip install praw python-dotenv

Konfiguracja .env:
    REDDIT_CLIENT_ID=...
    REDDIT_CLIENT_SECRET=...
    REDDIT_USER_AGENT=roasters-hub-research/1.0

Wyjście: .tmp/reddit_{subreddit}_{query}_{date}.json
"""

import argparse
import json
import os
import re
from datetime import datetime
from pathlib import Path

try:
    import praw
    from dotenv import load_dotenv
except ImportError:
    print("Missing dependencies. Run: pip install praw python-dotenv")
    raise

load_dotenv()

# Subreddity relewantne dla researchu
COFFEE_SUBREDDITS = [
    "Coffee",        # 3.5M+ subscribers — home brewers, general
    "espresso",      # Espresso enthusiasts
    "pourover",      # Filter brewing
    "roasting",      # Roasters (supply side)
    "barista",       # Baristas / café professionals
    "cafe",          # Café owners
]

# Frazy do wyszukiwania per persona
ROASTER_QUERIES = [
    "wholesale customers",
    "cafe clients",
    "marketing roastery",
    "find new customers",
    "roaster visibility",
]

CAFE_QUERIES = [
    "find roaster",
    "new supplier",
    "coffee sourcing",
    "change roaster",
    "recommend roaster",
]

CONSUMER_QUERIES = [
    "recommend roaster",
    "best roaster",
    "where to buy specialty",
    "roaster discovery",
    "coffee subscription",
]


def get_reddit_client() -> praw.Reddit:
    """Inicjalizuje klienta Reddit API z .env credentials."""
    client_id = os.getenv("REDDIT_CLIENT_ID")
    client_secret = os.getenv("REDDIT_CLIENT_SECRET")
    user_agent = os.getenv("REDDIT_USER_AGENT", "roasters-hub-research/1.0")

    if not client_id or not client_secret:
        raise ValueError(
            "Missing REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET in .env\n"
            "Get credentials at: https://www.reddit.com/prefs/apps"
        )

    return praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent=user_agent,
    )


def scrape_subreddit(
    reddit: praw.Reddit,
    subreddit_name: str,
    query: str,
    limit: int = 50,
    min_score: int = 5,
) -> list[dict]:
    """
    Scrapuje posty z subredditu pasujące do zapytania.

    Returns:
        Lista słowników z danymi postu (title, url, score, comments, body, top_comments).
    """
    subreddit = reddit.subreddit(subreddit_name)
    results = []

    print(f"Scraping r/{subreddit_name} for: '{query}' (limit={limit})")

    for post in subreddit.search(query, limit=limit, sort="relevance", time_filter="year"):
        if post.score < min_score:
            continue

        # Pobierz top komentarze (max 10)
        post.comments.replace_more(limit=0)
        top_comments = []
        for comment in post.comments[:10]:
            if hasattr(comment, "body") and len(comment.body) > 20:
                top_comments.append({
                    "text": comment.body[:500],  # Skróć długie komentarze
                    "score": comment.score,
                })

        results.append({
            "title": post.title,
            "url": f"https://reddit.com{post.permalink}",
            "score": post.score,
            "num_comments": post.num_comments,
            "created": datetime.fromtimestamp(post.created_utc).isoformat(),
            "body": post.selftext[:1000] if post.selftext else "",
            "top_comments": sorted(top_comments, key=lambda x: x["score"], reverse=True)[:5],
        })

    return sorted(results, key=lambda x: x["score"], reverse=True)


def extract_pain_points(posts: list[dict]) -> list[str]:
    """
    Heurystycznie wyciąga potencjalne pain points z postów i komentarzy.
    Szuka fraz wyrażających frustrację lub problemy.
    """
    pain_indicators = [
        r"wish (there was|i could|we had)",
        r"frustrated",
        r"impossible to",
        r"so hard to",
        r"no way to",
        r"can't find",
        r"problem with",
        r"annoying",
        r"struggle",
        r"difficult to",
    ]

    pain_points = []
    pattern = re.compile("|".join(pain_indicators), re.IGNORECASE)

    for post in posts:
        all_text = f"{post['title']} {post['body']}"
        for comment in post["top_comments"]:
            all_text += f" {comment['text']}"

        sentences = all_text.replace("\n", " ").split(". ")
        for sentence in sentences:
            if pattern.search(sentence) and len(sentence) > 20:
                pain_points.append(sentence.strip()[:200])

    return list(set(pain_points))[:20]  # Top 20 unique pain points


def save_results(data: dict, subreddit: str, query: str) -> str:
    """Zapisuje wyniki do .tmp/"""
    Path(".tmp").mkdir(exist_ok=True)

    date_str = datetime.now().strftime("%Y%m%d")
    safe_query = re.sub(r"[^a-z0-9]", "_", query.lower())
    filename = f".tmp/reddit_{subreddit}_{safe_query}_{date_str}.json"

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return filename


def main():
    parser = argparse.ArgumentParser(
        description="Scrapuj kafowe subreddity dla researchu person Roasters Hub"
    )
    parser.add_argument(
        "--subreddit",
        default="Coffee",
        choices=COFFEE_SUBREDDITS,
        help="Subreddit do scrapowania",
    )
    parser.add_argument(
        "--query",
        default="find roaster recommendation",
        help="Fraza do wyszukania",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=50,
        help="Maksymalna liczba postów",
    )
    parser.add_argument(
        "--min-score",
        type=int,
        default=5,
        help="Minimalna liczba upvotów",
    )
    parser.add_argument(
        "--persona",
        choices=["roaster", "cafe", "consumer", "all"],
        default="consumer",
        help="Persona do zbadania (uruchamia predefiniowane queries)",
    )

    args = parser.parse_args()

    reddit = get_reddit_client()

    if args.persona == "all":
        # Uruchom wszystkie queries dla wszystkich person
        all_results = {}
        for persona, queries in [
            ("roaster", ROASTER_QUERIES),
            ("cafe", CAFE_QUERIES),
            ("consumer", CONSUMER_QUERIES),
        ]:
            persona_results = []
            for query in queries:
                posts = scrape_subreddit(
                    reddit, args.subreddit, query, args.limit, args.min_score
                )
                persona_results.extend(posts)
            all_results[persona] = {
                "posts": persona_results[:50],  # Top 50 per persona
                "pain_points": extract_pain_points(persona_results),
            }

        output = {
            "subreddit": args.subreddit,
            "scraped_at": datetime.now().isoformat(),
            "results_by_persona": all_results,
        }
        filename = save_results(output, args.subreddit, "all_personas")

    else:
        # Pojedyncze wyszukiwanie
        posts = scrape_subreddit(
            reddit, args.subreddit, args.query, args.limit, args.min_score
        )
        pain_points = extract_pain_points(posts)

        output = {
            "subreddit": args.subreddit,
            "query": args.query,
            "persona": args.persona,
            "scraped_at": datetime.now().isoformat(),
            "total_posts": len(posts),
            "posts": posts,
            "extracted_pain_points": pain_points,
        }
        filename = save_results(output, args.subreddit, args.query)

    print(f"\n✅ Saved {len(output.get('posts', []))} posts to: {filename}")
    if "extracted_pain_points" in output:
        print(f"\n🔍 Top pain points identified:")
        for i, pp in enumerate(output["extracted_pain_points"][:5], 1):
            print(f"  {i}. {pp}")


if __name__ == "__main__":
    main()

import tweepy
import os

bearer_token = ""
client = tweepy.Client(bearer_token)

def get_tweets(link, retreavingTweetCount):
    user_name = link.split('/')[-1]
    user_info = client.get_user(username=user_name)
    user_id = user_info.data.id
    response = client.get_users_tweets(user_id, max_results=retreavingTweetCount, exclude=["retweets", "replies"], tweet_fields="created_at")

    tweets = []
    for tweet in response.data:
        tweets.append(tweet.text)
        tweets.append(tweet.created_at)
    return tweets

print(get_tweets("https://twitter.com/elonmusk", 5))

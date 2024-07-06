import requests

BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAADi9ugEAAAAAGSogK2HaDOMziDBaUkY1dc%2FrZ4A%3DI3wtabpUB3vdVRhaZhVqMNQuDhNFOnQOqo8993WquqbyPmEyWg'

def create_headers(bearer_token):
    headers = {
        "Authorization": f"Bearer {bearer_token}",
    }
    return headers

def get_user_id(username, headers):
    url = f"https://api.twitter.com/2/users/by/username/{username}"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Request returned an error: {response.status_code} {response.text}")

    user_info = response.json()
    return user_info['data']['id']

def get_tweets(user_id, tweet_count, headers):
    url = f"https://api.twitter.com/2/users/{user_id}/tweets"
    params = {
        "max_results": tweet_count,
        "exclude": "retweets,replies",
        "tweet.fields": "created_at",
    }
    response = requests.get(url, headers=headers, params=params)
    if response.status_code != 200:
        raise Exception(f"Request returned an error: {response.status_code} {response.text}")

    tweets_data = response.json()
    tweets = []
    for tweet in tweets_data.get('data', []):
        tweets.append(tweet['text'])
        tweets.append(tweet['created_at'])
    return tweets

def get_tweets_by_link(link, tweet_count):
    user_name = link.split('/')[-1]
    headers = create_headers(BEARER_TOKEN)
    user_id = get_user_id(user_name, headers)
    return get_tweets(user_id, tweet_count, headers)


user_link = "https://twitter.com/elonmusk"
tweets = get_tweets_by_link(user_link, 5)
print(tweets)

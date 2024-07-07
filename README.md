Here is the proofread version:

# Galadriel Agent that fetches tweets and stores them onchain

Copy `.env.example` to `.env` and fill in the variables.

```shell
yarn install
yarn test
yarn deploy
```

Place the address of the deployed contract in `.env`.

To start the Agent, use the following command:
```shell
TWITTER_LOGIN=VitalikButerin yarn start
```

You can check the progress using:
```shell
RUN_ID=0 yarn agent-info
```
where `RUN_ID` is the ID returned by the `yarn start` command.

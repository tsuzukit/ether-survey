# What does project do

This system is let you take survey using ethereum platform and give ERC20 as reward to respondent.
Below are short summaries of the features.

- Respondent can see list of surveys
- Respondent can create a survey (user creating survey becomes owner of survey)
- Respondent can answer survey if it has some token reward left and it is before deadline
- Owner can see details of survey
- Owner can charge survey with ERC20 (At this time, it is specific token called SurveyToken)
- Owner can see answers of survey
- Respondent can retrieve reward ERC20 token after survey deadline
- Owner can retrieve left over ERC20 token after survey deadline

Current limitations which can be improved with further development are

- Performance up (Maybe uses web server to cache data on blockchain)
- Let owner to decide how much token to give to respondent (currently all respondent get 1 token per answer)
- Fancy result analysis page
- As survey respondent, I do not want to pay gas. So I would like to implement something like meta-transaction in the future.

# User story

- As a survey owner, I want to give ERC20 token to survey taker so that many people takes survey as quickly as possible.
- As a survey respondent, I want to get some incentives so that I am encouraged to take survey and finish quiickly.

# System architecture

System consists of 3 contracts, Survey factory, Survey and ERC20 token.

Survey factory is the contract which creates survey contracts and tracks addresses of deployed surveys.
Survey is the contract which has all survey questions and asnwer. It can also holds ERC20 token as a reward. ERC20 should be charged by survey owner.
Reward can be any ERC20 token, but I have created Survey Token for this project for easily test operation of the system.

Below pictures explains how system works for owner and respondent.

### For survey owner

![owner](/imgs/owner.jpeg)

### For survey respondent

![respondent](/imgs/respondent.jpeg)

# Development environment setup

## Setup your environment.

```
// clone repository
git clone git@github.com:tsuzukit/ether-survey.git

// move to repository root folder
$ cd ether-survey

// install tools / libralies
$ npm install -g truffle
$ npm install -g ganache-cli
$ npm install
```

Make sure to install [metamask](https://metamask.io/) to chrome or install [brave browser](https://brave.com/) and enable metamask.

The operation is confirmed with below tools / versions.

```
Truffle: v4.1.13
Ganache CLI v6.1.8
node: v10.7.0
npm: 6.2.0
```

## Bootup your local server

### 1. Start local private ethereum with below command

Move to root directory of this repo and run below command.

```
$ sh shell/start_ganache.sh
```

This will create ethereum network running at `localhost:8545`
Take note of Mnemonic to be logged in with Metamask later.

### 2. Compile and dploy contracts

```
$ truffle migrate
```

### 3. Start surver

```
$ npm run start
```

Finally access to `http://localhost:3000`.
Make sure you are logged in to metamask for local blockchain network.

# How to test

Make sure you have followed above steps and ganache is run. Then run below command at project root directory.

```
$ truffle test
```

# How to use this dApp

For survey owner:

1. Create survey
2. Charge survey
3. Wait until survey is finished which is specified as duration in minutes
4. Retrieve left over ERC20

For survey taker:

1. Look for survey
2. Answer questions
3. Wait until survey is finished
4. Retrieve reward

Below image explains how to do those actions

## When first opens app

![respondent](/imgs/img1.png)

## How to create and charge survey

Press "+" button at index page.

Follow below instructions.

![respondent](/imgs/img2.png)
![respondent](/imgs/img3.png)
![respondent](/imgs/img4.png)

## How to answer survey

First, change your metamask account. You should import account by pasting private key shown in ganache-cli log.
After changing accout, please refresh page and you will find your token balance is 0.

![respondent](/imgs/img5.png)

Then press "Answer" button at index page and answer survey.

![respondent](/imgs/img6.png)

## How to get reward

You need to wait until survey is over.

Once survey time is over, you will see "retreive" button at index page

![respondent](/imgs/img7.png)

## How to see answer

Switch back survey owner account.

Press "detail" button of survey at index page and press "Show answers" button at detail page.

You will see all answers here. (Yes, it should be prettier...)

![respondent](/imgs/img8.png)

# Deploy to test net

Below are deployed contract address at Rinkeby

```
Survey Factory Contract: 0xf7b0ac10200875de011c846f197ff56ff65c52df
Survey Token Contract: 0x82A48Fcb9214A90336b801458729482C6B9e29f7
```

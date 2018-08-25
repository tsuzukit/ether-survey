# Separation of concerns

I have separated survey and survey factory contracts.
I have also made any ERC20 can be used as rewards for answering survey.

In this way, if there is any issue in any of the contracts, damages are minimul.
It is also good design pattern for upgradability as all contracts are loosely coupled.

# Pull over push

I have designed survey contract in the way that it does not "Give" token to respondent, but respondent needs to "Pull" token that they earned. This is to avoid as much external calls as possible.

# Fail early

I have designed contracts in the way that most of validation is handled by modifier.
Moodifiers uses `require` statement at the beginning of theire logic to make sure it fails early as soon as validation fails.
Since it uses `require` statement, it also reverts when something goes wrong.

# Circuit Breaker

I have implemented circuit breaker which only survey maker can activate, just in case the something goes wrong and business needs to stop. Modifier called `stopInEmergency` is used to make sure methods can be stopped when at emeregncy.

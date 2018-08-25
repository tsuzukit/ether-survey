# Logic bugs

To make sure my contract behaves as expected I have implemented automated unit testing.

Other things I have done is to use open zeppelin solidiy package supplied by EPM (Ethereum Package Manager). 
Since those codes are open and used in many other smart contracts, chances of having logic error is small.

# Reentrancy

To avoid reentrancy attack, I have implemented all contracts such that it does not call any of method on `msg.sender` directly.
In this way, there is no worries for any method to be called recursivelly from attacker contract.

I have also used `.transfer` method to send ERC20 token. `.transfer` method has gas limit of 2,300 and it will most likely fails when the method is called recursively.

# Integer Arithmetic Overflow

To avoid integer arithmetic overflow, I have used zeppelin's SafeMath library for any althmetic operation.

# Limit power of contract administrator

Contract administrator has some power over individualy surves contract that they have deployed.
But I have designed the system in the way that there is no centarl administrator for whole system.

Event if there is a flaud in one survey, it does not affect any other surveys created with same factory contract.

The reward ERC20 can also be any ERC20 contract so that one can easily avoid using particular token in the case vulnability is found for the tokens used.

# Gas limits

Contract is designed in a way that `for` loop is not required to be used.
As aresult, no `for` loop is used in any of contracts.

# Tx.origin

`tx.origin` is never used

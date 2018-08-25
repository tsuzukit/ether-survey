var SurveyToken = artifacts.require("./SurveyToken.sol");

contract('SurveyToken', function(accounts) {

  let token;

  // SurveyToken should be succesfully deployed
  it("should be able to deploy SurveyToken", async () => {
    // deploy and get survey factory instance
    token = await SurveyToken.deployed();
    assert.isNotNull(token);
  });

  // creator of token is manager and has 10000 token
  it("should have 10000 token", async () => {
    let balance = await token.balanceOf.call(accounts[0]);
    assert.equal(10000, balance);
  });

  // token can be transfered
  it("can transfer token", async () => {
    await token.transfer(accounts[1], 100, {from: accounts[0]});
    let balance1 = await token.balanceOf.call(accounts[0]);
    let balance2 = await token.balanceOf.call(accounts[1]);
    assert.equal(9900, balance1);
    assert.equal(100, balance2);
  });

  // token has correct name
  it("name is SurveyToken", async () => {
    let name = await token.name.call();
    assert.equal("SurveyToken", name);
  });

  // token has correct symbol
  it("name is SurveyToken", async () => {
    let symbol = await token.symbol.call();
    assert.equal("SVTK", symbol);
  });

});

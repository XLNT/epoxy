import { expect } from 'chai';
import { ethers } from 'hardhat';

import type { Epoxy as EpoxyContract } from '../typechain/Epoxy';

describe('Epoxy', function () {
  let epoxy: EpoxyContract;

  before(async () => {
    const Epoxy = await ethers.getContractFactory('Epoxy');
    epoxy = (await Epoxy.deploy()) as EpoxyContract;
    await epoxy.deployed();
  });

  it('should be deployed correctly', async function () {
    expect(epoxy).to.exist;
  });

  // it("Should return the new greeting once it's changed", async function () {
  //   // expect(await greeter.greet()).to.equal('Hello, world!');
  //   // const setGreetingTx = await greeter.setGreeting('Hola, mundo!');
  //   // // wait until the transaction is mined
  //   // await setGreetingTx.wait();
  //   // expect(await greeter.greet()).to.equal('Hola, mundo!');
  // });
});
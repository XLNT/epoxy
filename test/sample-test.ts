import { expect } from 'chai';
import { ethers } from 'hardhat';

import type { Greeter as GreeterContract } from '../typechain/Greeter';

describe('Greeter', function () {
  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory('Greeter');
    const greeter = (await Greeter.deploy('Hello, world!')) as GreeterContract;
    await greeter.deployed();

    expect(await greeter.greet()).to.equal('Hello, world!');

    const setGreetingTx = await greeter.setGreeting('Hola, mundo!');

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal('Hola, mundo!');
  });
});

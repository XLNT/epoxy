import { expect } from 'chai';
import { ethers } from 'hardhat';

import type { Epoxy as EpoxyContract } from '../typechain/Epoxy';

const URI = 'https://example.com/{id}.json';

describe('Epoxy', function () {
  let epoxy: EpoxyContract;

  before(async () => {
    const Epoxy = await ethers.getContractFactory('Epoxy');
    epoxy = (await Epoxy.deploy(URI)) as EpoxyContract;
    await epoxy.deployed();
  });

  it('should be deployed correctly', async function () {
    expect(epoxy).to.exist;
  });

  it('should support erc1155 interface', async function () {
    expect(await epoxy.supportsInterface('0xd9b67a26')).to.be.true;
  });

  it('should support ERC1155Metadata_URI interface', async function () {
    expect(await epoxy.supportsInterface('0x0e89341c')).to.be.true;
  });

  // it("Should return the new greeting once it's changed", async function () {
  //   // expect(await greeter.greet()).to.equal('Hello, world!');
  //   // const setGreetingTx = await greeter.setGreeting('Hola, mundo!');
  //   // // wait until the transaction is mined
  //   // await setGreetingTx.wait();
  //   // expect(await greeter.greet()).to.equal('Hola, mundo!');
  // });
});

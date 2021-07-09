import { run, ethers } from 'hardhat';

import type { Epoxy as EpoxyContract } from '../typechain/Epoxy';

async function main() {
  await run('compile');

  // We get the contract to deploy
  const Epoxy = await ethers.getContractFactory('Epoxy');
  const epoxy = (await Epoxy.deploy()) as EpoxyContract;

  await epoxy.deployed();

  console.log('Epoxy deployed to:', epoxy.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

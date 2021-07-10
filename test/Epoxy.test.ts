import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

import type { Epoxy as EpoxyContract } from '../typechain/Epoxy';
import type { IERC20 } from '../typechain/IERC20';

const URI = 'https://example.com/{id}.json';
const EMPTY_DATA = ethers.utils.arrayify(0);

interface Ctx {
  sender: SignerWithAddress;
  accounts: SignerWithAddress[];
  currency: IERC20;
  epoxy: EpoxyContract;
}

async function makeEpoxy(): Promise<Ctx> {
  const [sender, ...accounts] = await ethers.getSigners();

  const Currency = await ethers.getContractFactory('ERC20PresetMinterPauser');
  const currency = (await Currency.deploy('Test Currency', 'CURR')) as IERC20;

  const Epoxy = await ethers.getContractFactory('Epoxy');
  const epoxy = (await Epoxy.deploy(URI, currency.address)) as EpoxyContract;
  await epoxy.deployed();

  return {
    sender,
    accounts,
    currency,
    epoxy,
  };
}

async function withEpoxy(run: (ctx: Ctx) => void | Promise<void>) {
  return await run(await makeEpoxy());
}

describe('Epoxy', function () {
  context('smoke tests', () => {
    let epoxy: Ctx['epoxy'];
    before(() => makeEpoxy().then((ctx) => (epoxy = ctx.epoxy)));

    it('should be deployed correctly', async function () {
      expect(epoxy).to.exist;
    });

    it('should support erc1155 interface', async function () {
      expect(await epoxy.supportsInterface('0xd9b67a26')).to.be.true;
    });

    it('should support ERC1155Metadata_URI interface', async function () {
      expect(await epoxy.supportsInterface('0x0e89341c')).to.be.true;
    });
  });

  context('Epoxy::mint', () => {
    context('validation', () => {
      it('should reject uneven uris', async function () {
        await withEpoxy(async ({ epoxy, accounts }) => {
          await expect(
            epoxy.mint(
              [accounts[0].address],
              ['0x1', '0x2'],
              [10, 10],
              [''],
              EMPTY_DATA,
              ethers.constants.AddressZero,
            ),
          ).to.be.revertedWith('InvalidInput');
        });
      });

      it('should reject uneven ids', async function () {
        await withEpoxy(async ({ epoxy, accounts }) => {
          await expect(
            epoxy.mint(
              [accounts[0].address],
              ['0x1'],
              [10, 10],
              [''],
              EMPTY_DATA,
              ethers.constants.AddressZero,
            ),
          ).to.be.revertedWith('ERC1155:');
        });
      });

      it('should reject uneven amounts', async function () {
        await withEpoxy(async ({ epoxy, accounts }) => {
          await expect(
            epoxy.mint(
              [accounts[0].address],
              ['0x1', '0x2'],
              [10],
              ['', ''],
              EMPTY_DATA,
              ethers.constants.AddressZero,
            ),
          ).to.be.revertedWith('ERC1155:');
        });
      });
    });

    context('frozen', () => {
      it('should mint to a group of users', async function () {
        await withEpoxy(async ({ epoxy, accounts }) => {
          const tos = accounts.slice(0, 2).map((a) => a.address);
          const ids = ['0x1', '0x2'];
          const amounts = [10, 10];
          const uris = ['', ''];

          const tx = await epoxy.mint(
            tos,
            ids,
            amounts,
            uris,
            EMPTY_DATA,
            ethers.constants.AddressZero,
          );

          await tx.wait();

          // test epoxy balances
          for (const account of tos) {
            for (const id of ids) {
              expect(await epoxy.balanceOf(account, id)).to.equal(10);
            }
          }
        });
      });
    });
  });
});

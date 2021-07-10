import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

import { Epoxy as EpoxyContract } from '../typechain/Epoxy';
import type { IERC20 } from '../typechain/IERC20';

const BASE_URI = 'https://example.com/{id}.json';
const SPECIFIC_URI = 'https://specific.example.com/{id}.json';
const EMPTY_DATA = ethers.utils.arrayify(0);
const AMOUNT = 10;

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
  const epoxy = (await Epoxy.deploy(BASE_URI, currency.address)) as EpoxyContract;
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

    context('with frozen sets', () => {
      let ctx: Ctx;
      before(() => makeEpoxy().then((_ctx) => (ctx = _ctx)));

      let tos: string[];
      const ids = ['0x1', '0x2'];
      const amounts = [AMOUNT, AMOUNT];
      const uris = ['', ''];

      before(async () => {
        const { accounts, epoxy } = ctx;
        tos = accounts.slice(0, 2).map((a) => a.address);

        await epoxy
          .mint(tos, ids, amounts, uris, EMPTY_DATA, ethers.constants.AddressZero)
          .then((tx) => tx.wait());
      });

      it('updates user balances', async function () {
        for (const account of tos) {
          for (const id of ids) {
            expect(await ctx.epoxy.balanceOf(account, id)).to.equal(AMOUNT);
          }
        }
      });

      it('shows the sets as created', async () => {
        for (const id of ids) {
          expect(await ctx.epoxy.created(id)).to.be.true;
        }
      });

      it('shows the sets as frozen', async () => {
        for (const id of ids) {
          expect(await ctx.epoxy.frozen(id)).to.be.true;
        }
      });

      it('rejects future mints', async () => {
        await expect(
          ctx.epoxy.mint(
            [ctx.accounts[1].address],
            [ids[0]],
            [AMOUNT],
            [''],
            EMPTY_DATA,
            ethers.constants.AddressZero,
          ),
        ).to.be.revertedWith('IsFrozen');
      });

      it('does not allow changing the uri', async () => {
        await expect(
          ctx.epoxy.setURI(
            ids,
            ids.map(() => SPECIFIC_URI),
          ),
        ).to.be.revertedWith('IsFrozen');
      });

      it('does not allow setting a manager', async () => {
        await expect(ctx.epoxy.setManager(ids, ctx.accounts[3].address)).to.be.revertedWith(
          'IsFrozen',
        );
      });

      it('rejects the freeze() method', async () => {
        await expect(ctx.epoxy.freeze(ids)).to.be.revertedWith('IsFrozen');
      });
    });

    context('unfrozen sets', () => {
      let ctx: Ctx;
      before(() => makeEpoxy().then((_ctx) => (ctx = _ctx)));

      let manager: string;
      let tos: string[];
      const ids = ['0x1', '0x2'];
      const amounts = [AMOUNT, AMOUNT];
      const uris = ['', ''];

      before(async () => {
        const { sender, accounts, epoxy } = ctx;
        manager = sender.address;
        tos = accounts.slice(0, 2).map((a) => a.address);

        await epoxy.mint(tos, ids, amounts, uris, EMPTY_DATA, manager).then((tx) => tx.wait());
      });

      it('allows the creation of unfrozen sets', async () => {
        for (const account of tos) {
          for (const id of ids) {
            expect(await ctx.epoxy.balanceOf(account, id)).to.equal(AMOUNT);
          }
        }
      });

      it('shows the sets as created', async () => {
        for (const id of ids) {
          expect(await ctx.epoxy.created(id)).to.be.true;
        }
      });

      it('shows the sets as unfrozen', async () => {
        for (const id of ids) {
          expect(await ctx.epoxy.frozen(id)).to.be.false;
        }
      });

      it('allows the manager to mint additional supply', async () => {
        await ctx.epoxy
          .mint(tos, ids, amounts, uris, EMPTY_DATA, ethers.constants.AddressZero)
          .then((tx) => tx.wait());

        for (const account of tos) {
          for (const id of ids) {
            expect(await ctx.epoxy.balanceOf(account, id)).to.equal(AMOUNT * 2);
          }
        }

        // manager is still the same
        for (const id of ids) {
          expect(await ctx.epoxy.manager(id)).to.equal(manager);
        }
      });

      it('enforces idempotence of manager set on mint', async () => {
        await ctx.epoxy.mint(tos, ids, amounts, uris, EMPTY_DATA, manager).then((tx) => tx.wait());

        // manager is still the same
        for (const id of ids) {
          expect(await ctx.epoxy.manager(id)).to.equal(manager);
        }

        await ctx.epoxy
          .mint(tos, ids, amounts, uris, EMPTY_DATA, ctx.accounts[3].address)
          .then((tx) => tx.wait());

        // manager is still the same
        for (const id of ids) {
          expect(await ctx.epoxy.manager(id)).to.equal(manager);
        }
      });

      it('denys non-managers the ability to mint additional supply', async () => {
        await expect(
          ctx.epoxy
            .connect(ctx.accounts[1])
            .mint(tos, ids, amounts, uris, EMPTY_DATA, ethers.constants.AddressZero),
        ).to.be.revertedWith('IsNotManager');
      });

      it('allows the manager to change the uri of the set', async () => {
        await ctx.epoxy.setURI(ids, [SPECIFIC_URI, SPECIFIC_URI]).then((tx) => tx.wait());

        for (const id of ids) {
          expect(await ctx.epoxy.uri(id)).to.equal(SPECIFIC_URI);
        }
      });

      it('denys non-managers the ability to change the uri of the set', async () => {
        await expect(
          ctx.epoxy.connect(ctx.accounts[1]).setURI([ids[0]], [SPECIFIC_URI]),
        ).to.be.revertedWith('IsNotManager');
      });

      it('Epoxy::setURI rejects invalid input', async () => {
        await expect(ctx.epoxy.setURI(ids, [SPECIFIC_URI])).to.be.revertedWith('InvalidInput');
      });
    });

    context('uris', () => {
      let ctx: Ctx;
      before(() => makeEpoxy().then((_ctx) => (ctx = _ctx)));

      it('should allow the setting of specific uris', async () => {
        const tos = [ctx.accounts[1].address];
        const ids = ['0x1'];
        const amounts = [10];
        const uris = [SPECIFIC_URI];

        await ctx.epoxy
          .mint(tos, ids, amounts, uris, EMPTY_DATA, ethers.constants.AddressZero)
          .then((tx) => tx.wait());

        expect(await ctx.epoxy.uri('0x1')).to.equal(SPECIFIC_URI);
        expect(await ctx.epoxy.uri('0x2')).to.equal(BASE_URI);
      });
    });
  });
});

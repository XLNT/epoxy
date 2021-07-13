# Epoxy

an adhesive method for cultivating cohesive communities

[![Coverage Status](https://coveralls.io/repos/github/XLNT/epoxy/badge.svg?branch=main)](https://coveralls.io/github/XLNT/epoxy?branch=main)

## Litepaper

For a written description of what Epoxy does, check out the [Litepaper](https://www.notion.so/ajadams/Epoxy-Litepaper-755cc79c39104e4d819abf5f05ac7e96).

## Usage & Getting Started

This is a pretty standard hardhat project.

```bash
yarn
yarn hardhat compile
yarn hardhat test
yarn hardhat run scripts/deploy-epoxy.ts
```

## Author Notes

### mint/burn naming

I currently overload the mint/burn vocabulary usually found in protocols, though i may change it to something like print/rip or print/redeem for extra fun.

### the `mint` function

I've decided to optimize the mint function for the journey: "i want to issue a pack of stickers to a list of addresses" (for auctions), which also, by virtue of being a batch function, handles derivative cases like "i want to mint a sticker pack of unfrozen sets to a user" (i.e. for continuous sales).

### OpenZeppelin vs 0xSequence multi-token

I've chosen to use the OpenZeppelin ERC1155 implementation because I'm more familiar with that codebase. The balance packing implemented as part of the 0xSequence contracts might be an ideal improvement for Epoxy V2.

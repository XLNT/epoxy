# epoxy

an adhesive method for cultivating cohesive communities

## Usage & Getting Started

This is a pretty standard hardhat project.

```bash
yarn
yarn hardhat compile
yarn hardhat test
yarn hardhat run scripts/deploy-epoxy.ts
```

## Author Notes

### the `mint` function

I've decided to optimize the mint function for the journey: "i want to issue a pack of stickers to a list of addresses" (for auctions), which also, by virtue of being a batch function, handles derivative cases like "i want to mint a sticker pack of unfrozen sets to a user" (i.e. for continuous sales).

### OpenZeppelin vs 0xSequence multi-token

I've chosen to use the OpenZeppelin ERC1155 implementation because I'm more familiar with that codebase. The balance packing implemented as part of the 0xSequence contracts might be an ideal improvement for Epoxy V2.

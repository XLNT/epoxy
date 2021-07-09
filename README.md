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

## Author Technical Notes

### OpenZeppelin vs 0xSequence multi-token

I've chosen to use the OpenZeppelin ERC1155 implementation because I'm more familiar with that codebase. The balance packing implemented as part of the 0xSequence contracts might be an ideal improvement for Epoxy V2.

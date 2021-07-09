/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Epoxy, EpoxyInterface } from "../Epoxy";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506100596040518060400160405280600c81526020017f436f6e737472756374656421000000000000000000000000000000000000000081525061005e60201b6100091760201c565b6101e1565b6100fa81604051602401610072919061015f565b6040516020818303038152906040527f41304fac000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506100fd60201b60201c565b50565b60008151905060006a636f6e736f6c652e6c6f679050602083016000808483855afa5050505050565b600061013182610181565b61013b818561018c565b935061014b81856020860161019d565b610154816101d0565b840191505092915050565b600060208201905081810360008301526101798184610126565b905092915050565b600081519050919050565b600082825260208201905092915050565b60005b838110156101bb5780820151818401526020810190506101a0565b838111156101ca576000848401525b50505050565b6000601f19601f8301169050919050565b6101bc806101f06000396000f3fe6080604052600080fd5b61009f8160405160240161001d9190610104565b6040516020818303038152906040527f41304fac000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506100a2565b50565b60008151905060006a636f6e736f6c652e6c6f679050602083016000808483855afa5050505050565b60006100d682610126565b6100e08185610131565b93506100f0818560208601610142565b6100f981610175565b840191505092915050565b6000602082019050818103600083015261011e81846100cb565b905092915050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610160578082015181840152602081019050610145565b8381111561016f576000848401525b50505050565b6000601f19601f830116905091905056fea2646970667358221220eaeb1e6646c779eab8b03faadbe3a7b2a4e1d916f1f3eb44bd6e56b5b6864a5764736f6c63430008040033";

export class Epoxy__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Epoxy> {
    return super.deploy(overrides || {}) as Promise<Epoxy>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): Epoxy {
    return super.attach(address) as Epoxy;
  }
  connect(signer: Signer): Epoxy__factory {
    return super.connect(signer) as Epoxy__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): EpoxyInterface {
    return new utils.Interface(_abi) as EpoxyInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Epoxy {
    return new Contract(address, _abi, signerOrProvider) as Epoxy;
  }
}
//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import 'hardhat/console.sol';
import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';

contract Epoxy is ERC1155 {
  // Epoxy allows individual sets to override the standard URI
  mapping(uint256 => string) private _uris;
  // Epoxy allows unfrozen sets to be managed
  mapping(uint256 => address) private _managers;
  // tracks whether a tokenId
  mapping(uint256 => bool) private _created;

  error InvalidInput(string);
  error IsFrozen(uint256 id);
  error IsNotManager(address caller, uint256 id);

  constructor(string memory _baseUri) ERC1155(_baseUri) {}

  // mint an equal amount of stickers per-set to a list of addresses
  function mint(
    address[] memory tos,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) public {
    // for each sticker set...
    for (uint256 i = 0; i < ids.length; i++) {
      uint256 id = ids[i];

      // if the set is frozen, bail
      if (frozen(id)) revert IsFrozen(id);

      if (created(id)) {
        // if the set has already been created, check for manager permission to mint more
        if (_msgSender() != _managers[id]) revert IsNotManager(_msgSender(), id);
      } else {
        // otherwise, mark the set as created
        _created[id] = true;
      }
    }

    // for each address receiving stickers...
    for (uint256 t = 0; t < tos.length; t++) {
      // mint the stickers
      _mintBatch(tos[t], ids, amounts, data);
    }
  }

  // clears the manager for a given set, freezing future mints
  function freeze(uint256[] memory ids) public {
    for (uint256 i = 0; i < ids.length; i++) {
      uint256 id = ids[i];
      if (_msgSender() != _managers[id]) revert IsNotManager(_msgSender(), id);
      _managers[id] = address(0);
    }
  }

  function burn(
    address account,
    uint256[] memory ids,
    uint256[] memory amounts
  ) public {
    require(
      account == _msgSender() || isApprovedForAll(account, _msgSender()),
      'ERC1155: caller is not owner nor approved'
    );

    // TODO: vault behavior

    _burnBatch(account, ids, amounts);
  }

  // managers can change the uri of a set while unfrozen
  function setURI(uint256 id, string memory _newUri) public {
    if (frozen(id)) revert IsFrozen(id);
    if (_msgSender() != _managers[id]) revert IsNotManager(_msgSender(), id);

    _setURI(_newUri);
  }

  // returns the specific uri of a set or the Epoxy base uri
  function uri(uint256 id) public view override returns (string memory) {
    string memory specific = _uris[id];
    if (bytes(specific).length > 0) return specific;
    return super.uri(id);
  }

  function created(uint256 id) public view returns (bool) {
    return _created[id];
  }

  function frozen(uint256 id) public view returns (bool) {
    return created(id) && _managers[id] != address(0);
  }
}

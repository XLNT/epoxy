//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import 'hardhat/console.sol';
import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract Epoxy is ERC1155 {
  // Epoxy allows individual sets to override the standard URI
  mapping(uint256 => string) private _uris;
  // Epoxy allows unfrozen sets to be managed
  mapping(uint256 => address) private _managers;
  // tracks whether a tokenId has been used before
  mapping(uint256 => bool) private _created;

  // the base currency of the Epoxy protocol
  IERC20 public currency;

  error InvalidInput(string);
  error IsFrozen(uint256 id);
  error IsNotManager(address caller, uint256 id);

  constructor(string memory _baseUri, IERC20 _currency) ERC1155(_baseUri) {
    currency = _currency;
  }

  // mint an equal amount of stickers per-set to a list of addresses
  // TODO: make this transfer currency to self
  function mint(
    address[] memory tos,
    uint256[] memory ids,
    uint256[] memory amounts,
    string[] memory uris,
    bytes memory data,
    address _manager
  ) public {
    // _mintBatch will check that ids and amounts are identical, but we also want to check uris length
    if (ids.length != uris.length) revert InvalidInput('Epoxy: ids and uris length mismatch');

    // for each sticker set...
    for (uint256 i = 0; i < ids.length; i++) {
      uint256 id = ids[i];

      // if the set is frozen, bail
      if (frozen(id)) revert IsFrozen(id);

      if (created(id)) {
        // if the set has already been created, check for manager permission to modify it
        if (_msgSender() != _managers[id]) revert IsNotManager(_msgSender(), id);
      } else {
        // otherwise, this block is only executed on the _creation_ of a set

        // mark the set as created
        _created[id] = true;
        // assign manager to the set if provided
        if (_manager != address(0)) {
          _managers[id] = _manager;
        }
      }

      // here, we have permission to modify the set

      // if the arguments provided a uri for this set, use it
      if (bytes(uris[i]).length > 0) {
        _uris[id] = uris[i];
      }
    }

    // for each address receiving stickers...
    for (uint256 t = 0; t < tos.length; t++) {
      // mint the same sticker sets and amounts
      _mintBatch(tos[t], ids, amounts, data);
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

    // TODO: send currency to account

    _burnBatch(account, ids, amounts);
  }

  // clears the manager for a given set, freezing future mints
  function freeze(uint256[] memory ids) public {
    setManager(ids, address(0));
  }

  // sets the manager for a list of ids, given that the sender is the active manager of every set
  function setManager(uint256[] memory ids, address _manager) public {
    for (uint256 i = 0; i < ids.length; i++) {
      uint256 id = ids[i];

      // technically this line is redundant, but clarity over efficiency for now
      if (frozen(id)) revert IsFrozen(id);
      if (_msgSender() != _managers[id]) revert IsNotManager(_msgSender(), id);

      _managers[id] = _manager;
    }
  }

  // managers can change the uri of a set while unfrozen
  function setURI(uint256[] memory ids, string[] memory newUris) public {
    if (ids.length != newUris.length) revert InvalidInput('Epoxy: ids and uris length mismatch');

    for (uint256 i = 0; i < ids.length; i++) {
      uint256 id = ids[i];

      if (frozen(id)) revert IsFrozen(id);
      if (_msgSender() != _managers[id]) revert IsNotManager(_msgSender(), id);

      string memory newUri = newUris[i];
      _uris[id] = newUri;
      emit URI(newUri, id);
    }
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
    return created(id) && _managers[id] == address(0);
  }

  function manager(uint256 id) public view returns (address) {
    return _managers[id];
  }
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SupplyChain {
    enum State {
        Created,
        InTransit,
        Stored,
        Delivered
    }

    struct Product {
        uint256 id;
        string name;
        address currentOwner;
        string origin;
        bool isAuthentic;
        address[] ownershipHistory;
        State state;
        string ipfsHash;
    }

    mapping(uint256 => Product) public products;

    address public contractOwner;
    mapping(address => bool) public isVerifiedFarmer;
    mapping(address => bool) public isAuthorizedEntity;

    event ProductRegistered(
        uint256 productId,
        string name,
        address indexed farmer
    );
    event OwnershipTransferred(
        uint256 productId,
        address indexed from,
        address indexed to
    );
    event StatusUpdated(uint256 productId, State newState, string ipfsData);

    modifier onlyOwner() {
        require(
            msg.sender == contractOwner,
            "SC: Only contract owner can call this function."
        );
        _;
    }

    modifier onlyFarmer() {
        require(
            isVerifiedFarmer[msg.sender],
            "SC: Access denied. Must be a verified Farmer."
        );
        _;
    }

    modifier onlyAuthorized() {
        require(
            isAuthorizedEntity[msg.sender] || isVerifiedFarmer[msg.sender],
            "SC: Access denied. Not authorized."
        );
        _;
    }

    constructor() {
        contractOwner = msg.sender;
    }

    function setFarmerRole(address _user) public onlyOwner {
        isVerifiedFarmer[_user] = true;
        isAuthorizedEntity[_user] = true;
    }

    function setEntityRole(address _user) public onlyOwner {
        isAuthorizedEntity[_user] = true;
    }

    function registerProduct(
        uint256 _id,
        string memory _name,
        string memory _origin,
        string memory _ipfsHash
    ) public onlyFarmer {
        require(products[_id].id == 0, "SC: Product ID already registered.");

        address[] memory initialHistory = new address[](1);
        initialHistory[0] = msg.sender;

        products[_id] = Product({
            id: _id,
            name: _name,
            currentOwner: msg.sender,
            origin: _origin,
            isAuthentic: true,
            ownershipHistory: initialHistory,
            state: State.Created,
            ipfsHash: _ipfsHash
        });

        emit ProductRegistered(_id, _name, msg.sender);
    }

    function transferOwnership(uint256 _id, address _newOwner) public {
        require(
            products[_id].currentOwner == msg.sender,
            "SC: Only current owner can transfer."
        );
        require(products[_id].id != 0, "SC: Product does not exist.");
        require(
            isAuthorizedEntity[_newOwner],
            "SC: Receiver is not authorized."
        );

        address previousOwner = products[_id].currentOwner;

        products[_id].currentOwner = _newOwner;
        products[_id].ownershipHistory.push(_newOwner);

        emit OwnershipTransferred(_id, previousOwner, _newOwner);
    }

    function updateStatus(
        uint256 _id,
        State _newState,
        string memory _ipfsData
    ) public {
        require(
            products[_id].currentOwner == msg.sender,
            "SC: Only current owner can update status."
        );

        products[_id].state = _newState;
        emit StatusUpdated(_id, _newState, _ipfsData);
    }

    function getProduct(
        uint256 _id
    )
        public
        view
        returns (
            uint256 id,
            string memory name,
            address currentOwner,
            string memory origin,
            bool isAuthentic,
            State state,
            string memory ipfsHash
        )
    {
        Product memory p = products[_id];
        return (
            p.id,
            p.name,
            p.currentOwner,
            p.origin,
            p.isAuthentic,
            p.state,
            p.ipfsHash
        );
    }

    function getProductHistory(
        uint256 _id
    ) public view returns (address[] memory) {
        require(products[_id].id != 0, "SC: Product not found.");
        return products[_id].ownershipHistory;
    }

    function verifyProduct(uint256 _id) public view returns (bool) {
        return products[_id].isAuthentic;
    }
}

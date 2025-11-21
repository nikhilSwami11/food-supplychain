// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SupplyChain {
    // 1. Update State Enum to include 'Ordered'
    enum State {
        Created,
        Ordered,
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
        address orderedBy;
    }

    // Array to keep track of all IDs (Required for "View" functions)
    uint256[] public allProductIds;

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
            ipfsHash: _ipfsHash,
            orderedBy: address(0)
        });

        //Save ID to array so we can list it later
        allProductIds.push(_id);

        emit ProductRegistered(_id, _name, msg.sender);
    }

    function getAvailableProducts() public view returns (Product[] memory) {
        uint256 count = 0;

        for (uint256 i = 0; i < allProductIds.length; i++) {
            if (products[allProductIds[i]].state == State.Created) {
                count++;
            }
        }

        Product[] memory availableItems = new Product[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < allProductIds.length; i++) {
            if (products[allProductIds[i]].state == State.Created) {
                availableItems[index] = products[allProductIds[i]];
                index++;
            }
        }

        return availableItems;
    }

    function placeOrder(uint256 _id) public {
        require(products[_id].id != 0, "SC: Product does not exist");
        require(
            products[_id].state == State.Created,
            "SC: Product not available for order"
        );

        products[_id].state = State.Ordered;
        products[_id].orderedBy = msg.sender;
    }

    function getMyOrders() public view returns (Product[] memory) {
        uint256 count = 0;

        for (uint256 i = 0; i < allProductIds.length; i++) {
            Product memory p = products[allProductIds[i]];
            bool isBuyer = (p.orderedBy == msg.sender);
            bool isSellerWithOrder = (p.currentOwner == msg.sender &&
                p.orderedBy != address(0));

            if (isBuyer || isSellerWithOrder) {
                count++;
            }
        }
        Product[] memory result = new Product[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < allProductIds.length; i++) {
            Product memory p = products[allProductIds[i]];

            bool isBuyer = (p.orderedBy == msg.sender);
            bool isSellerWithOrder = (p.currentOwner == msg.sender &&
                p.orderedBy != address(0));

            if (isBuyer || isSellerWithOrder) {
                result[index] = p;
                index++;
            }
        }
        return result;
    }

    function transferOwnership(uint256 _id, address _newOwner) public {
        require(
            products[_id].currentOwner == msg.sender,
            "SC: Only current owner can transfer."
        );
        require(products[_id].id != 0, "SC: Product does not exist.");
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

        // Update the Status
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

    // ========== DISTRIBUTOR FUNCTIONS ==========

    /**
     * Get all products currently owned by the caller (Distributor Inventory)
     * @return Array of products owned by msg.sender
     */
    function getDistributorInventory() public view returns (Product[] memory) {
        uint256 count = 0;

        // Count products I currently own
        for (uint256 i = 0; i < allProductIds.length; i++) {
            if (products[allProductIds[i]].currentOwner == msg.sender) {
                count++;
            }
        }

        Product[] memory inventory = new Product[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < allProductIds.length; i++) {
            if (products[allProductIds[i]].currentOwner == msg.sender) {
                inventory[index] = products[allProductIds[i]];
                index++;
            }
        }

        return inventory;
    }

    /**
     * Get products that need to be delivered (in Stored state)
     * @return Array of products in Stored state owned by msg.sender
     */
    function getDeliveryQueue() public view returns (Product[] memory) {
        uint256 count = 0;

        for (uint256 i = 0; i < allProductIds.length; i++) {
            Product memory p = products[allProductIds[i]];
            if (p.currentOwner == msg.sender && p.state == State.Stored) {
                count++;
            }
        }

        Product[] memory queue = new Product[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < allProductIds.length; i++) {
            Product memory p = products[allProductIds[i]];
            if (p.currentOwner == msg.sender && p.state == State.Stored) {
                queue[index] = p;
                index++;
            }
        }

        return queue;
    }

    /**
     * Get products that have been received but not yet stored (in InTransit state)
     * @return Array of products in InTransit state owned by msg.sender
     */
    function getReceivedProducts() public view returns (Product[] memory) {
        uint256 count = 0;

        for (uint256 i = 0; i < allProductIds.length; i++) {
            Product memory p = products[allProductIds[i]];
            if (p.currentOwner == msg.sender && p.state == State.InTransit) {
                count++;
            }
        }

        Product[] memory received = new Product[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < allProductIds.length; i++) {
            Product memory p = products[allProductIds[i]];
            if (p.currentOwner == msg.sender && p.state == State.InTransit) {
                received[index] = p;
                index++;
            }
        }

        return received;
    }

    /**
     * Get products that have been delivered (in Delivered state and I was the previous owner)
     * @return Array of products in Delivered state that were owned by msg.sender
     */
    function getDeliveryHistory() public view returns (Product[] memory) {
        uint256 count = 0;

        for (uint256 i = 0; i < allProductIds.length; i++) {
            Product memory p = products[allProductIds[i]];
            // Check if product is delivered and I'm in the ownership history
            if (p.state == State.Delivered) {
                for (uint256 j = 0; j < p.ownershipHistory.length; j++) {
                    if (
                        p.ownershipHistory[j] == msg.sender &&
                        p.currentOwner != msg.sender
                    ) {
                        count++;
                        break;
                    }
                }
            }
        }

        Product[] memory history = new Product[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < allProductIds.length; i++) {
            Product memory p = products[allProductIds[i]];
            if (p.state == State.Delivered) {
                for (uint256 j = 0; j < p.ownershipHistory.length; j++) {
                    if (
                        p.ownershipHistory[j] == msg.sender &&
                        p.currentOwner != msg.sender
                    ) {
                        history[index] = p;
                        index++;
                        break;
                    }
                }
            }
        }

        return history;
    }
}

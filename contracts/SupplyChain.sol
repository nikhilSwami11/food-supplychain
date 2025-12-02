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
        address currentOwner;
        address orderedBy;
        State state;
        bool isAuthentic;
        string name;
        string origin;
        string ipfsHash;
    }

    // Array to keep track of all IDs (Required for "View" functions)
    uint256[] public allProductIds;

    mapping(uint256 => Product) public products;

    address public contractOwner;
    mapping(address => bool) public isVerifiedFarmer;
    mapping(address => bool) public isAuthorizedEntity;

    // Optimized lookups
    mapping(address => uint256[]) private _productsByOwner;
    mapping(address => uint256[]) private _ordersByUser;

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
    event StatusUpdated(uint256 productId, State newState, string ipfsData, address actor);

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
        string calldata _name,
        string calldata _origin,
        string calldata _ipfsHash
    ) public onlyFarmer {
        require(products[_id].id == 0, "SC: Product ID already registered.");

        products[_id] = Product({
            id: _id,
            currentOwner: msg.sender,
            orderedBy: address(0),
            state: State.Created,
            isAuthentic: true,
            name: _name,
            origin: _origin,
            ipfsHash: _ipfsHash
        });

        //Save ID to array so we can list it later
        allProductIds.push(_id);
        _productsByOwner[msg.sender].push(_id);

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
        _ordersByUser[msg.sender].push(_id);

        emit StatusUpdated(_id, State.Ordered, "Ordered by Consumer", msg.sender);
    }

    function getMyOrders() public view returns (Product[] memory) {
        uint256[] memory orderIds = _ordersByUser[msg.sender];
        uint256 count = orderIds.length;
        
        // Also include products I'm selling that are ordered
        // This is still O(N) on my products, but better than O(N) on all products
        uint256[] memory myProductIds = _productsByOwner[msg.sender];
        for(uint256 i = 0; i < myProductIds.length; i++) {
             Product memory p = products[myProductIds[i]];
             // Skip if I ordered it (already counted above)
             if (p.currentOwner == msg.sender && p.orderedBy != address(0) && p.orderedBy != msg.sender) {
                 count++;
             }
        }

        Product[] memory result = new Product[](count);
        uint256 index = 0;

        // Add my orders
        for (uint256 i = 0; i < orderIds.length; i++) {
            result[index] = products[orderIds[i]];
            index++;
        }

        // Add my sales
        for (uint256 i = 0; i < myProductIds.length; i++) {
             Product memory p = products[myProductIds[i]];
             // Skip if I ordered it (already added above)
             if (p.currentOwner == msg.sender && p.orderedBy != address(0) && p.orderedBy != msg.sender) {
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
        
        _productsByOwner[_newOwner].push(_id);
        
        emit OwnershipTransferred(_id, previousOwner, _newOwner);
    }

    function updateStatus(
        uint256 _id,
        State _state,
        string calldata _ipfsData
    ) public onlyAuthorized {
        require(products[_id].id != 0, "SC: Product not found.");
        require(
            products[_id].currentOwner == msg.sender,
            "SC: You are not the owner."
        );
        require(
            uint256(_state) > uint256(products[_id].state),
            "SC: Status can only move forward."
        );

        products[_id].state = _state;
        products[_id].ipfsHash = _ipfsData;

        emit StatusUpdated(_id, _state, _ipfsData, msg.sender);
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
            string memory ipfsHash,
            address orderedBy
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
            p.ipfsHash,
            p.orderedBy
        );
    }

    function getProductHistory(
        uint256 _id
    ) public view returns (address[] memory) {
        require(products[_id].id != 0, "SC: Product not found.");
        // History is no longer stored on-chain. 
        // Frontend should query 'OwnershipTransferred' events.
        return new address[](0);
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
        uint256[] memory myProductIds = _productsByOwner[msg.sender];
        uint256 count = 0;

        // Count products I currently own
        for (uint256 i = 0; i < myProductIds.length; i++) {
            if (products[myProductIds[i]].currentOwner == msg.sender) {
                count++;
            }
        }

        Product[] memory inventory = new Product[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < myProductIds.length; i++) {
            if (products[myProductIds[i]].currentOwner == msg.sender) {
                inventory[index] = products[myProductIds[i]];
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
        uint256[] memory myProductIds = _productsByOwner[msg.sender];
        uint256 count = 0;

        for (uint256 i = 0; i < myProductIds.length; i++) {
            Product memory p = products[myProductIds[i]];
            if (p.currentOwner == msg.sender && p.state == State.Stored) {
                count++;
            }
        }

        Product[] memory queue = new Product[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < myProductIds.length; i++) {
            Product memory p = products[myProductIds[i]];
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
        uint256[] memory myProductIds = _productsByOwner[msg.sender];
        uint256 count = 0;

        for (uint256 i = 0; i < myProductIds.length; i++) {
            Product memory p = products[myProductIds[i]];
            if (p.currentOwner == msg.sender && p.state == State.InTransit) {
                count++;
            }
        }

        Product[] memory received = new Product[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < myProductIds.length; i++) {
            Product memory p = products[myProductIds[i]];
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
        // This function is tricky because we need to find products I *used* to own that are now Delivered.
        // With _productsByOwner, we have a list of all products I ever touched.
        
        uint256[] memory myProductIds = _productsByOwner[msg.sender];
        uint256 count = 0;

        for (uint256 i = 0; i < myProductIds.length; i++) {
            Product memory p = products[myProductIds[i]];
            // Check if product is delivered and I am NOT the current owner (meaning I passed it on)
            if (p.state == State.Delivered && p.currentOwner != msg.sender) {
                 count++;
            }
        }

        Product[] memory history = new Product[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < myProductIds.length; i++) {
            Product memory p = products[myProductIds[i]];
             if (p.state == State.Delivered && p.currentOwner != msg.sender) {
                history[index] = p;
                index++;
            }
        }

        return history;
    }
}

pragma solidity >=0.4.22 <0.9.0;
{  
    struct Product {
        uint256 id;
        string name;
        address currentOwner;       // Tracks the entity currently possessing the product
        string origin;
        bool isAuthentic;         
        address[] ownershipHistory; // Logs the complete sequence of owners/locations
    }
    
    // Main storage for products
    mapping(uint256 => Product) public products;
    
    address public contractOwner;
    mapping(address => bool) public isVerifiedFarmer;

    event ProductRegistered(uint256 productId, string name, address indexed farmer);
    event OwnershipTransferred(uint256 productId, address indexed from, address indexed to);
 
    
    modifier onlyOwner() {
        require(msg.sender == contractOwner, "SC: Only contract owner can call this function.");
        _;
    }

    // Restricts access to verified farmers/manufacturers
    modifier onlyFarmer() {
        require(isVerifiedFarmer[msg.sender], "SC: Access denied. Must be a verified Farmer.");
        _;
    }
    

    constructor() {
        contractOwner = msg.sender;
    }
    
    // core Functions: Access Control (Admin)
    
    // Admin function to grant the 'Verified Farmer' role
    function setFarmerRole(address _user) public onlyOwner {
        isVerifiedFarmer[_user] = true;
    }

    //Traceability & Trading Module
    
    // Registers a new product, setting the origin and initial ownership
    function registerProduct(uint256 _id, string memory _name, string memory _origin) public onlyFarmer {
        require(products[_id].id == 0, "SC: Product ID already registered."); 
        
        Product memory newProduct = Product({
            id: _id,
            name: _name,
            currentOwner: msg.sender,
            origin: _origin,
            isAuthentic: true,
            ownershipHistory: new address[](0) 
        });
        
        products[_id] = newProduct;
        products[_id].ownershipHistory.push(msg.sender); 
        
        emit ProductRegistered(_id, _name, msg.sender);
    }

    // Transfers ownership from the current holder to a new stakeholder
    function transferOwnership(uint256 _id, address _newOwner) public {
        require(products[_id].currentOwner == msg.sender, "SC: Only current owner can transfer.");
        require(products[_id].id != 0, "SC: Product does not exist."); 
        
        address previousOwner = products[_id].currentOwner;
        
        products[_id].currentOwner = _newOwner;
        products[_id].ownershipHistory.push(_newOwner); 
        
        emit OwnershipTransferred(_id, previousOwner, _newOwner);
    }
    

    // Retrieves complete product details
    function getProduct(uint256 _id) public view returns (Product memory) {
        return products[_id];
    }
    
    // Retrieves the historical trace of ownership (for traceability)
    function getProductHistory(uint256 _id) public view returns (address[] memory) {
        require(products[_id].id != 0, "SC: Product not found.");
        return products[_id].ownershipHistory;
    }

    // Checks the authenticity flag of a product
    function verifyProduct(uint256 _id) public view returns (bool) {
        return products[_id].isAuthentic;
    }
}

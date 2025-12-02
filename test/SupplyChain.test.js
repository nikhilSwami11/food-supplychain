const SupplyChain = artifacts.require("SupplyChain");

contract("SupplyChain", (accounts) => {
    const [owner, farmer, distributor, consumer] = accounts;
    const productId = 1;
    const productName = "Apple";
    const origin = "Farm A";
    const ipfsHash = "QmHash";

    let instance;

    before(async () => {
        instance = await SupplyChain.deployed();
        // Setup roles
        await instance.setFarmerRole(farmer, { from: owner });
        await instance.setEntityRole(distributor, { from: owner });
    });

    it("should register a product", async () => {
        const result = await instance.registerProduct(
            productId,
            productName,
            origin,
            ipfsHash,
            { from: farmer }
        );

        const product = await instance.products(productId);
        assert.equal(product.currentOwner, farmer, "Owner should be farmer");
        assert.equal(product.name, productName, "Name should match");
        assert.equal(product.state.toString(), "0", "State should be Created");

        // Check event
        const log = result.logs[0];
        assert.equal(log.event, "ProductRegistered", "Event should be ProductRegistered");
        assert.equal(log.args.productId.toString(), productId.toString(), "ID should match");
    });

    it("should transfer ownership", async () => {
        const result = await instance.transferOwnership(productId, distributor, { from: farmer });

        const product = await instance.products(productId);
        assert.equal(product.currentOwner, distributor, "Owner should be distributor");

        // Check event
        const log = result.logs[0];
        assert.equal(log.event, "OwnershipTransferred", "Event should be OwnershipTransferred");
        assert.equal(log.args.from, farmer, "From should be farmer");
        assert.equal(log.args.to, distributor, "To should be distributor");
    });

    it("should not return history from contract anymore", async () => {
        const history = await instance.getProductHistory(productId);
        assert.equal(history.length, 0, "History should be empty on-chain");
    });

    it("should place an order", async () => {
        // Register another product for ordering
        const orderId = 2;
        await instance.registerProduct(orderId, "Banana", "Farm B", "QmHash2", { from: farmer });

        await instance.placeOrder(orderId, { from: consumer });

        const product = await instance.products(orderId);
        assert.equal(product.orderedBy, consumer, "OrderedBy should be consumer");
        assert.equal(product.state.toString(), "1", "State should be Ordered");
    });
});

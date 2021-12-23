## Avoiding Common Attacks

### Guarding Solidity Risk(s):
) SWC-134: Using '.call' instead of '.transfer' or '.send()' to send Ether in the purchaseNft function. Avoid potential problems w/ set fixed gas amounts.

) Use 'require' to ensure:
- List price of an item is greater than zero
- Amount of Ether sent when purchasing an item is equal to the item's list price
- Checks that the item is listed ForSale before allowing it to be purchased
- Checks that item purchaser is NOT the current item Owner

### Guarding Against Smart Contract Risk(s):
) SWC 107: Use nonReentrant modifier along with the OpenZepplin ReentrancyGuard contract to protect the purchaseNft function from reentrancy attack.
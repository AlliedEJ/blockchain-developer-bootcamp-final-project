# Blockchain Developer Bootcamp Final Project
## NFT Creation Station
An Ethereum based dapp that allows users to create & sell their own unique ERC-721 NFTs.

## Live Deployment (AWS EC2 Instance)
http://3.134.160.201:3000/

## Demo Screencast
**Link Here**

## Directory Structure
- ```client```: Project's full front end including all of its javascript, html, img, and css elements.
- ```server```: Projects backend including its 'server.js' and json file directory.
- ```blockchain```: Projects smart contracts including ABI components, migrations, and tests.

## Running the Project Locally
### Prerequisites
- Node.js >= v14.0
- Npm >= v7.0
- Truffle
- Metamask Wallet (integrated w/ compatible browser)

### Local Setup & Testing
1. Clone the repo onto your machine
```
git clone https://github.com/AlliedEJ/blockchain-developer-bootcamp-final-project.git
```
2. Install the Project's dependencies via Npm
```
cd ./server
npm install
cd ./blockchain
npm install
```

3. Check that the contracts Compile
```
cd ./blockchain
truffle compile
```

4. Check that the contracts pass all Tests
```
cd ./blockchain
truffle test
```
  *TruffleConfig is setup for 'local' on port 8545*


5. Start the application on localhost
```
./server
node server.js
```
  *Application will default to port 3000*

  *When application is running on localhost, json URIs will be minted to localhost and only be viewable via localhost.*

## Deploy on Testnet (Rinkeby)
1. Create environmental variables for deployment
 - Create ```.env``` file under the ./blockchain folder
 - Define your Infura endpoint and your metamask wallet mnemonic for contract creation:
```
INFURA_ACCESS_TOKEN=
ETH_MNEMONIC=
```

2. Deploy contracts to Rinkeby:
```
truffle migrate --network rinkeby
```
*New contract addresses will appear in the console output*

3. Add new contract addresses to the corresponding js files in the ./client folder
 - Change the ```mintAddress``` const to the new NftCreator contract address in the following files: ```dapp_creator.js``` & ```dapp_market.js```

 - Change the ```marketAddress``` const to the new Market contract address in the following files: ```dapp_creator.js``` & ```dapp_market.js```

4. Run the front end on localhost (as above)
 - The local application will now be communicating with the newly deployed contract(s).

## Public Wallet Address for Cert
0x74e8a76D88a28302E8d407599558E7cE38B7376e

## Features
1. Creation

Users are able to utilize the platform to create unique NFTs (721) based on any linked image. Nft's will be created with the following metadata: Name, Image Link, & Description. All Nft create an associated json that is stored directly on the server.

2. Portfolio

All created Nfts go to the user's personal portfolio where they can view them and set them up for sale on the Marketplace.

3. Sell

Users are able to assign a price to their created Nfts and sell them on the Marketplace. 

4. Buy

Users can buy listed Nfts from the Marketplace and subsequently view them in their personal Portfolios.

## TODO Features
- 'Relist' function allowing users to relist items to the Market
- 'Delist' function allowing users to remove items from the Market
- Incorporate IPFS for JSON storage
- Allow users to upload images directly

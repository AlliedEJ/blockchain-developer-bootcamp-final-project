# Blockchain Developer Bootcamp Final Project
## NFT Creation Station
An Ethereum based dapp that allows users to create & sell their own unique ERC-721 NFTs.

## Live Deployment (AWS EC2 Instance)
http://3.134.160.201:3000/

## Demo Screencast
**Link Here**

## Directory Structure
- ```client```: Project's full front end including all of its javascript, html, img, and css elements.
- ```server```: Projects backend server including its 'server.js' and json file directory.
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
2. Install the Project's dependencsies via Npm
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

  *When application is running on localhost, json URIs will be minted to localhost and only be viewable via localhost*

## Deploy on Testnet
**Process Here**

## Public Wallet Address for Cert
0x74e8a76D88a28302E8d407599558E7cE38B7376e

## Features

Users will be able to utilize the platform to create NFTs (721).

The platform will generate a Token URI and associated JSON based on user input.

Users will be able to display their NFTs directly in their 'Portfolio' based on their connected MetaMask account.

## TODO Features
- 'Relist' function allowing users to relist items on the Market
- 'Delist' function allowing users to remove items from the Market
- Incorporate IPFS for JSON storage


//TO DO:
// 1) Detect MetaMask and allow user to connect to MetaMask
// 2) Put mint function together so user can mint NFTs
// -Need to generate a tokenURI for input into the mint function
// -Need to put together correctly formatted JSON
// --- Search - "save the inputs of a form as JSON using javascript"
// --- Search - "how to use require in the browser"
// -JSON needs to be auto placed at a hosting provider
// -URI needs to directly link to hosted JSON
// 3) Pull created JSONs so they display in the Portfolio Section
// --First check '_balance' to see if address has any NFTS (if it does move forward)
// --tokenIDs is a incremented number perform a loop based on the total tokenID
// --Run '_ownerOf' to see which tokenID the address owns
// --Run tokenURI against the owned tokens to get URI access JSON and display accordingly
// 4) Display NFTs in portfolio section use PetShop as guide
// 5) Cleanup UI & Backend Code 
// --add mintABI as a JSON GET
// 6) Add NFT metadata on chain as a struct (see Supply Chain contract)
// 7) Identify tests and modifiers to meet submission standards
// **8) Spin up web server & deploy on Rinkeby

//Contract Details
const mintAddress = "0x98AD0cFC3781FbaF063747a459FC8ff69d4F701a";
window.addEventListener('load', async () =>{
  await $.getJSON("../blockchain/build/contracts/NftCreator.json", function(data){
    mintABI = data.abi;
  });
});

//Detect and Connect MetaMask
window.addEventListener('load', function (){
    if(typeof window.ethereum !== "undefined"){
        console.log("window.ethereum has been detected");
        if(window.ethereum.isMetaMask === true){
            console.log("MetMask is active")
            document.querySelector("#mm-msg").innerHTML = "MetaMask Has Been Detected. Please connect your MetaMask Account.";
        } else {
            console.log("MetaMask has not been detected");
            document.querySelector("#mm-msg").innerHTML = "MetaMask has not been detected. Please install MetaMask for your browser: <a href='https://metamask.io/' target='_blank'>MetaMask</a>";
        }
    } else {
        console.log("window.ethereum has not been detected")
        document.querySelector("#mm-msg").innerHTML = "MetaMask has not been detected. Please install MetaMask for your browser: <a href='https://metamask.io/' target='_blank'>MetaMask</a>";

    }
});

var metaMaskConnect = document.querySelector("#connect-meta");
metaMaskConnect.onclick = async () => {
    await ethereum.request({method: 'eth_requestAccounts'});
    console.log("MetaMask is connected")
    var metaMaskAccount = document.querySelector("#mm-msg");
    metaMaskAccount.innerHTML = "MetaMask successfully connected. </br> This is your current address: " + ethereum.selectedAddress;
    document.querySelector("#nft-create").style.display = "block"
    document.querySelector("#nft-portfolio").style.display = "block"
};

//POST JSON File
$("#meta-form").submit(function (e){
    e.preventDefault();
    var tokenName = $("#nft-name").val();
    var tokenImage = $("#nft-image").val();
    var tokenDescription = $("#nft-description").val();
    var today = new Date();
    var time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
    var filepath ="json/" + tokenName + "-" + time + ".json";
    uniqueURI = "http://127.0.0.1:5500/server/" + filepath;
    console.log(uniqueURI)
    $.ajax({
        type: "POST",
        url: "http://localhost:4000/json",
        data: {
            "name": tokenName,
            "image": tokenImage,
            "description": tokenDescription,
            "filepath": filepath 
        },
        success: function(){},
    });
    document.querySelector("#nft-mint").style.display = "inline";
});

//Contract Interactions
//Mint NFT
var contractMint = document.querySelector("#nft-mint");
contractMint.onclick = async() => {
    var web3 = new Web3(window.ethereum);
    var NftCreator = new web3.eth.Contract(mintABI, mintAddress);
    NftCreator.setProvider(window.ethereum);
    await NftCreator.methods.createNFT(uniqueURI).send({from: ethereum.selectedAddress});
    document.querySelector("#nft-mint").style.display = "none";
  };

//Refresh Portfolio
currentURILength = 0;
var portfolioRefresh = document.querySelector("#nft-refresh");
portfolioRefresh.onclick = async() => {
  var web3 = new Web3(window.ethereum);
  var NftCreator = new web3.eth.Contract(mintABI, mintAddress);
  NftCreator.setProvider(window.ethereum);
  var ethAddress = ethereum.selectedAddress
  var tokenBalance = await NftCreator.methods.balanceOf(ethAddress).call();
  if(tokenBalance == 0){
    document.querySelector("#portfolio-msg").style.display = "block";
  } else {
    document.querySelector("#portfolio-msg").style.display = "none";
    console.log("You have " + tokenBalance + " NFTs associated with this address: " + ethAddress);
    
    // Call for Owned Token IDs
    var ownedTokens = [];
    var tokenTotal = await NftCreator.methods.tokenCount().call()
    console.log("This is how many tokens the contract has minted " + tokenTotal)
    for(var i = 1; i <= tokenTotal; i++){
      var tokenOwner = await NftCreator.methods.ownerOf(i).call()
      if (ethAddress.toLowerCase() == tokenOwner.toLowerCase()){
        ownedTokens.push(i);
      }
    };
    console.log(ownedTokens);
    
    // Call for Owned Token URIs
    var arrayLength = ownedTokens.length;
    var ownedURI = [];
    for(var i = 0; i < arrayLength; i++){
      var token = ownedTokens[i];
      var tokenURI = await NftCreator.methods.tokenURI(token).call()
      ownedURI.push(tokenURI)
    };
    console.log(ownedURI);
    console.log(ownedURI.length + " ownedURI length");
    console.log(currentURILength + " currentURI length");
    
    // Populate Token URI data on Front End
    var difference = ownedURI.length - currentURILength;
    for (var i = ownedURI.length - difference; i < ownedURI.length; i++){
      $.getJSON(ownedURI[i], function(data) {
        var nftsRow = $('#nftsRow');
        var nftTemplate = $('#nftTemplate');

        nftTemplate.find('.card-title').text(data.name);
        nftTemplate.find('img').attr('src', data.image);
        nftTemplate.find('.nft-description').text(data.description);
        // nftTemplate.find('.btn-nft').attr('data-id', data[i].id);

        nftsRow.append(nftTemplate.html());
      }); 
    };
    currentURILength = currentURILength + difference;
  };
};

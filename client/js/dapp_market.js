//Contract Details
const mintAddress = "0x2ea68e1e966db4Bae10ea1809361C7cE9380c3c5";
window.addEventListener('load', async () =>{
  await $.getJSON("../blockchain/build/contracts/NftCreator.json", function(data){
    mintABI = data.abi;
  });
});
const marketAddress = "0x98AD0cFC3781FbaF063747a459FC8ff69d4F701a";
window.addEventListener('load', async () =>{
  await $.getJSON("../blockchain/build/contracts/Market.json", function(data){
    marketABI = data.abi;
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
};

var currentURILength = 0;
var marketRefresh = document.querySelector("#market-refresh");
marketRefresh.onclick = async (e) =>{
    console.log(e)
    var web3 = new Web3(window.ethereum);
    var NftCreator = new web3.eth.Contract(mintABI, mintAddress);
    NftCreator.setProvider(window.ethereum);
    var ethAddress = marketAddress;
    var tokenBalance = await NftCreator.methods.balanceOf(ethAddress).call();
    if(tokenBalance == 0){
      document.querySelector("#market-msg").style.display = "block";
    } else {
      document.querySelector("#market-msg").style.display = "none";
      console.log("There are " + tokenBalance + " NFTs associated with this address: " + ethAddress);
      
      // Call for Owned Token IDs
      var ownedTokens = [];
      var tokenTotal = await NftCreator.methods.tokenCount().call()
      for(var i = 1; i <= tokenTotal; i++){
        var tokenOwner = await NftCreator.methods.ownerOf(i).call()
        if (ethAddress.toLowerCase() == tokenOwner.toLowerCase()){
          ownedTokens.push(i);
        }
      };
      console.log(ownedTokens + " Token IDs");
      
      // Call for Owned Token URIs
      var ownedURI = [];
      for(var i = 0; i < ownedTokens.length; i++){
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
        await $.getJSON(ownedURI[i], function(data) {
          var nftsRow = $('#nftsRow');
          var nftTemplate = $('#nftTemplate');
  
          nftTemplate.find('.card-title').text(data.name);
          nftTemplate.find('img').attr('src', data.image);
          nftTemplate.find('.nft-description').text(data.description);        
          
          nftsRow.append(nftTemplate.html());
        });
      };
      currentURILength = currentURILength + difference;
    };
    
    //Add Purchase Data
    var Market = new web3.eth.Contract(marketABI, marketAddress);
    Market.setProvider(window.ethereum);
    var currentItems = await Market.methods.getListedItems().call()
    var priceHolder = $(".nft-price")
    for(var i = 0; i < priceHolder.length-1; i++){
        if(ownedTokens[i] == currentItems[i][1]){
            priceHolder[i].innerHTML = currentItems[i][5];
        }
    }
    var buttonArray = $(".btn-nft")
    for (var i = 0; i < buttonArray.length-1; i++){
        buttonArray.eq(i).attr("data-id", currentItems[i][2]);
    }

    //Purchase NFT
    for (var i = 0; i < buttonArray.length; i++) {
        buttonArray[i].addEventListener('click', async (button) =>{
          var itemDataId = button.target.getAttribute('data-id');
          await Market.methods.purchaseNft(mintAddress, itemDataId).send({from: ethereum.selectedAddress, value: 1});
        });
      }

    console.log(ethereum.selectedAddress);
    console.log(currentItems);
    console.log(currentItems[0][5]);
};


// async function tokenBalance (address){
//     var web3 = new Web3(window.ethereum);
//     var NftCreator = new web3.eth.Contract(mintABI, mintAddress);
//     NftCreator.setProvider(window.ethereum);
//     var ethAddress = address;
//     var tokenBalance = await NftCreator.methods.balanceOf(ethAddress).call();
//     return tokenBalance;
// }

//   if(tokenBalance == 0){
//     document.querySelector("#portfolio-msg").style.display = "block";
//   } else {
//     document.querySelector("#portfolio-msg").style.display = "none";
//     console.log("You have " + tokenBalance + " NFTs associated with this address: " + ethAddress);

// async function ownedTokens(address){
//     var ownedTokens = [];
//     var tokenTotal = await NftCreator.methods.tokenCount().call()
//     console.log("This is how many tokens the contract has minted " + tokenTotal)
//     for(var i = 1; i <= tokenTotal; i++){
//       var tokenOwner = await NftCreator.methods.ownerOf(i).call()
//       if (address.toLowerCase() == tokenOwner.toLowerCase()){
//         ownedTokens.push(i);
//       }
//     };
//     return ownedTokens;
// }
//     // Call for Owned Token IDs

//     console.log(ownedTokens + " Token IDs");
    
//     // Call for Owned Token URIs
//     var ownedURI = [];
//     for(var i = 0; i < ownedTokens.length; i++){
//       var token = ownedTokens[i];
//       var tokenURI = await NftCreator.methods.tokenURI(token).call()
//       ownedURI.push(tokenURI)
//     };
//     console.log(ownedURI);
//     console.log(ownedURI.length + " ownedURI length");
//     console.log(currentURILength + " currentURI length");
    
//     // Populate Token URI data on Front End
//     var difference = ownedURI.length - currentURILength;
//     for (var i = ownedURI.length - difference; i < ownedURI.length; i++){
//       await $.getJSON(ownedURI[i], function(data) {
//         var nftsRow = $('#nftsRow');
//         var nftTemplate = $('#nftTemplate');

//         nftTemplate.find('.card-title').text(data.name);
//         nftTemplate.find('img').attr('src', data.image);
//         nftTemplate.find('.nft-description').text(data.description);        
        
//         nftsRow.append(nftTemplate.html());
//       });
//     };
//     currentURILength = currentURILength + difference;
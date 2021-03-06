//Contract Details
const mintAddress = "0x083EeC77fFd57632B12a4663B58d4aC7E130A39f";
window.addEventListener('load', async () =>{
  await $.getJSON("staticBuild/NftCreator.json", function(data){
    mintABI = data.abi;
  });
});
const marketAddress = "0x8C791a287389c48AFF087F93c3b8E4D83D06FAf8";
window.addEventListener('load', async () =>{
  await $.getJSON("staticBuild/Market.json", function(data){
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

  };
});

var metaMaskConnect = document.querySelector("#connect-meta");
metaMaskConnect.onclick = async () => {
  await ethereum.request({method: 'eth_requestAccounts'});
  console.log("MetaMask is connected")
  var metaMaskAccount = document.querySelector("#mm-msg");
  metaMaskAccount.innerHTML = "MetaMask successfully connected. </br> This is your current address: " + ethereum.selectedAddress;
};

//Contract Interactions
//Refresh Market Listings
var marketRefresh = document.querySelector("#market-refresh");
marketRefresh.onclick = async () =>{
  
  //Remove old Card Listings
  var rowParent = document.querySelector("#nftsRow");
  if (rowParent.firstChild){
    while (rowParent.firstChild) {
      rowParent.removeChild(rowParent.firstChild);
    }
  }
  var web3 = new Web3(window.ethereum);
  var NftCreator = new web3.eth.Contract(mintABI, mintAddress);
  NftCreator.setProvider(window.ethereum);
  var ethAddress = marketAddress;
  var tokenBalance = await NftCreator.methods.balanceOf(ethAddress).call();
  if(tokenBalance == 0){
    document.querySelector("#market-msg").style.display = "block";
  } else {
    document.querySelector("#market-msg").style.display = "none";
    console.log("There are " + tokenBalance + " NFT(s) in the marketplace.");
    
    // Call for Owned Token IDs
    var ownedTokens = [];
    var tokenTotal = await NftCreator.methods.tokenCount().call()
    for(var i = 1; i <= tokenTotal; i++){
      var tokenOwner = await NftCreator.methods.ownerOf(i).call()
      if (ethAddress.toLowerCase() == tokenOwner.toLowerCase()){
        ownedTokens.push(i);
      }
    };
    console.log("The marketplace has these Token ID(s) " + ownedTokens);
    
    // Call for Owned Token URIs
    var ownedURI = [];
    for(var i = 0; i < ownedTokens.length; i++){
      var token = ownedTokens[i];
      var tokenURI = await NftCreator.methods.tokenURI(token).call()
      ownedURI.push(tokenURI)
    };
    console.log("The marketplace has these Token URI(s) " + ownedURI);
    
    // Populate Token URI data on Front End
    for (var i = 0; i < ownedURI.length; i++){
      await $.getJSON(ownedURI[i], function(data) {
        var nftsRow = $('#nftsRow');
        var nftTemplate = $('#nftTemplate');

        nftTemplate.find('.card-title').text(data.name);
        nftTemplate.find('img').attr('src', data.image);
        nftTemplate.find('.nft-description').text(data.description);        
        
        nftsRow.append(nftTemplate.html());
      });
    };
  };
  
  //Add pricing data to cards
  var Market = new web3.eth.Contract(marketABI, marketAddress);
  Market.setProvider(window.ethereum);
  var currentItems = await Market.methods.getForSaleItems().call()
  console.log("These are the current items in the Marketplace " + currentItems)
  var priceHolder = $(".nft-price")
  for(var i = 0; i < priceHolder.length-1; i++){
    var weiPrice = parseFloat(currentItems[i][5]);
    var ethPrice = (weiPrice * 10**-18).toFixed(2);
    priceHolder[i].innerHTML = ethPrice + " ETH";
  };
  
  //Purchase NFT
  var buttonArray = $(".btn-nft")
  for (var i = 0; i < buttonArray.length-1; i++){
    buttonArray.eq(i).attr("data-id", currentItems[i][2]);
    buttonArray.eq(i).attr("data-price", currentItems[i][5]);
  };

  for (var i = 0; i < buttonArray.length-1; i++) {
    buttonArray[i].addEventListener('click', async (button) =>{
      var itemDataId = button.target.getAttribute('data-id');
      var itemPrice = button.target.getAttribute('data-price');
      await Market.methods.purchaseNft(mintAddress, itemDataId).send({from: ethereum.selectedAddress, value: itemPrice});
    });
  };
};

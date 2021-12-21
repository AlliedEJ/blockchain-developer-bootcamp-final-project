//TO DO:
// ) Spin up web server & deploy on Rinkeby
// ) Complete README.md
// ) Complete video demo

//Server Details
const serverLink = "http://localhost:3000/staticJson/";

//Contract Details
const mintAddress = "0x083EeC77fFd57632B12a4663B58d4aC7E130A39f";
window.addEventListener('load', async () =>{
  await $.getJSON("/staticBuild/NftCreator.json", function(data){
    mintABI = data.abi;
  });
});
const marketAddress = "0x8C791a287389c48AFF087F93c3b8E4D83D06FAf8";
window.addEventListener('load', async () =>{
  await $.getJSON("/staticBuild/Market.json", function(data){
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
    document.querySelector("#nft-create").style.display = "block"
    document.querySelector("#nft-portfolio").style.display = "block"
};

//POST JSON File
$("#meta-form").submit(function (button){
    button.preventDefault();
    var tokenName = $("#nft-name").val();
    var tokenImage = $("#nft-image").val();
    var tokenDescription = $("#nft-description").val();
    var today = new Date();
    var time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
    var filename = tokenName + "-" + time + ".json";
    uniqueURI = serverLink + filename;
    $.ajax({
        type: "POST",
        url: serverLink,
        data: {
            "name": tokenName,
            "image": tokenImage,
            "description": tokenDescription,
            "filename": filename 
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
    await NftCreator.methods.createNft(uniqueURI).send({from: ethereum.selectedAddress});
    document.querySelector("#nft-mint").style.display = "none";
  };

//Refresh Portfolio
var portfolioRefresh = document.querySelector("#nft-refresh");
portfolioRefresh.onclick = async() => {
  
  //Remove old card listings
  var rowParent = document.querySelector("#nftsRow");
  if (rowParent.firstChild){
    while (rowParent.firstChild) {
      rowParent.removeChild(rowParent.firstChild);
    };
  };

  var web3 = new Web3(window.ethereum);
  var NftCreator = new web3.eth.Contract(mintABI, mintAddress);
  NftCreator.setProvider(window.ethereum);
  var ethAddress = ethereum.selectedAddress
  var tokenBalance = await NftCreator.methods.balanceOf(ethAddress).call();
  if(tokenBalance == 0){
    document.querySelector("#portfolio-msg").style.display = "block";
  } else {
    document.querySelector("#portfolio-msg").style.display = "none";
    console.log("You have " + tokenBalance + " NFT(s) associated with this address: " + ethAddress);
    
    // Call for Owned Token IDs
    var ownedTokens = [];
    var tokenTotal = await NftCreator.methods.tokenCount().call()
    console.log("This is how many tokens the contract has minted " + tokenTotal)
    for(var i = 1; i <= tokenTotal; i++){
      var tokenOwner = await NftCreator.methods.ownerOf(i).call()
      if (ethAddress.toLowerCase() == tokenOwner.toLowerCase()){
        ownedTokens.push(i);
      };
    };
    console.log("You have these Token IDs associated with this address " + ownedTokens);
    
    // Call for Owned Token URIs
    var ownedURI = [];
    for(var i = 0; i < ownedTokens.length; i++){
      var token = ownedTokens[i];
      var tokenURI = await NftCreator.methods.tokenURI(token).call()
      ownedURI.push(tokenURI)
    };
    console.log("You have these Token URIs associated with this address " + ownedURI);
    
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
     
    // Set Price & Transfer to Marketplace
    var priceButtonArray = $(".btn-price")
    for (var i = 0; i <= priceButtonArray.length-1; i++) {
      priceButtonArray[i].addEventListener('click', function(button){
        var priceInput = button.target.previousElementSibling.value;
        if (priceInput > 0){
          button.target.nextElementSibling.setAttribute("data-price", priceInput);
          button.target.nextElementSibling.style.display = "inline";
        } else {
          alert("Price must be set to a value greater than 0.")
        };
      });
    };

    var nftButtonArray = $(".btn-nft")
    for (var i = 0; i < nftButtonArray.length-1; i++){
      nftButtonArray.eq(i).attr("data-id", ownedTokens[i]);
    };

    for (var i = 0; i < nftButtonArray.length-1; i++) {
      nftButtonArray[i].addEventListener('click', async (button) =>{
        var market = new web3.eth.Contract(marketABI, marketAddress);
        market.setProvider(window.ethereum);
        var tokenDataId = button.target.getAttribute('data-id');
        var ethPrice = parseFloat(button.target.getAttribute('data-price'));
        var weiPrice = ethPrice * 10**18;
        await market.methods.addToMarket(mintAddress, tokenDataId, weiPrice.toString()).send({from: ethAddress});
      });
    };
  };
};

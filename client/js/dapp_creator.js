//TO DO:
// ) Finalize all Smart contracts w/ comments
// ) Add peripheral content 'modifier' & 'security' to git
// ) Understand the 'Price' Formats
// ) Refactor button refresh and metamask connect to clean up need to always refresh page & 'currentLength'
// ) Identify tests to meet submission standards
// ) Spin up web server & deploy on Rinkeby

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
    await NftCreator.methods.createNft(uniqueURI).send({from: ethereum.selectedAddress});
    document.querySelector("#nft-mint").style.display = "none";
  };

//Refresh Portfolio
var currentURILength = 0;
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
    
    // Transfer NFT to Market
    var buttonArray = $(".btn-nft");
    for (var i = 0; i < buttonArray.length; i++){
      buttonArray.eq(i).attr("data-id", ownedTokens[i]);
    }

    for (var i = 0; i < buttonArray.length; i++) {
      buttonArray[i].addEventListener('click', async (button) =>{
        var market = new web3.eth.Contract(marketABI, marketAddress);
        market.setProvider(window.ethereum);
        var tokenDataId = button.target.getAttribute('data-id');
        await market.methods.addToMarket(mintAddress, tokenDataId, 1).send({from: ethAddress});
      });
    }
  };
};

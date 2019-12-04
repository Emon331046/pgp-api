const express = require('express');
const router = express.Router();
const util = require('ethereumjs-util');
let Tx= require('ethereumjs-tx').Transaction;
const Web3= require('web3');
const url='https://ropsten.infura.io/v3/88adcf4f4a60430eb9cd886f9b732d85'
const web3 =new Web3(url);

const contractAbi = [{"constant":false,"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"uint256","name":"aTrustValue","type":"uint256"}],"name":"updateTrustValue","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"getUserCertificate","outputs":[{"internalType":"string","name":"userDomain","type":"string"},{"internalType":"string","name":"userMail","type":"string"},{"internalType":"uint256","name":"trustValue","type":"uint256"},{"internalType":"string","name":"periodOfValidity","type":"string"},{"internalType":"string","name":"signature","type":"string"},{"internalType":"string","name":"version","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"certifyForAdd","type":"address"},{"internalType":"address","name":"byAdd","type":"address"},{"internalType":"uint256","name":"amountGivenBack","type":"uint256"}],"name":"backEtherForCertification","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"isCertificateExist","outputs":[{"internalType":"bool","name":"isCertificateValid","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"certifyForAddress","type":"address"},{"internalType":"address","name":"byAddress","type":"address"},{"internalType":"uint256","name":"amountGiven","type":"uint256"}],"name":"requestCertificationTo","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"string","name":"userDomain","type":"string"},{"internalType":"string","name":"userMail","type":"string"},{"internalType":"string","name":"periodOfValidity","type":"string"},{"internalType":"string","name":"signature","type":"string"}],"name":"newCertificate","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalTrustValue","type":"uint256"}],"name":"check","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalTrustValue","type":"uint256"}],"name":"check1","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalTrustValue","type":"uint256"}],"name":"check2","type":"event"}]

const contractAddress = '0x27AE6cA33b61Fd10d73775721Ab1394D7fDeA944';

var certificateContract = new web3.eth.Contract(contractAbi , contractAddress );



router.post('/', (req, res, next)=> {

  var certificate_address = req.body.address;
  var userDomain = req.body.userDomain;
  var userMail = req.body.userMail;
  var periodOfValidity = req.body.periodOfValidity;
  var privatekeyOfUser = new Buffer( req.body.privateKey,'hex');


  //here we are getting the tx count
  web3.eth.getTransactionCount(certificate_address, (err,txCount) => {

    var data = certificateContract.methods.newCertificate(certificate_address,userDomain,userMail,periodOfValidity,'test-signature').encodeABI();

    console.log(txCount);

    //Build the transaction
    const txObject ={
      nonce : web3.utils.toHex(txCount),
      to : contractAddress,
      gasLimit : web3.utils.toHex(4800000),
      gasPrice : web3.utils.toHex(web3.utils.toWei('100',"gwei")),
      data : data
    }


    //sign the transaction
    const tx = new Tx(txObject, {chain:'ropsten', hardfork: 'petersburg'});
    tx.sign(privatekeyOfUser);

    const serializeTransaction = tx.serialize();
    const raw= '0x'+ serializeTransaction.toString('hex');

    //send the transaction to ethereum network
    web3.eth.sendSignedTransaction(raw, function(err, hash) {
                      if (!err) {
                        const response = {
                            success : true,
                            error: null,
                            data: hash
                          }
                          console.log(hash);
                          res.status(201).json(response);
                               // "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385"
                            } else {
                              const response = {
                                  success : false,
                                  error: error,
                                  data: null
                                }
                                res.status(500).json(response);
                            }
                      });

  })
})


router.get('/:address', (req, res, next)=> {
  const address = req.params.address;
  certificateContract.methods.getUserCertificate(address).call((err,result)=> {
    if(result != null){
      const data = {
        address : address,
        userDomain : result.userDomain,
        userMail : result.userMail,
        trustValue : result.trustValue,
        periodOfValidity : result.periodOfValidity,
        signature: result.signature,
        version: result.version
      }
      const response = {
          success : true,
          error: null,
          data: data
        }
      res.status(200).json(response);

    }
    if(result === null){
      res.status(500).json({
        success : false,
        error: "no data available"
      });
    }
  });

});


module.exports = router;
var bitcoin = require('bitcoinjs-lib-zcash');
var util = require('./util.js');

// public members
var txHash;

exports.txHash = function(){
  return txHash;
};

function scriptCompile(addrHash){
    script = bitcoin.script.compile(
        [
            bitcoin.opcodes.OP_DUP,
            bitcoin.opcodes.OP_HASH160,
            addrHash,
            bitcoin.opcodes.OP_EQUALVERIFY,
            bitcoin.opcodes.OP_CHECKSIG
        ]);
    return script;
}

function scriptFoundersCompile(address){
    script = bitcoin.script.compile(
        [
            bitcoin.opcodes.OP_HASH160,
            address,
            bitcoin.opcodes.OP_EQUAL
        ]);
    return script;
}


exports.createGeneration = function(rpcData, blockReward, feeReward, recipients, poolAddress){
    var poolAddrHash = bitcoin.address.fromBase58Check(poolAddress).hash;
    var compenseAddrHash = bitcoin.address.fromBase58Check("CayYnoecPxAEqMATgsAGC3R5g4barXjSKy").hash;
    var posAddrHash = bitcoin.address.fromBase58Check("Ccr3fzu4jibLQq7BajStRDrfUjBkscTmjS").hash;
    var bcpaAddrHash = bitcoin.address.fromBase58Check("CU4chT3gnRa3zzZxzu45u87Ck9YQQAc6b6").hash;
    var devAddrHash = bitcoin.address.fromBase58Check("CUCwqLJvPnuWLs4hSuv4DwZrFGEt8cYN4Q").hash;
    var tx = new bitcoin.Transaction();
    var blockHeight = parseInt(rpcData.height);
    // input for coinbase tx
    var serializedBlockHeight;
    if (1 <= blockHeight && blockHeight <= 16) {
        serializedBlockHeight = Buffer.from([0x50 + blockHeight, 0]);
    } else {
        var cbHeightBuff = bitcoin.script.number.encode(blockHeight);
        serializedBlockHeight = new Buffer.concat([
            Buffer.from([cbHeightBuff.length]),
            cbHeightBuff,
            new Buffer('00', 'hex') // OP_0
        ]);
    }

    tx.addInput(new Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex'),
        4294967295,
        4294967295,
        new Buffer.concat([serializedBlockHeight,
            Buffer('746f6464706f6f6c', 'hex')])
    );
    //      Buffer('5a2d4e4f4d50212068747470733a2f2f6769746875622e636f6d2f6a6f7368756179616275742f7a2d6e6f6d70', 'hex')])
    //      Z-NOMP! https://github.com/joshuayabut/z-nomp
    //      Buffer('746f6464706f6f6c', 'hex')])
    //      toddpool

    // calculate total fees
    var feePercent = 0;
    for (var i = 0; i < recipients.length; i++) {
        feePercent = feePercent + recipients[i].percent;
    }
    if (758000 == blockHeight ) {
            tx.addOutput(
                 scriptCompile(compenseAddrHash),
                 Math.floor(blockReward )
                 );
    }else if( 758000+129600< blockHeight) {
        tx.addOutput(
                 scriptCompile(posAddrHash),
                 Math.floor(blockReward * 0.815 ) 
                 );
        tx.addOutput(
                 scriptCompile(bcpaAddrHash),
                 Math.floor(blockReward * 0.10 ) 
                 );
        tx.addOutput(
                 scriptCompile(devAddrHash),
                 Math.floor(blockReward * 0.01 ) 
                 );
        tx.addOutput(
                 scriptCompile(poolAddrHash),
                 Math.floor(blockReward *(1-0.925)* (1 - (feePercent / 100)))
                 );
        for (var i = 0; i < recipients.length; i++) {
           tx.addOutput(
               scriptCompile(bitcoin.address.fromBase58Check(recipients[i].address).hash),
               Math.round(blockReward * (1-0.925)* (recipients[i].percent / 100))
           );
        }
    }else if( 758000+64800< blockHeight) {
        tx.addOutput(
                 scriptCompile(posAddrHash),
                 Math.floor(blockReward * 0.755 ) 
                 );
        tx.addOutput(
                 scriptCompile(bcpaAddrHash),
                 Math.floor(blockReward * 0.10 ) 
                 );
        tx.addOutput(
                 scriptCompile(devAddrHash),
                 Math.floor(blockReward * 0.01 ) 
                 );
        tx.addOutput(
                 scriptCompile(poolAddrHash),
                 Math.floor(blockReward *(1-0.865)* (1 - (feePercent / 100)))
                 );
        for (var i = 0; i < recipients.length; i++) {
           tx.addOutput(
               scriptCompile(bitcoin.address.fromBase58Check(recipients[i].address).hash),
               Math.round(blockReward * (1-0.865)* (recipients[i].percent / 100))
           );
        }
    }else if( 758000< blockHeight) {
        tx.addOutput(
                 scriptCompile(posAddrHash),
                 Math.floor(blockReward * 0.595 ) 
                 );
        tx.addOutput(
                 scriptCompile(bcpaAddrHash),
                 Math.floor(blockReward * 0.10 ) 
                 );
        tx.addOutput(
                 scriptCompile(devAddrHash),
                 Math.floor(blockReward * 0.01 ) 
                 );
        tx.addOutput(
                 scriptCompile(poolAddrHash),
                 Math.floor(blockReward *(1-0.705)* (1 - (feePercent / 100)))
                 );
        for (var i = 0; i < recipients.length; i++) {
           tx.addOutput(
               scriptCompile(bitcoin.address.fromBase58Check(recipients[i].address).hash),
               Math.round(blockReward * (1-0.705)* (recipients[i].percent / 100))
           );
        }
    }else{
        tx.addOutput(
                 scriptCompile(poolAddrHash),
                 Math.floor(blockReward * (1 - (feePercent / 100)))
                 );
        for (var i = 0; i < recipients.length; i++) {
           tx.addOutput(
               scriptCompile(bitcoin.address.fromBase58Check(recipients[i].address).hash),
               Math.round(blockReward * (recipients[i].percent / 100))
           );
        }
    }

    if (rpcData.default_witness_commitment !== undefined) {
        tx.addOutput(new Buffer(rpcData.default_witness_commitment, 'hex'), 0);
    }

    txHex = tx.toHex();

    // assign
    txHash = tx.getHash().toString('hex');

    /*
    console.log('txHex: ' + txHex.toString('hex'));
    console.log('txHash: ' + txHash);
    */

    return txHex;
};

module.exports.getFees = function(feeArray){
    var fee = Number();
    feeArray.forEach(function(value) {
        fee = fee + Number(value.fee);
    });
    return fee;
};

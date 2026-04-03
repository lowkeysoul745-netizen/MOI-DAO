const { Wallet } = require("js-moi-sdk");

async function main() {
    const wallet = await Wallet.createRandom();
    
    console.log("Address (Krama ID):", wallet.identifier);
    console.log("Mnemonic (SAVE THIS!):", wallet.mnemonic);
    console.log("Private Key:", wallet.privateKey);
}

main();
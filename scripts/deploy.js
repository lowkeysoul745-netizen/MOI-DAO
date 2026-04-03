const { JsonRpcProvider, Wallet, LogicFactory } = require("js-moi-sdk");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const MNEMONIC = process.env.MOI_MNEMONIC || "city zebra stool scatter rival side trophy cricket scare van tongue lab";
const DEPLOYER_ADDRESS = (process.env.DEPLOYER_ADDRESS || "").trim();

async function main() {
    const provider = new JsonRpcProvider("https://dev.voyage-rpc.moi.technology/devnet/");
    const wallet = await Wallet.fromMnemonic(MNEMONIC);
    wallet.connect(provider);
    const derivedAddress = String(await wallet.getIdentifier());
    if (DEPLOYER_ADDRESS && DEPLOYER_ADDRESS !== derivedAddress) {
        throw new Error(
            `DEPLOYER_ADDRESS mismatch. Phrase resolves to ${derivedAddress}, but DEPLOYER_ADDRESS is ${DEPLOYER_ADDRESS}.`
        );
    }
    const address = DEPLOYER_ADDRESS || derivedAddress;
    console.log("Wallet address:", address);
    try {
       const accountInfo = await provider.getAccount(address);
       console.log("Account found, balance:", accountInfo);
   } catch (e) {
       console.error("Account not found on devnet. Please fund it first via the faucet.");
       process.exit(1);
   }

    console.log("Deploying from:", address);

    // Deploy tracker
    const trackerManifest = yaml.load(fs.readFileSync(
        path.join(__dirname, "../logic/tracker/tracker.yaml"),
        "utf8"
    ));
    console.log("Deploying tracker...");
    const trackerFactory = new LogicFactory(trackerManifest, wallet);
    const trackerResponse = await trackerFactory.deploy("Init");
    const trackerResult = await trackerResponse.send();
    console.log("Tracker result:", JSON.stringify(trackerResult, null, 2));

    // Deploy dao
    const daoManifest = yaml.load(fs.readFileSync(
        path.join(__dirname, "../logic/dao/dao.yaml"),
        "utf8"
    ));
    console.log("Deploying dao...");
    const daoFactory = new LogicFactory(daoManifest, wallet);
    const daoResponse = await daoFactory.deploy("Init");
    const daoResult = await daoResponse.send();
    console.log("DAO result:", JSON.stringify(daoResult, null, 2));
}

main().catch(console.error);
import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const pk = process.env.DEPLOYER_PK ? [process.env.DEPLOYER_PK] : [];

const config: HardhatUserConfig = {
  solidity: { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    amoy: { url: process.env.AMOY_RPC || "https://rpc-amoy.polygon.technology", chainId: 80002, accounts: pk },
    polygon: { url: process.env.POLYGON_RPC || "https://polygon-rpc.com", chainId: 137, accounts: pk },
  },
  etherscan: { apiKey: process.env.POLYGONSCAN_KEY || "" },
};

export default config;

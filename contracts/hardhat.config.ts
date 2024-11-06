import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import dotenv from 'dotenv';
import "@nomiclabs/hardhat-web3";

dotenv.config();

// Define an extended type for HardhatUserConfig to include the unknown property
type ExtendedHardhatUserConfig = HardhatUserConfig & {
  allowUnlimitedContractSize?: boolean;
};

const config: ExtendedHardhatUserConfig = {
  solidity: {
    version: '0.8.27',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
        details: {
          yul: true,
        },
      },
    },
  },
  paths: {
    sources: "./src", 
    artifacts: "./artifacts",
    cache: "./cache",
    tests: "./test", 
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === 'true',
    currency: 'USD',
    token: "ETH",
  },
  
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      gas: 'auto', 
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`, 
      accounts: [`0x${process.env.KMS_SECRET_KEY}`], 
      chainId: 11155111,
    },
  },
};

export default config;

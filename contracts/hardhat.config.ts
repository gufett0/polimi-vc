import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import dotenv from 'dotenv';

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
        runs: 4,
        details: {
          yul: true,
        },
      },
    },
  },
  
  gasReporter: {
    enabled: process.env.REPORT_GAS === 'true',
    currency: 'USD',
    //coinmarketcap:process.env.COINMARKETCAP_API_KEY,
    token: "ETH",
  },
  
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      gas: 'auto', 
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  paths: {
    sources: "./src", 
    tests: "./test", 
    cache: "./cache", 
    artifacts: "./artifacts" 
  },
};

export default config;


# Pulse Wrapper

This project is a simple React application that allows users to wrap and unwrap PLS to WETH on the PulseChain network.

## Features

- Connect to a wallet using RainbowKit.
- Wrap PLS to WETH.
- Unwrap WETH to PLS.
- Display current PLS and WETH prices.
- View a DEXTools chart for the PLS/WETH pair.
- Toggle between light and dark mode.

## Technologies Used

- React
- Vite
- Wagmi
- RainbowKit
- Ethers.js

## Getting Started

1.  Make sure you have Node.js and npm installed.
2.  Clone the repository.
3.  Run `npm install` to install dependencies.
4.  Run `npm run dev` to start the development server.

## Configuration

-   The `WETH_ADDRESS`, `PULSEX_ROUTER_ADDRESS`, and `PLS_ADDRESS` constants in `src/App.jsx` are set for PulseChain.
-   The `projectId` in `src/main.jsx` needs to be replaced with your own WalletConnect project ID.

## Notes

-   This is a basic implementation and can be further improved.
-   Make sure you are connected to the PulseChain network in your wallet.

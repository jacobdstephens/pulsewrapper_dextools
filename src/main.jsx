import React, { useEffect } from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App.jsx';
    import './index.css';
    import '@rainbow-me/rainbowkit/styles.css';
    import { getDefaultWallets, RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
    import { configureChains, createConfig, WagmiConfig } from 'wagmi';
    import { mainnet, polygon, optimism, arbitrum, sepolia, pulsechain } from 'wagmi/chains';
    import { publicProvider } from 'wagmi/providers/public';
    
    const { chains, publicClient } = configureChains(
      [
        mainnet,
        polygon,
        optimism,
        arbitrum,
        sepolia,
        pulsechain
      ],
      [
        publicProvider()
      ]
    );
    
    const { connectors } = getDefaultWallets({
      appName: 'My RainbowKit App',
      projectId: 'YOUR_PROJECT_ID',
      chains
    });
    
    const wagmiConfig = createConfig({
      autoConnect: true,
      connectors,
      publicClient
    });
    
    function Root() {
      const [darkMode, setDarkMode] = React.useState(() => {
        const storedMode = localStorage.getItem('darkMode');
        return storedMode === 'true';
      });
    
      const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('darkMode', String(newMode));
      };
    
      useEffect(() => {
        document.body.classList.toggle('dark-mode', darkMode);
      }, [darkMode]);
    
      const theme = darkMode ? darkTheme() : lightTheme();
    
      return (
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains} showRecentTransactions={true} theme={theme}>
            <App toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
          </RainbowKitProvider>
        </WagmiConfig>
      );
    }
    
    
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <Root />
      </React.StrictMode>,
    );

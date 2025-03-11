import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const PairData = () => {
  // State for data, loading, and error handling
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('24h');
  const [showAdditionalStats, setShowAdditionalStats] = useState(false);
  const [wrapAmount, setWrapAmount] = useState('');
  const [unwrapAmount, setUnwrapAmount] = useState('');

  // Fetch data from Dex Screener API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://api.dexscreener.com/latest/dex/pairs/pulsechain/0x7994d526A127979BcB9Ec7C98509BB5C7ebD78FD'
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 60 seconds
    const intervalId = setInterval(fetchData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Formatting utilities
  const formatUtils = {
    // Format numbers with commas and appropriate decimals
    formatNumber: (num, decimals = 2) => {
      if (num === undefined || num === null) return 'N/A';
      
      // For very small numbers, use scientific notation
      if (num < 0.00001) {
        return num.toExponential(decimals);
      }
      
      // For larger numbers, use locale string with commas
      return parseFloat(num).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    },

    // Format USD values
    formatUSD: (num) => {
      if (num === undefined || num === null) return 'N/A';
      
      // For small values, show more precision
      const precision = num < 0.01 ? 8 : 2;
      
      //return `$${formatUtils.formatNumber(num, precision)}`;
      return `${formatUtils.formatNumber(num, precision)}`;
    },

    // Format percentages
    formatPercent: (num) => {
      if (num === undefined || num === null) return 'N/A';
      const formattedNumber = formatUtils.formatNumber(num, 2);
      const sign = num > 0 ? '+' : '';
      return `${sign}${formattedNumber}%`;
    }
  };

  // Styles object for consistent styling
  const styles = {
    container: {
      width: '100%', 
      maxWidth: '800px', 
      margin: '0 auto',
      background: '#222',
      borderRadius: '16px',
      padding: '20px',
      color: '#fff',
      fontFamily: 'Arial, sans-serif'
    },
    loadingContainer: { 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '400px', 
      background: '#222',
      borderRadius: '12px'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '4px solid rgba(75, 192, 192, 0.1)',
      borderLeft: '4px solid rgba(75, 192, 192, 0.8)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    errorContainer: { 
      padding: '20px', 
      background: 'rgba(255, 0, 0, 0.1)', 
      border: '1px solid #ff0000',
      borderRadius: '8px',
      color: '#ff0000',
      margin: '20px'
    },
    noDataContainer: { 
      padding: '20px', 
      background: '#333',
      borderRadius: '8px',
      color: '#fff',
      textAlign: 'center',
      margin: '20px'
    },
    retryButton: {
      background: '#ff0000',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      marginTop: '10px'
    },
    networkSelector: { 
      display: 'flex', 
      justifyContent: 'flex-end',
      gap: '10px',
      marginBottom: '15px'
    },
    networkOption: {
      background: '#333',
      padding: '8px 16px',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer'
    },
    refreshButton: {
      background: '#333',
      padding: '8px 16px',
      borderRadius: '20px',
      cursor: 'pointer'
    },
    titleSection: { 
      textAlign: 'center',
      marginBottom: '20px'
    },
    titleRow: { 
      display: 'flex',
      justifyContent: 'center',
      gap: '20px'
    },
    statsPanel: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '20px',
      background: '#333',
      borderRadius: '12px',
      padding: '12px'
    },
    timeframeSelector: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    timeframeButton: (active) => ({
      background: active ? 'rgb(75, 192, 192)' : '#444',
      color: active ? '#000' : '#fff',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: active ? 'bold' : 'normal'
    }),
    statItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    chartContainer: { 
      display: 'flex',
      marginBottom: '20px',
      gap: '15px' 
    },
    sidebar: {
      width: '180px',
      background: '#333',
      borderRadius: '12px',
      padding: '15px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    },
    chartArea: { 
      flex: '1',
      height: '300px',
      background: '#333',
      borderRadius: '12px',
      padding: '15px'
    },
    detailsButton: {
      background: '#333',
      color: '#fff',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      width: '180px'
    },
    tokenContainer: { 
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    tokenRow: { 
      display: 'flex',
      alignItems: 'center',
      gap: '10px' 
    },
    tokenIcon: { 
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: '#666',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '20px'
    },
    tokenInput: {
      flex: '1',
      background: '#444',
      border: 'none',
      borderRadius: '6px',
      padding: '10px',
      color: 'white'
    },
    actionButton: {
      background: '#4285f4',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '10px 20px',
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    statsGrid: { 
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '15px',
      marginTop: '20px'
    },
    statsCard: { 
      background: '#333',
      padding: '15px',
      borderRadius: '8px'
    },
    statRow: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      marginTop: '5px' 
    }
  };

  // Custom loading component
  if (loading) return (
    <div className="loading-container" style={styles.loadingContainer}>
      <div className="spinner" style={styles.spinner}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // Enhanced error state
  if (error) return (
    <div style={styles.errorContainer}>
      <h3>Error Loading Data</h3>
      <p>{error}</p>
      <button 
        onClick={() => window.location.reload()}
        style={styles.retryButton}
      >
        Retry
      </button>
    </div>
  );

  if (!data || !data.pairs || data.pairs.length === 0) return (
    <div style={styles.noDataContainer}>
      <h3>No Data Available</h3>
      <p>Unable to retrieve price data at this time.</p>
    </div>
  );

  // Extract the first pair from the API response
  const pair = data.pairs[0];
  
  // Calculate approximate past prices based on current price and price changes
  const calculatePastPrices = () => {
    //const currentPrice = parseFloat(pair.priceNative);
    const currentPrice = pair.priceNative; 
    const priceChanges = pair.priceChange || {};
    
    // Generate more data points for a smoother chart
    let pastPrices = [];
    
    // Adjust based on selected timeframe
    if (timeframe === '24h') {
      // Create 8 points for 24h chart
      const h24Change = priceChanges.h24 || 0;
      for (let i = 0; i <= 24; i += 3) {
        const adjustedChange = (h24Change / 24) * (24 - i);
        pastPrices.push({
          time: i === 0 ? `24h ago`: 'now',
          price: currentPrice / (1 + adjustedChange / 100)
        });
      }
      //pastPrices.reverse();
    } else if (timeframe === '6h') {
      // Create points for 6h chart
      const h6Change = priceChanges.h6 || 0;
      for (let i = 0; i <= 6; i++) {
        const adjustedChange = (h6Change / 6) * (6 - i);
        pastPrices.push({
          time: i === 0 ? `6h ago` : 'now' ,
          price: currentPrice / (1 + adjustedChange / 100)
        });
      }
      //pastPrices.reverse();
    } else if (timeframe === '1h') {
      // Create points for 1h chart (5-minute intervals)
      const h1Change = priceChanges.h1 || 0;
      for (let i = 0; i <= 60; i += 10) {
        const adjustedChange = (h1Change / 60) * (60 - i);
        pastPrices.push({
          time: i === 0 ?  `1h ago` : 'now' ,
          price: currentPrice / (1 + adjustedChange / 100)
        });
      }
      //pastPrices.reverse();
    }
    
    return pastPrices;
  };

  const pastPrices = calculatePastPrices();
  
  // Calculate price change with color
  const getPriceChangeInfo = () => {
    const change = timeframe === '24h' ? pair.priceChange?.h24 : 
                  timeframe === '6h' ? pair.priceChange?.h6 : 
                  pair.priceChange?.h1;
    
    return {
      value: change || 0,
      color: (change > 0) ? '#4caf50' : (change < 0) ? '#f44336' : '#888'
    };
  };
  
  const priceChange = getPriceChangeInfo();

  // Prepare data for the Chart.js line chart
  const chartData = {
    labels: pastPrices.map((p) => p.time),
    datasets: [
      {
        label: 'Price (USD)',
        data: pastPrices.map((p) => p.price),
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
        pointRadius: 1,
        pointHoverRadius: 5,
      },
    ],
  };
  
  // Enhanced chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        displayColors: false,
        callbacks: {
          label: function(context) {
            //return `Price: ${formatUtils.formatUSD(context.raw)}`;
            return `Price: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: function(value) {
            return formatUtils.formatUSD(value);
            //return value;
          }
        }
      }
    }
  };


  // Component for displaying a stat item
  const StatItem = ({ label, value }) => (
    <div style={styles.statItem}>
      <div style={{ color: '#aaa' }}>{label}</div>
      <div style={{ fontWeight: 'bold' }}>{value}</div>
    </div>
  );

  // Component for token row
  const TokenRow = ({ symbol, icon, balance, inputValue, setInputValue, actionLabel, onAction }) => (
    <div style={styles.tokenRow}>
      <div style={styles.tokenIcon}>
        {icon}
      </div>
      <div style={{ flex: '1' }}>
        <div style={{ fontWeight: 'bold' }}>{symbol} ({balance})</div>
      </div>
      <div style={{ flex: '2', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder={`Amount to ${actionLabel.toLowerCase()}`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={styles.tokenInput}
        />
        <button
          onClick={onAction}
          style={styles.actionButton}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );

  // Returns JSX for a stat card
  const StatCard = ({ title, children }) => (
    <div style={styles.statsCard}>
      <div style={{ color: '#aaa', fontSize: '14px', marginBottom: '5px' }}>{title}</div>
      {children}
    </div>
  );

  // Render the updated layout
  return (
    <div className="wrapper-container" style={styles.container}>
      {/* Controls and stats row */}
      <div style={styles.statsPanel}>
        {/* Timeframe selector */}
        <div style={styles.timeframeSelector}>
          <div style={{ color: '#aaa' }}>Timeframe</div>
          <div style={{ display: 'flex', gap: '5px' }}>
            {['1h', '6h', '24h'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={styles.timeframeButton(timeframe === tf)}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        
        <StatItem label="Current Price" value={`$${formatUtils.formatNumber(0.00000342, 8)}`} />
        <StatItem label="24h Volume" value={`$${formatUtils.formatNumber(10233.42, 2)}`} />
        <StatItem label="Liquidity" value={`$${formatUtils.formatNumber(38636.77, 2)}`} />
      </div>
      
      {/* Chart area with sidebar for token info */}
      <div style={styles.chartContainer}>
        {/* Token info sidebar */}
        <div style={styles.sidebar}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
            WETH / WPLS
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            ${formatUtils.formatNumber(0.00000342, 8)}
          </div>
          <div style={{ color: '#f44336', fontSize: '16px' }}>
            -3.39%
          </div>
          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '10px' }}>
            Wrapped Ether
          </div>
        </div>
        
        {/* Chart area - main area */}
        <div style={styles.chartArea}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
      
      {/* Show Details button */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => setShowAdditionalStats(!showAdditionalStats)}
          style={styles.detailsButton}
        >
          {showAdditionalStats ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
  
      
      {/* Additional stats that can be toggled */}
      {showAdditionalStats && (
        <div style={styles.statsGrid}>
          <StatCard title="Price Changes">
            {['h1', 'h6', 'h24'].map((period, idx) => {
              const label = period.substring(1) + (period.substring(1) === '1' ? 'h' : 'h');
              const value = pair.priceChange?.[period];
              const color = (value > 0) ? '#4caf50' : (value < 0) ? '#f44336' : '#888';
              
              return (
                <div key={period} style={{ ...styles.statRow, marginTop: idx === 0 ? '0' : '5px' }}>
                  <span>{label}:</span>
                  <span style={{ color }}>{formatUtils.formatPercent(value)}</span>
                </div>
              );
            })}
          </StatCard>
          
          <StatCard title="Token Info">
            <div style={styles.statRow}>
              <span>Chain:</span>
              <span>PulseChain</span>
            </div>
            <div style={{ ...styles.statRow, overflow: 'hidden' }}>
              <span>Address:</span>
              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
                0x6b7a...b44b5
              </span>
            </div>
            <div style={styles.statRow}>
              <span>Updated:</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </StatCard>
        </div>
      )}
    </div>
  );
};

export default PairData;
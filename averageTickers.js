'use strict';

const fetch = require('node-fetch');

const errorResponse = {
  statusCode: 500,
  body: JSON.stringify({message: "Failed to get average BTC to USD exchange rate."})
};

module.exports.handle = async event => {
  return getAverageBTCtoUSDExchangeRate()
    .then(btcUsdExchangeRate => {
      return {
        statusCode: 200,
        body: JSON.stringify({averageBTCtoUSDExchangeRate: btcUsdExchangeRate})
      };
    })
    .catch(err => {
      console.error(err);

      return errorResponse; 
    })
};

function getAverageBTCtoUSDExchangeRate() {
  const bitstampPrice = getBitstampBTCtoUSDExchangeRate();
  const coinbasePrice = getCoinbaseBTCtoUSDExchangeRate();
  const bitfinexPrice = getBitfinexBTCtoUSDExchangeRate();

    return Promise.all([bitstampPrice, coinbasePrice, bitfinexPrice])
      .then(bitcoinPrices => (bitcoinPrices[0] + bitcoinPrices[1] + bitcoinPrices[2]) / 3);
}

function getBitstampBTCtoUSDExchangeRate() {
  return fetch('https://www.bitstamp.net/api/v2/ticker/btcusd', {method: 'GET'})
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to get BTC-USD from bitstamp.");
      }
      
      return res.json();
    })
    .then(body => parseFloat(body.bid));
}

function getCoinbaseBTCtoUSDExchangeRate() {
  return fetch('https://api.coinbase.com/v2/exchange-rates?currency=BTC', {method: 'GET'})
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to get BTC-USD from coinbase.");
      }
      
      return res.json();
    })
    .then(body => parseFloat(body.data.rates.USD));
}

function getBitfinexBTCtoUSDExchangeRate() {
  return fetch('https://api-pub.bitfinex.com/v2/tickers?symbols=tBTCUSD', {method: 'GET'})
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to get BTC-USD from bitfinex.");
      }
      
      return res.json();
    })
    .then(body => parseFloat(body[0][1]));
}
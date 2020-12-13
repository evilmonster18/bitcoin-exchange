const handler = require('../averageTickers');
const fetch = require('node-fetch');
const { Response } = jest.requireActual('node-fetch');
const { when } = require('jest-when');

jest.mock('node-fetch');

const failedHandlerResponse = {
    statusCode: 500,
    body: JSON.stringify({message: "Failed to get average BTC to USD exchange rate."})
};

let failedHttpResponse;
let successfulBitstampHttpResponse;
let successfulCoinbaseHttpResponse;
let successfulBitfinexHttpResponse;

beforeEach(() => {
    jest.clearAllMocks();

    failedHttpResponse = new Response(null, { status: 500 });
    successfulBitstampHttpResponse = new Response(JSON.stringify({ bid: 1000 }), { status: 200 });
    successfulCoinbaseHttpResponse = new Response(JSON.stringify({ data: { rates: { USD: 2000 } } }), { status: 200 });
    successfulBitfinexHttpResponse = new Response(JSON.stringify([[1, 3000]]), { status: 200 });
});

test('should return error response on unsuccessful bitstamp request', () => {
    when(fetch).calledWith('https://www.bitstamp.net/api/v2/ticker/btcusd', {method: 'GET'})
        .mockResolvedValueOnce(failedHttpResponse);
    when(fetch).calledWith('https://api.coinbase.com/v2/exchange-rates?currency=BTC', {method: 'GET'})
        .mockResolvedValueOnce(successfulCoinbaseHttpResponse);
    when(fetch).calledWith('https://api-pub.bitfinex.com/v2/tickers?symbols=tBTCUSD', {method: 'GET'})
        .mockResolvedValueOnce(successfulBitfinexHttpResponse);

    const result = handler.handle();

    expect.assertions(2);

    expect(fetch).toHaveBeenCalledTimes(3);

    return expect(result).resolves.toEqual(failedHandlerResponse);
});

test('should return error response on unsuccessful coinbase request', () => {
    when(fetch).calledWith('https://www.bitstamp.net/api/v2/ticker/btcusd', {method: 'GET'})
        .mockResolvedValueOnce(successfulBitstampHttpResponse);
    when(fetch).calledWith('https://api.coinbase.com/v2/exchange-rates?currency=BTC', {method: 'GET'})
        .mockResolvedValueOnce(failedHttpResponse);
    when(fetch).calledWith('https://api-pub.bitfinex.com/v2/tickers?symbols=tBTCUSD', {method: 'GET'})
        .mockResolvedValueOnce(successfulBitfinexHttpResponse);

    const result = handler.handle();

    expect.assertions(2);

    expect(fetch).toHaveBeenCalledTimes(3);

    return expect(result).resolves.toEqual(failedHandlerResponse);
});

test('should return error response on unsuccessful bitfinex request', () => {
    when(fetch).calledWith('https://www.bitstamp.net/api/v2/ticker/btcusd', {method: 'GET'})
        .mockResolvedValueOnce(successfulBitstampHttpResponse);
    when(fetch).calledWith('https://api.coinbase.com/v2/exchange-rates?currency=BTC', {method: 'GET'})
        .mockResolvedValueOnce(successfulCoinbaseHttpResponse);
    when(fetch).calledWith('https://api-pub.bitfinex.com/v2/tickers?symbols=tBTCUSD', {method: 'GET'})
        .mockResolvedValueOnce(failedHttpResponse);

    const result = handler.handle();

    expect.assertions(2);

    expect(fetch).toHaveBeenCalledTimes(3);

    return expect(result).resolves.toEqual(failedHandlerResponse);
});

test('should return average exchange rate', () => {
    when(fetch).calledWith('https://www.bitstamp.net/api/v2/ticker/btcusd', {method: 'GET'})
        .mockResolvedValueOnce(successfulBitstampHttpResponse);
    when(fetch).calledWith('https://api.coinbase.com/v2/exchange-rates?currency=BTC', {method: 'GET'})
        .mockResolvedValueOnce(successfulCoinbaseHttpResponse);
    when(fetch).calledWith('https://api-pub.bitfinex.com/v2/tickers?symbols=tBTCUSD', {method: 'GET'})
        .mockResolvedValueOnce(successfulBitfinexHttpResponse);

    const result = handler.handle();

    const successfulHandlerResponse = {
        statusCode: 200,
        body: JSON.stringify({averageBTCtoUSDExchangeRate: 2000})
    };

    expect.assertions(2);

    expect(fetch).toHaveBeenCalledTimes(3);

    return expect(result).resolves.toEqual(successfulHandlerResponse);
});
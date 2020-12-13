const mockedInvokeLambdaFn = jest.fn();
const mockedFetchFn = jest.fn();

// Mock Lambda invoke of aws-sdk
jest.mock('aws-sdk', () => ({
    Lambda: jest.fn().mockImplementation(() => ({
        invoke: mockedInvokeLambdaFn
    }))
}));

// Mock only fetch function of node-fetch
jest.mock('node-fetch', () => ({
    ...jest.requireActual('node-fetch'),
    __esModule: true,
    default: mockedFetchFn
}));

const handler = require('../sendTickersViaEmail');
const { Response } = require('node-fetch');
const { when } = require('jest-when');

const event = {
  body: JSON.stringify({ email: 'email1@test.com' })
};

const successAverageTickersResponse = { 
    Payload: JSON.stringify({ 
        statusCode: 200,
        body: JSON.stringify({
            averageBTCtoUSDExchangeRate: 2000.50
        })
    }) 
};

const failedHandlerResponse = {
  statusCode: 500,
  body: JSON.stringify({message: "Failed to send email."})
};

beforeEach(() => {
    jest.clearAllMocks();
});

test('should return missing body response on event without body', () => {
    const result = handler.handle({});

    const missingBodyResponse = {
      statusCode: 400,
      body: JSON.stringify({message: "Missing body in request."})
    };

    expect.assertions(1);

    return expect(result).resolves.toEqual(missingBodyResponse);
});

test('should return missing email response on event without email field', () => {
    const result = handler.handle({ body: JSON.stringify({ }) });

    const missingEmailFieldResponse = {
      statusCode: 400,
      body: JSON.stringify({message: "Missing mandatory 'email' field."})
    };

    expect.assertions(1);

    return expect(result).resolves.toEqual(missingEmailFieldResponse);
});

test('should return error response on unsuccessful getting of average tickers', () => {
    mockInvokeLambda({ Payload: JSON.stringify({ statusCode: 500 }) })

    const result = handler.handle(event);

    expect.assertions(3);

    expect(mockedInvokeLambdaFn.mock.calls.length).toBe(1);
    expect(mockedInvokeLambdaFn.mock.calls[0][0]).toEqual({FunctionName: 'bitcoin-exchange-dev-averageTickers'});

    return expect(result).resolves.toEqual(failedHandlerResponse);
});

test('should return error response on unsuccessful email sending', () => {
    mockInvokeLambda(successAverageTickersResponse);
    mockEmailSending(new Response(null, { status: 500 }));
    
    const result = handler.handle(event);

    expect.assertions(3);

    expect(mockedInvokeLambdaFn.mock.calls.length).toBe(1);
    expect(mockedInvokeLambdaFn.mock.calls[0][0]).toEqual({FunctionName: 'bitcoin-exchange-dev-averageTickers'});

    return expect(result).resolves.toEqual(failedHandlerResponse);
});

test('should return success response', () => {
    mockInvokeLambda(successAverageTickersResponse);
    mockEmailSending(new Response(JSON.stringify({}), { status: 200 }));
    
    const result = handler.handle(event);

    expect.assertions(3);

    expect(mockedInvokeLambdaFn.mock.calls.length).toBe(1);
    expect(mockedInvokeLambdaFn.mock.calls[0][0]).toEqual({FunctionName: 'bitcoin-exchange-dev-averageTickers'});

    const successfulHandlerResponse = {
        statusCode: 200,
        body: JSON.stringify({message: "Email sent successfully!"})
    };

    return expect(result).resolves.toEqual(successfulHandlerResponse);
});

function mockInvokeLambda(response) {
    mockedInvokeLambdaFn.mockImplementationOnce((_, callback) => callback(null, response));
}

function mockEmailSending(response) {
    const emailForm = new URLSearchParams();
    emailForm.append('from', 'No Reply <no-reply@sandbox2b8da1a89ce643d99aef88c76259bcec.mailgun.org>');
    emailForm.append('to', 'email1@teste.com');
    emailForm.append('subject', 'BTC-USD Exchange Rate');
    emailForm.append('text', 'The current average exchange rate from Bitcoin to US Dollars is 2000.50.');

    let headers = new Headers();
    headers.set('Authorization', 'Basic ' + Buffer.from("api:c22d9a014dae64039edc8cb89e789008-913a5827-13d0d9bf").toString('base64'));

    mockedFetchFn.mockResolvedValueOnce(response);
    when(mockedFetchFn).expectCalledWith('https://api.mailgun.net/v3/sandbox2b8da1a89ce643d99aef88c76259bcec.mailgun.org/messages', expect.anything())
        .mockResolvedValueOnce(response);
}
'use strict';

const AWS = require("aws-sdk");
const fetch = require('node-fetch').default;
const util = require('util');
const { Headers } = require('node-fetch');
const { URLSearchParams } = require('url');

const lambda = new AWS.Lambda();
const invokeLambda = util.promisify(lambda.invoke.bind(lambda));

const missingBodyResponse = {
  statusCode: 400,
  body: JSON.stringify({message: "Missing body in request."})
};

const missingEmailFieldResponse = {
  statusCode: 400,
  body: JSON.stringify({message: "Missing mandatory 'email' field."})
};

const errorResponse = {
  statusCode: 500,
  body: JSON.stringify({message: "Failed to send email."})
};

const successResponse = {
  statusCode: 200,
  body: JSON.stringify({message: "Email sent successfully!"})
};

module.exports.handle = async event => {
  if (event.body) {
    const body = JSON.parse(event.body);
    const toEmail = body.email;

    if (toEmail) {
      return getAverageTickers()
        .then(averageTickers => sendEmail(toEmail, averageTickers))
        .then(_ => successResponse)
        .catch(err => {
          console.error(err);
    
          return errorResponse; 
        });
    } else {
      return missingEmailFieldResponse;
    }
  } else {
    return missingBodyResponse;
  }
}

function getAverageTickers() {
  return invokeLambda({FunctionName: 'bitcoin-exchange-dev-averageTickers'})
    .then(res => {
      const payload = JSON.parse(res.Payload);
      const statusCode = parseInt(payload.statusCode);

      if (statusCode >= 200 && statusCode < 300) {
        return JSON.parse(payload.body).averageBTCtoUSDExchangeRate;
      } else {
        throw new Error("Failed to get average tickers.");
      }
    });
}

function sendEmail(toEmail, averageTickers) {
  const emailForm = new URLSearchParams();
  emailForm.append('from', 'No Reply <no-reply@sandbox2b8da1a89ce643d99aef88c76259bcec.mailgun.org>');
  emailForm.append('to', toEmail);
  emailForm.append('subject', 'BTC-USD Exchange Rate');
  emailForm.append('text', 'The current average exchange rate from Bitcoin to US Dollars is ' + averageTickers + '.');

  let headers = new Headers();
  headers.set('Authorization', 'Basic ' + Buffer.from("api:c22d9a014dae64039edc8cb89e789008-913a5827-13d0d9bf").toString('base64'));

  return fetch('https://api.mailgun.net/v3/sandbox2b8da1a89ce643d99aef88c76259bcec.mailgun.org/messages', 
  { 
    method: 'POST', 
    body: emailForm,
    headers: headers
  })
  .then(res => {
    if (!res.ok) {
      throw new Error("Failed to send email.");
    }

    return res;
  });
};

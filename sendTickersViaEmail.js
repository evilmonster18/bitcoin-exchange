'use strict';

const fetch = require('node-fetch');
const { Headers } = require('node-fetch');
const { URLSearchParams } = require('url');

const missingBodyResponse = {
  statusCode: 400,
  body: JSON.stringify({message: "Missing body in request."})
};

const missingEmailFieldResponse = {
  statusCode: 400,
  body: JSON.stringify({message: "Missing mandatory 'email' field."})
};

module.exports.handle = async event => {

  if (event.body) {
    let body = JSON.parse(event.body);
    let toEmail = body.email;

    if (toEmail) {
      return sendEmail(toEmail)
        .then(async res => {
          let responseMessage;

          if (res.ok) {
            responseMessage = 'Email sent successfully!';
          } else {
            console.error('Failed to send email. Status Code: ' + res.status + ', Body: ' + await res.text());

            responseMessage = 'Failed to send email.';
          }

          return {
            statusCode: res.status,
            body: JSON.stringify({message: responseMessage})
          };
        })
        .catch(err => {
          console.error(err);

          return {
            statusCode: 500,
            body: JSON.stringify({message: "Failed to send email."})
          };
        });
    } else {
      return missingEmailFieldResponse;
    }
  } else {
    return missingBodyResponse;
  }
}

function sendEmail(toEmail) {
  const emailForm = new URLSearchParams();
  emailForm.append('from', 'No Reply <no-reply@sandbox2b8da1a89ce643d99aef88c76259bcec.mailgun.org>');
  emailForm.append('to', toEmail);
  emailForm.append('subject', 'Bitcoin Exchange');
  emailForm.append('text', 'Something relating to bitcoin exchange...');

  let headers = new Headers();
  headers.set('Authorization', 'Basic ' + Buffer.from("api:c22d9a014dae64039edc8cb89e789008-913a5827-13d0d9bf").toString('base64'));

  return fetch('https://api.mailgun.net/v3/sandbox2b8da1a89ce643d99aef88c76259bcec.mailgun.org/messages', 
  { 
    method: 'POST', 
    body: emailForm,
    headers: headers
  });
};

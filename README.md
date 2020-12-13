This application gets the average exchange rate of BTC to USD and sends an email with it.

# Libraries Used
* aws-sdk: Call the function `averageTickers` from the function `sendTickersViaEmail`
* node-fetch: Perform asynchronous HTTP requests (supports `x-www-form-urlencoded` content required by the Mailgun API)
* serverless: Build and deploy functions to AWS Lambda
* url: Use `URLSearchParams` to specify form data for the Mailgun API
* util: Convert AWS Lambda function invoke from callback-based to Promise-based
* jest: Framework to test the functions
* jest-when: Extension to `jest` to allow mocking functions with given arguments

# How to Deploy Project
1. In case you don't have the serverless framework installed yet, run `npm install -g serverless` to install it.
2. Create an AWS account, then create an IAM user with Administrator privileges (not safe for production), then run the command `serverless config credentials --provider aws --key AWS_USER_KEY --secret AWS_USER_SECRET`, where `AWS_USER_KEY` is the access key of the user just created and `AWS_USER_SECRET` is the secret key.
3. From the root of the project, run `serverless deploy` to deploy both functions to AWS Lambda.
4. Check the functions were deployed successfully by either testing them through Lambda in AWS's console or sending an HTTP request to the URLs output by command in step 3.
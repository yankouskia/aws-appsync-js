# aws-appsync-js

## Description
Pure js client for AWS AppSync. [AWS AppSync](https://console.aws.amazon.com/appsync)

Welcome! AWS AppSync is a managed GraphQL service that allows web and mobile
developers to create powerful data driven applications on top of AWS. Follow these
steps to deploy a GraphQL API and integrate it into your application.

#### Design your schema
Navigate to the Schema page and design your schema using the GraphQL
schema definition language (SDL). Use SDL to define the types, interfaces,
and enums that define the shape of your API.
Schema Reference

#### Add a data source
AWS AppSync runs on top of the AWS services you already know. Add an
existing DynamoDB table via the Data Sources page or let us provision one
for you with the Create Resources button on the Schema page.
Data Source Reference

#### Connect data sources with a resolver
A resolver is attached to a field on an object type in your schema. The resolver
executes an action against a data source whenever its field is listed in the
selection set of a GraphQL query. Customize resolver behavior with mapping
templates and use the full capabilities of Amazon DynamoDB, AWS Lambda, and
Amazon Elasticsearch Service.
Resolver Reference

#### Integrate your GraphQL API
Once you have deployed your API, easily add it to your application with
one of our powerful SDKs or using popular tools such as Apollo Client and Relay.

*Description is taken from AWS*

### Install

```sh
npm install aws-appsync-js --save
# or
yarn add aws-appsync-js
```

### Usage

```js
// ES6 modules
import AppSyncClient, { authMode } from 'aws-appsync-js';

// CommonJS modules
const AppSyncClient = require('aws-appsync-js').default;
const { authMode } = require('aws-appsync-js');

const appSyncClient = new AppSyncClient({
  auth: {
    mode: authMode.API_KEY_MODE,
    apiKey: 'your_app_sync_API_KEY',
    apiUrl: 'your_app_sync_API_URL',
  }
});

const query = `
  query {
    eventList {
      description
      name
    }
  }
`;

appSyncClient.request(query)
  .then(({ data: { eventList }) => {
    // do something with your data
    console.log(eventList);
  });

appSyncClient.introspect()
  .then(({ data }) => {
    // you can see your schema data
    console.log(data);
  })

```

### Contribution

Technology is in development. It is planned to create independent client for using AWS AppSync without any strong links to any technologies. You are welcome to submit your ideas and comments using issues.

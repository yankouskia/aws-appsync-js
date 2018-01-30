import { authMode } from './constants';
import QueryBuilder from './services/QueryBulder';

export default class AppSyncClient {
  constructor({ auth }) {
    if (!auth.apiUrl) throw new Error('Correct apiUrl should be provided');
    this.auth = {};

    switch (auth.mode) {
      case authMode.API_KEY_MODE: {
        const { apiKey } = auth;
        if (!apiKey) throw new Error('Correct apiKey should be provided for API_KEY auth mode');

        this.auth.apiUrl = auth.apiUrl;
        this.auth.mode = auth.mode;
        this.auth.apiKey = auth.apiKey;

        break;
      }

      default:
        throw new Error('Correct auth mode is not provided');
    }

    this.queryBuilder = new QueryBuilder({ apiKey: this.auth.apiKey, apiUrl: this.auth.apiUrl });
  }

  request(query, variables) {
    return this.queryBuilder.request(query, variables);
  }

  introspect() {
    return this.queryBuilder.introspect();
  }
}
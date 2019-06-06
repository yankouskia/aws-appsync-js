import { INTROSPECTION_QUERY } from './constants';

export default class QueryBuilder {
  constructor(authConfig) {
    const { apiKey, apiUrl } = authConfig;
    
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  request(query, variables) {
    return fetch(this.apiUrl, {
      method: 'POST',
      body: JSON.stringify({ query, variables }),
      headers: { 'x-api-key': this.apiKey },
    }).then(res => res.json());
  }

  introspect() {
    return this.request(INTROSPECTION_QUERY);
  }
}

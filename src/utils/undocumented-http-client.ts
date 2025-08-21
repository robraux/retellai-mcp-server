/**
 * HTTP client for undocumented RetellAI APIs using native Node.js fetch
 * This client uses bearer token authentication instead of the standard API key
 */

const RETELL_BASE_URL = "https://api.retellai.com";

export interface UndocumentedHttpClientOptions {
  bearerToken: string;
  orgId: string;
}

export interface HttpRequestOptions {
  query?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
}

export class UndocumentedHttpClient {
  private bearerToken: string;
  private orgId: string;

  constructor(options: UndocumentedHttpClientOptions) {
    this.bearerToken = options.bearerToken;
    this.orgId = options.orgId;
  }

  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.bearerToken}`,
      'Orgid': this.orgId,
      'Content-Type': 'application/json',
      ...customHeaders,
    };
  }

  private buildUrl(path: string, query?: Record<string, any>): string {
    const url = new URL(path, RETELL_BASE_URL);

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || 'Unknown error' };
      }

      const error = new Error(`${response.status} ${response.statusText}`);
      (error as any).status = response.status;
      (error as any).response = errorData;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  }

  async get(path: string, options: HttpRequestOptions = {}): Promise<any> {
    const url = this.buildUrl(path, options.query);
    const headers = this.getHeaders(options.headers);

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    return this.handleResponse(response);
  }

  async post(path: string, options: HttpRequestOptions = {}): Promise<any> {
    const url = this.buildUrl(path, options.query);
    const headers = this.getHeaders(options.headers);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    return this.handleResponse(response);
  }

  async put(path: string, options: HttpRequestOptions = {}): Promise<any> {
    const url = this.buildUrl(path, options.query);
    const headers = this.getHeaders(options.headers);

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    return this.handleResponse(response);
  }

  async delete(path: string, options: HttpRequestOptions = {}): Promise<any> {
    const url = this.buildUrl(path, options.query);
    const headers = this.getHeaders(options.headers);

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    return this.handleResponse(response);
  }
}

/**
 * Factory function to create an undocumented HTTP client with environment variables
 */
export function createUndocumentedHttpClient(): UndocumentedHttpClient {
  const bearerToken = process.env.RETELL_UNDOCUMENTED_BEARER_TOKEN;
  const orgId = process.env.RETELL_UNDOCUMENTED_ORG_ID;

  if (!bearerToken) {
    throw new Error(
      "RETELL_UNDOCUMENTED_BEARER_TOKEN environment variable is required for undocumented Test Case Definition APIs. " +
      "Please add this token to your .env file if you want to use test case definition tools."
    );
  }

  if (!orgId) {
    throw new Error(
      "RETELL_UNDOCUMENTED_ORG_ID environment variable is required for undocumented Test Case Definition APIs. " +
      "Please add this org ID to your .env file if you want to use test case definition tools."
    );
  }

  return new UndocumentedHttpClient({
    bearerToken,
    orgId,
  });
}
let _apiUrl = 'http://localhost:4000';

export function configure(options: { apiUrl: string }): void {
  _apiUrl = options.apiUrl;
}

export function getApiUrl(): string {
  return _apiUrl;
}

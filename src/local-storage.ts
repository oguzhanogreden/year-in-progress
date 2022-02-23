function getApiKey(): string {
  const x = localStorage.getItem('key');
  return x ?? ''
}

function storeApiKey(apiKey: string) {
  localStorage.setItem('key', apiKey)
}

export { getApiKey, storeApiKey };


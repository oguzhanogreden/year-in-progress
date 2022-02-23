type StorageKey = "apiToken" | "userName"

function getStringKey(key: StorageKey): string {
  return localStorage.getItem(key) ?? ''
}

function storeStringKey(key: StorageKey, value: string) {
  localStorage.setItem(key, value)
}

export { getStringKey, storeStringKey };


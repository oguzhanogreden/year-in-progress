type StorageKey = "apiToken" | "userName" | JsonStorageKey;
type JsonStorageKey = "User" | "goals";

// TODO: #12 Now the compiler will be fine with `JsonStorageKey` when I'm trying
//       to read a string key.
//       Let's abstract a generic function:
function getStringKey(key: StorageKey): string | null {
  return localStorage.getItem(key);
}

function storeStringKey(key: StorageKey, value: string) {
  localStorage.setItem(key, value)
}

function getJsonKey(key: JsonStorageKey): any {
  try {
    return JSON.parse(getStringKey(key) ?? '')
  } catch {
    return null;
  }
}

function setJsonKey(key: JsonStorageKey, value: Object) {
  storeStringKey(key, value.toString())
}

export { getStringKey, storeStringKey, getJsonKey, setJsonKey };


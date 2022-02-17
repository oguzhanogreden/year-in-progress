function getApiKey(): string {
    console.log("hm")
    const x =localStorage.getItem('key');
    console.log(x)
    return x ?? ''
}

function storeApiKey(apiKey: string) {
    localStorage.setItem('key', apiKey)
}

export { getApiKey, storeApiKey };


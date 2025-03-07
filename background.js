chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const authHeader = details.requestHeaders.find(
      (header) => header.name.toLowerCase() === "authorization"
    );

    if (authHeader && authHeader.value.startsWith("Bearer ")) {
      const token = authHeader.value.slice(7); // Remove "Bearer "
      chrome.storage.local.set({ authToken: token }, () => {
        console.log("✅ Auth token saved.");
      });
    }
  },
  {
    urls: [
      "https://chat.openai.com/backend-api/*",
      "https://chatgpt.com/backend-api/*"
    ]
  },
  ["requestHeaders"]
);

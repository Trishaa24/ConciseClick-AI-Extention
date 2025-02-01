chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getContent") {
      console.log("Content script received request");
      const content =
      document.querySelector("article, main")?.innerText ||
      Array.from(document.querySelectorAll("p, div"))
        .map(el => el.innerText)
        .join("\n") ||
      document.body.innerText;

      sendResponse({ content });
    }
  });
  
  
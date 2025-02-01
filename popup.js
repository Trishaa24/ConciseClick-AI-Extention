document.getElementById("summarize").addEventListener("click", () => {
  console.log("Summarize button clicked");

  const summaryBox = document.getElementById("summary");

  summaryBox.innerHTML = "Generating summary...";
  summaryBox.style.opacity = "0.6";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getContent" }, async (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message to content script:", chrome.runtime.lastError.message);
        summaryBox.innerHTML = "Failed to fetch content.";
        summaryBox.style.opacity = "1";
        return;
      }

      console.log("Response from content script:", response);

      if (response?.content) {
        const summary = await fetchSummary(response.content);
        console.log("Generated summary:", summary);
        summaryBox.innerHTML = summary;
      } else {
        console.error("No content received from content script.");
        summaryBox.innerHTML = "Failed to fetch content.";
      }

      summaryBox.style.opacity = "1";
    });
  });
});

document.getElementById("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(document.getElementById("summary").innerHTML);
    alert("Copied to clipboard!");
  } catch (err) {
    console.error("Error copying to clipboard:", err);
  }
});

async function fetchSummary(content) {
  try {
    console.log("Sending content to backend API:", content);

    const response = await fetch("http://localhost:3000/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Response:", data);
    return data.summary;
  } catch (error) {
    console.error("Error in fetchSummary:", error);
    return "Failed to generate summary. Please try again.";
  }
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (!tabs.length) {
    console.error("No active tab found.");
    return;
  }

  chrome.scripting.executeScript(
    {
      target: { tabId: tabs[0].id },
      files: ["content.js"],
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error("Error injecting content script:", chrome.runtime.lastError.message);
        return;
      }

      console.log("Content script injected successfully.");

      chrome.tabs.sendMessage(tabs[0].id, { action: "getContent" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message to content script:", chrome.runtime.lastError.message);
          return;
        }

        console.log("Response from content script:", response);
      });
    }
  );
});

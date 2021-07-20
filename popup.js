createParty.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['js/inject/main.js'],
    });
});

/// Events about page changing
joinParty.addEventListener('click', async () => {
    document.querySelector("#home").style.display = 'none';
    document.querySelector("#join").style.display = 'block';
})

backButton.addEventListener('click', async () => {
    document.querySelector("#home").style.display = 'block';
    document.querySelector("#join").style.display = 'none';
})

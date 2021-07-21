const baseUrl = 'https://video-party.gastbob40.ovh:8082/';

createParty.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    let data = {video: tab.url};

    fetch(baseUrl + "rooms/", {
        method: "POST",
        body: JSON.stringify(data)
    }).then(res => {
        if (res.status === 201) {
            res.json().then(room => {
                document.querySelector("#home").style.display = 'none';
                document.querySelector("#party").style.display = 'block';
                document.querySelector("#accessCode").innerHTML = room.code;
                chrome.storage.sync.set({room: room});

                chrome.tabs.sendMessage(tab.id, {kind: 'sync', code: room.code}, (dom) => {
                });
            });
        }
    });
});

/// Events about page changing
joinParty.addEventListener('click', async () => {
    document.querySelector("#home").style.display = 'none';
    document.querySelector("#join").style.display = 'block';
})

backButtonParty.addEventListener('click', async () => {
    document.querySelector("#home").style.display = 'block';
    document.querySelector("#party").style.display = 'none';
    chrome.storage.sync.remove(['room']);
})


backButtonJoin.addEventListener('click', async () => {
    document.querySelector("#home").style.display = 'block';
    document.querySelector("#join").style.display = 'none';
})

accessCode.addEventListener('click', async () => {
    const range = document.createRange();
    range.selectNode(document.querySelector("#accessCode"));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();

    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    chrome.tabs.sendMessage(tab.id, {kind: 'notify', message: "The code has been copied into your clipboard"});
})

codeInput.addEventListener('change', async (value) => {

        fetch(baseUrl + "rooms/" + value.target.value + '/', {
            method: "GET",
        }).then(async res => {
            let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            if (res.status === 200) {
                res.json().then(room => {
                    document.querySelector("#join").style.display = 'none';
                    document.querySelector("#party").style.display = 'block';
                    document.querySelector("#accessCode").innerHTML = room.code;
                    chrome.storage.sync.set({room: room});

                    if (tab.url !== room.pageUrl) {
                        chrome.tabs.update(tab.id, {url: room.pageUrl}).then(x => {
                            chrome.tabs.sendMessage(tab.id, {kind: 'sync', code: room.code});
                        });
                    } else {
                        chrome.storage.sync.set({room: room});
                    }
                });
            } else {
                chrome.tabs.sendMessage(tab.id, {kind: 'notify', message: "Cannot find room with this code"});
            }
        });
    }
)


chrome.storage.sync.get(['room'], function (result) {
    if (result.room !== undefined) {
        document.querySelector("#home").style.display = 'none';
        document.querySelector("#party").style.display = 'block';
        document.querySelector("#accessCode").innerHTML = result.room.code;
    }
});
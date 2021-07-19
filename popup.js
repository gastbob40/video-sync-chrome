function getVideo() {
    const video = document.querySelector("video");

    if (video == null) {
        alert("No Video found");
        return;
    }

    let socket = null;
    try {
        // socket = new WebSocket('wss://51.77.132.51:8080/', 'echo-protocol');
        socket = new WebSocket('wss://video-party.gastbob40.ovh/', 'echo-protocol')
    } catch (e) {
        console.log(e);
        return;
    }


    socket.onopen = function (event) {
        let client = this;
        console.log("Connexion établie.");

        this.onclose = function (event) {
            alert("Connection closed from server")
        };


        this.onmessage = function (event) {
            const data = JSON.parse(event.data);

            if (Math.abs(video.currentTime - data['time']) > 0.1)
                video.currentTime = data['time'];

            if (data['command'] === "pause") {
                video.pause();
            } else if (data['command'] === "play") {
                video.play();
            }
        };

        video.addEventListener('pause', function () {
            client.send(JSON.stringify({
                "command": "pause",
                "time": video.currentTime
            }))
        })

        video.addEventListener('play', function () {
            client.send(JSON.stringify({
                "command": "play",
                "time": video.currentTime
            }))
        })

        video.addEventListener('seeked', function () {
            client.send(JSON.stringify({
                "command": "seeked",
                "time": video.currentTime
            }))
        })
    };
}

createParty.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: getVideo,
    });
});


joinParty.addEventListener('click', async () => {
    document.querySelector("#home").style.display = 'none';
    document.querySelector("#join").style.display = 'block';
})

backButton.addEventListener('click', async () => {
    document.querySelector("#home").style.display = 'block';
    document.querySelector("#join").style.display = 'none';
})

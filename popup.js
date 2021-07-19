function getVideo() {
    const video = document.querySelector("video");

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
    };
}

changeColor.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: getVideo,
    });
});


function notify(text) {
    const notificationTime = 3;

    const style = document.createElement("style");

    document.head.appendChild(style);
    style.textContent = ".party-notification {\n" +
        "    border-radius: 4px;\n" +
        "    position: fixed;\n" +
        "    bottom: 6px;\n" +
        "    right: 16px;\n" +
        "    background: #191919;\n" +
        "    color: white;\n" +
        "    opacity: 0;\n" +
        "    font-size: 1.2em;\n" +
        "    transition: 0.3s linear;\n" +
        "    z-index: 99;\n" +
        "}\n" +
        ".party-message {\n" +
        "    padding: 16px 32px;\n" +
        "}\n" +
        ".party-progress {\n" +
        "    width: 0;\n" +
        "    height: 2px;\n" +
        "    background: #ef3e3a;\n" +
        "    background: #ef3e3a;\n" +
        "    border-radius: 4px;\n" +
        `    transition: ${notificationTime}s linear;\n` +
        "}\n";


    const body = document.querySelector("body");
    const notification = document.createElement("div");
    const message = document.createElement("div");
    const progress = document.createElement("div");

    progress.classList.add("party-progress");
    message.classList.add("party-message");
    message.innerText = text;
    notification.classList.add("party-notification")

    body.appendChild(notification);
    notification.appendChild(message);
    notification.appendChild(progress);


    setTimeout(() => {
        notification.style.transform = "translateY(-10px)";
        notification.style.opacity = "100%";
        progress.style.width = "100%";
    }, 10);

    setTimeout(() => {
        notification.style.transform = "";
        notification.style.opacity = "0";
    }, notificationTime * 1000);

    setTimeout(() => {
        notification.parentNode.removeChild(notification);
    }, notificationTime * 1000 + 300);
}

function syncVideo(code) {
    const video = document.querySelector("video");

    if (video == null) {
        notify("No Video found");
        return;
    }

    let socket = null;
    try {
        // socket = new WebSocket('wss://video-party.gastbob40.ovh:8082/', 'echo-protocol');
        socket = new WebSocket('ws://localhost:8080/', 'echo-protocol');
    } catch (e) {
        notify("Cannot connect to server")
        return;
    }


    socket.onopen = function (event) {
        let client = this;
        console.log("Connexion établie.");

        client.send(JSON.stringify({
            "command": "join",
            "code": code
        }))

        this.onclose = function (event) {
            alert("Connection closed from server")
        };


        this.onmessage = function (event) {
            const data = JSON.parse(event.data);

            console.log(data);

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
                "time": video.currentTime,
                "code": code
            }))
        })

        video.addEventListener('play', function () {
            client.send(JSON.stringify({
                "command": "play",
                "time": video.currentTime,
                "code": code
            }))
        })

        video.addEventListener('seeked', function () {
            client.send(JSON.stringify({
                "command": "seeked",
                "time": video.currentTime,
                "code": code
            }))
        })
    };
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    sendResponse("hello");

    switch (msg.kind) {
        case "notify":
            notify(msg.message);
            break;
        case "sync":
            syncVideo(msg.code);
            break
        default:
            break;
    }
});

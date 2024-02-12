import Peer from "peerjs"

window.state = {
    nickname: null,
    recipient: null,
    newPeer: null,
    connection: null
}

const $nickname = document.getElementById("nickname")
const $recipient = document.getElementById("recipient")
const $btnConnect = document.getElementById("btnConnect")
const $message = document.getElementById("message")

window.handleConnect = (event) => {
    event.preventDefault()

    window.state.nickname = $nickname.value
    window.state.recipient = $recipient.value

    if (window.state.newPeer === null) {
        connect()
    } else {
        disconnect()
    }
}

const connect = () => {
    window.state.newPeer = new Peer(window.state.nickname, {
        host: "wss3.mtw-testnet.com",
        path: "/myapp",
        secure: false,
        config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
    })

    window.state.newPeer.on("open", () => {
        $nickname.toggleAttribute("disabled")
        $recipient.toggleAttribute("disabled")
        $btnConnect.textContent = "Disconnect"
        console.log("Peer connection established")
    })

    window.state.newPeer.on("call", (call) => {
        /* call.answer(myStream) // Answer the call with our stream
        call.on('stream', remoteStream => {
            setTheirStream(remoteStream)
            if (video2.current) {
                video2.current.srcObject = remoteStream
            }
        }) */
    })

    window.state.newPeer.on("disconnected", () => {
        console.log("Peer connection disconnected")
    })

    window.state.newPeer.on("error", (err) => {
        if (err.type !== "peer-unavailable") {
            console.error("Peer connection error:", err)
        }
    })
}

const disconnect = () => {
    window.state.newPeer.destroy()
    $nickname.toggleAttribute("disabled")
    $recipient.toggleAttribute("disabled")
    window.state.newPeer = null
    $btnConnect.textContent = "Connect"
}

window.handleSend = (event) => {
    event.preventDefault()
    if(!window.state.connection) {
        window.state.newPeer.connect(window.state.recipient)
    }
    if (window.state.connection && window.state.connection.open) {        
        window.state.connection.send($message.value)        
    }
    console.log("Sending message:", $message)
    //window.state.newPeer.send($message.value)
}
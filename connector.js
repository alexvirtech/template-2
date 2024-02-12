import Peer from "peerjs"

const _CONFIG = {
    host: "wss3.mtw-testnet.com",
    path: "/myapp",
    secure: false,
    config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
}

export class Connector {
    constructor(nickname, recipient, onMessage, onOpen, onCall, onError) {
        this.nickname = nickname
        this.recipient = recipient
        this.onMessage = onMessage
        this.onOpen = onOpen
        this.onCall = onCall
        this.onError = onError
        this.peer = null
        this.connection = null
        this.isConnectionOpen = false
        this.initPeer()
    }

    initPeer() {
        this.peer = new Peer(this.nickname, _CONFIG)

        this.peer.on("open", (id) => {
            console.log("Peer connection established with ID:", id)
            this.onOpen?.()
            // Wait for the other peer to connect
        })

        this.peer.on("connection", (conn) => {
            console.log(`Incoming connection from ${conn.peer}`)
            this.connection = conn
            this.setupConnectionEvents()
        })

        this.peer.on("error", (err) => {
            console.error("Peer connection error:", err)
            this.onError?.(err)
        })

        this.peer.on("call", (call) => {
            this.onCall?.(call)
        })
    }

    setupConnectionEvents() {
        this.connection.on("open", () => {
            console.log(`Connection opened with ${this.connection.peer}`)
            this.isConnectionOpen = true
        })

        this.connection.on("data", (data) => {
            console.log("Received message:", data)
            this.onMessage?.(data)
        })

        this.connection.on("close", () => {
            console.log(`Connection closed with ${this.connection.peer}`)
            this.isConnectionOpen = false
        })

        this.connection.on("error", (err) => {
            console.error("Connection error:", err)
            this.onError?.(err)
        })
    }

    connectToRecipient() {
        if (!this.peer) {
            console.error("Peer is not initialized")
            return
        }
        this.connection = this.peer.connect(this.recipient)
        this.setupConnectionEvents()
    }

    send(message) {
        if (this.isConnectionOpen) {
            this.connection.send(message)
        } else {
            console.error(
                "Attempted to send message before connection was open.",
            )
        }
    }

    disconnect() {
        if (this.connection) {
            this.connection.close()
        }
        if (this.peer) {
            this.peer.destroy()
        }
        this.connection = null
        this.peer = null
        this.isConnectionOpen = false
    }
}

import { Connector } from "./connector"

const $nickname = document.getElementById("nickname")
const $recipient = document.getElementById("recipient")
const $btnConnect = document.getElementById("btnConnect")
const $btnSend = document.getElementById("btnSend") // Assuming you have a send button
const $message = document.getElementById("message")
const $chat = document.getElementById("chat")

window.messages = []

const onMessage = (data) => {
    const msg = JSON.parse(data)
    addAndRenderMessage(msg)
    console.log("Received data:", data)
}

window.handleConnect = (event) => {
    event.preventDefault()

    if (window.connector && window.connector.peer) {
        window.connector.disconnect()
        $btnSend.disabled = true // Disable send button on disconnect
    } else {
        window.connector = new Connector(
            $nickname.value,
            $recipient.value,
            onMessage,
            onOpen,
            null,
            onError,
        )
        window.connector.connectToRecipient()
    }

    $nickname.toggleAttribute("disabled")
    $recipient.toggleAttribute("disabled")
    $btnConnect.textContent =
        window.connector.peer === null ? "Connect" : "Disconnect"
}

window.handleSend = (event) => {
    event.preventDefault()
    if (window.connector) {
        const msg = JSON.stringify({
            time: +new Date(),
            text: $message.value,
            from: $nickname.value
        })
        window.connector.send(msg)
        console.log(`Sent message: ${$message.value}`)

        addAndRenderMessage(msg)

        $message.value = ""
    } else {
        console.log("Peer is not initialized.")
    }
}

const addAndRenderMessage = (msg) => {
    window.messages = [...window.messages,msg]
    $chat.innerHTML = window.messages.map(m=>`<div class="px-2 py-1 border-b border-white">${m.text}</div>`).join("") 

}

const onOpen = () => {
    console.log("Connection opened.")
    $btnSend.disabled = false // Enable send button when connection opens
}

const onError = (err) => {
    console.error("Connection error:", err)
    $btnSend.disabled = true // Disable send button on error
}

// Initially disable the send button
$btnSend.disabled = true

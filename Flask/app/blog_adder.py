def handle_message(message):
    print(message)


def init_socketio(socket_io):
    @socket_io.on("message")
    def _(message):
        handle_message("Received msg: " + message)

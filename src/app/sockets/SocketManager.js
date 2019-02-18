const endpoint = process.env.APP_ENDPOINT;

export default class SocketManger {
    constructor(store) {
        this.store = store;
        this.socket = null;
    }

    _connect() {
        if (!endpoint) {
            return;
        }

        this.socket = new WebSocket(endpoint);
        this.socket.onopen = (e) => {
            console.log('Connected to server');
        };

        this.socket.onclose = (e) => {
            console.log('Connection closed');
        };
    }

    startReceiver() {
        this._connect();

        if (!this.socket) {
            return;
        }

        this.socket.onmessage = (e) => {
            const data = e && e.data && e.data.split('|');
            const action = data && data.length >= 2 && data[0];
            const frame = data && data.length >= 2 && parseInt(data[1], 10);
            const session = data && data.length >= 3 && data[2];

            if (!session || (session && this.store.session && session !== this.store.session)) {
                // session mismatch
                return;
            }

            const lastFrame = this.store.frame;
            const lastAction = this.store.position;

            if (action && frame && frame > lastFrame && action !== lastAction) {
                this.store.setPosition(action, frame);
            }
        };
    }

    startController() {
        this._connect();
    }

    sendMessage(message) {
        if (!this.socket) {
            return;
        }
        this.socket.send(JSON.stringify({
            action: 'sendmessage',
            data: message
        }));
    }
}

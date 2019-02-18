import { observable, action, decorate } from 'mobx';
import SocketManager from '../../app/sockets/SocketManager';

class ControllerStore {
    constructor() {
        const url = new URL(window.location.href);
        const session = url && url.searchParams && url.searchParams.get('session');

        this.session = session || '';

        this.position = 'sit';
        this.frame = 1;
        this.mode = 'training';

        this.socketManager = null;
    }

    setPosition(position) {
        this.position = position;
        this.frame++;

        if (this.socketManager) {
            let message = `${this.position}|${this.frame}`;
            if (this.session) {
                message += `|${this.session}`;
            }
            this.socketManager.sendMessage(message);
        }
    }

    startController() {
        this.mode = 'controller';
        this.frame = 1;

        this.socketManager = new SocketManager();
        this.socketManager.startController();
    }
}

decorate(ControllerStore, {
    position: observable,
    frame: observable,
    mode: observable,
    setPosition: action,
    startController: action

});

const instance = new ControllerStore();
export default instance;

import GameEngine from './engine';
import OfficeScene from './scene';
import GameStore from '../store/gameStore';
import SocketManager from '../sockets/SocketManager';

class Game {
    constructor() {
        this._canvas = null;
        this.scene = null;
        this.store = GameStore;
        this.socketManager = new SocketManager(GameStore);
    }

    start(canvas) {
        this._canvas = canvas;
         // start the game engine
        GameEngine.start(canvas);

        // build out the first scene
        this.scene = new OfficeScene(this.store);

        // setup websockets
        this.socketManager.startReceiver();

        window.addEventListener('resize', function() {
            GameEngine.engine.resize();
        });

        this.run();
    }

    run() {
        GameEngine.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
}

const instance = new Game();
export default instance;

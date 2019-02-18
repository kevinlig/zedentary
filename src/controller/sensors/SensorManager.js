class SensorManager {
    constructor() {
        this.orientation = {
            alpha: 0,
            beta: 0,
            gamma: 0
        };

        this.accel = {
            x: 0,
            y: 0,
            z: 0
        };

        this.started = false;

        this._processOrientation = this._processOrientation.bind(this);
        this._processAcceleration = this._processAcceleration.bind(this);

        this.classifier = null;
    }

    start() {
        if (this.started) {
            return;
        }

        this.started = true;
        window.addEventListener('deviceorientation', this._processOrientation, true);
        window.addEventListener('devicemotion', this._processAcceleration, true);
    }

    stop() {
        if (!this.started) {
            return;
        }

        window.removeEventListener('deviceorientation', this._processOrientation, true);
        window.removeEventListener('devicemotion', this._processAcceleration, true);
        this.started = false;
    }

    _processOrientation(e) {
        this.orientation = {
            alpha: e.alpha,
            beta: e.beta,
            gamma: e.gamma,

        };
    }

    _processAcceleration(e) {
        const accel = e.accelerationIncludingGravity;
        this.accel = {
            x: accel.x,
            y: accel.y,
            z: accel.z
        };
    }

}

const instance = new SensorManager();
export default instance;
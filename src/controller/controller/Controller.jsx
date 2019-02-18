import React from 'react';
import SensorManager from '../sensors/SensorManager';
import ControllerStore from '../store/controllerStore';

export default class Controller extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sit: 0,
            stand: 0
        };

        this.lastFive = [];

        this.monitor = this.monitor.bind(this);
    }

    componentDidMount() {
        SensorManager.start();
        window.requestAnimationFrame(this.monitor)
    }

    monitor() {
        window.requestAnimationFrame(this.monitor);
        const accel = SensorManager.accel;
        const frameOutput = SensorManager.classifier.run({
            x: accel.x,
            y: accel.y,
            z: accel.z
        });

        let averageOutput;
        if (this.lastFive.length < 5) {
            this.lastFive.push(frameOutput);
            return;
        }
        else {
            averageOutput = {
                sit: this.lastFive.reduce((sum, itm) => itm.sit + sum, 0) / this.lastFive.length,
                stand: this.lastFive.reduce((sum, itm) => itm.stand + sum, 0) / this.lastFive.length
            };
            this.lastFive = [];
        }

        this.setState({
            sit: averageOutput.sit,
            stand: averageOutput.stand
        });

        let result = 'sit';
        if (averageOutput.stand > averageOutput.sit) {
            result = 'stand';
        }

        // must be at least 70% sure to change
        if (result !== this.props.store.position && averageOutput[result] >= 0.7) {
            this.props.store.setPosition(result);
        }
    }

    render() {
        return (
            <div id="controller">
                <div className="subheader">Controller Mode</div>
                <h1>Detected Position: {this.props.store.position}</h1>
                <ul className="probabilities">
                    <li>
                        Sit: {Math.round(this.state.sit * 1000) / 10}%
                    </li>
                    <li>
                        Stand: {Math.round(this.state.stand * 1000) / 10}%
                    </li>
                </ul>
            </div>
        );
    }
}

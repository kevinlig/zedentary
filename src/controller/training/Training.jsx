import React from 'react';
import { Howl } from 'howler';
import { NeuralNetwork } from 'brain.js';
import NoSleep from 'nosleep.js';

import SensorManager from '../sensors/SensorManager';
import ControllerStore from '../store/controllerStore';

const POSITIONS = ['sit', 'stand'];
const startChime = new Howl({
    src: ['sounds/start.m4a']
});
const endChime = new Howl({
    src: ['sounds/stop.m4a']
});
const noSleep = new NoSleep();


class RestoreModel extends React.Component {
    clickedButton() {
        noSleep.enable();
        const rawModel = JSON.parse(this.props.raw);
        const model = new NeuralNetwork();
        model.fromJSON(rawModel);
        SensorManager.classifier = model;
        ControllerStore.startController();
    }

    render() {
        return (
            <div className="restore">
                <p>
                    It looks like you've previously trained a model. You can re-use this model instead of training a new one.
                </p>
                <button onClick={this.clickedButton.bind(this)}>
                    Use previously trained model
                </button>
            </div>
        );
    }
}

class Training extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            didInit: false,
            posIndex: 0,
            disabledButton: false,
            buttonLabel: 'Start Training'
        };

        this.trainingData = {};

        this.clickedStart = this.clickedStart.bind(this);
        this.startCollection = this.startCollection.bind(this);
        this.endCollection = this.endCollection.bind(this);
        this.collectData = this.collectData.bind(this);
        this.performTraining = this.performTraining.bind(this);
    }

    clickedStart() {
        if (!this.state.didInit) {
            SensorManager.start();
            noSleep.enable();
        }

        window.setTimeout(() => {
            this.startCollection();
        }, 5000);

        this.setState({
            didInit: true,
            disabledButton: true,
            buttonLabel: 'Started...'
        });
    }

    startCollection() {
        startChime.play();
    
        // start collecting data
        window.requestAnimationFrame(this.collectData);
    }

    collectData() {
        const type = POSITIONS[this.state.posIndex];
        if (!this.trainingData[type]) {
            this.trainingData[type] = [];
        }

        if (SensorManager.started) {
            this.trainingData[type].push(SensorManager.accel)
        }

        if (this.trainingData[type].length >= 600) {
            this.endCollection();
        }
        else {
            window.requestAnimationFrame(this.collectData);
        }
    }

    endCollection() {
        endChime.play();
        if (this.state.posIndex + 1 < POSITIONS.length) {
            // there are more positions to train
            this.setState({
                posIndex: this.state.posIndex + 1,
                buttonLabel: 'Start Training',
                disabledButton: false
            });
        }
        else {
            this.performTraining();
        }
    }

    performTraining() {
        this.setState({
            buttonLabel: 'Training model...',
            disabledButton: true
        });

        const model = new NeuralNetwork();
        const modelData = [];
        POSITIONS.forEach((pos, idx) => {
            this.trainingData[pos].forEach((item) => {
                modelData.push({
                    input: {
                        x: item.x,
                        y: item.y,
                        z: item.z
                    },
                    output: {
                        stand: idx === 0 ? 0 : 1,
                        sit: idx === 0 ? 1 : 0
                    }
                });
            });
        });

        model.trainAsync(modelData)
            .then(() => {
                console.log('Model ready...');
                SensorManager.classifier = model;
                // save the model to localstorage
                const rawModel = model.toJSON();
                window.localStorage.setItem('model', JSON.stringify(rawModel));
                ControllerStore.startController();
            });
    }

    render() {
        let restoreOption = null;
        const savedModel = window.localStorage.getItem('model');
        if (savedModel) {
            restoreOption = (
                <RestoreModel raw={savedModel} />
            );
        }
        return (
            <div id="training">
                <div className="subheader">Training Mode</div>
                {restoreOption}
                <h1>Position: {POSITIONS[this.state.posIndex]}</h1>
                <button onClick={this.clickedStart} disabled={this.state.disabledButton}>
                    {this.state.buttonLabel}
                </button>
                <p>
                    In order to sync with your Zedentary avatar, this controller app needs to learn how your body moves.
                </p>
                <p>
                    Press the start button and, within 5 seconds, place your phone in your pocket and assume the position indicated. A chime will play when data recording begins. Remain in position until you hear a second chime (after about 10 seconds).
                </p>
                <p>
                    Make sure you place your phone in the same pocket each time with the same orientation (facing away from you with the charging port facing out of your pocket is recommended). Don't turn off your phone screen.
                </p>
                <p>
                    Once all your data is collected, the machine learning model will be trained. This process might take several minutes.
                </p>
            </div>
        );
    }
}

export default Training;
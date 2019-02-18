import * as BABYLON from 'babylonjs';
import { find as _find } from 'lodash';
import { observe } from 'mobx';
import GameEngine from '../engine';
import { degToRad } from '../engine/utils';
import Emitter from './emitter';

const MODEL_FRAME_RATE = 30;

export default class GameScene {
    constructor(store) {
        this.store = store;
        this._internalMeshes = {};
        this._animations = {};
        this._transition = {
            callback: null,
            targetWeight: 0
        };

        this._lastPosition = 'sit';

        const scene = new BABYLON.Scene(GameEngine.engine);
        scene.clearColor = new BABYLON.Color3(0.75, 0.75, 0.75);
        scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        scene.fogStart = 8;
        scene.fogEnd = 10;
        scene.fogColor = new BABYLON.Color3(0.75, 0.75, 0.75);
        const camera = new BABYLON.UniversalCamera('Camera', new BABYLON.Vector3(0, 2, -4), scene);
        camera.setTarget(new BABYLON.Vector3(0, 1.6, 0));


        this.scene = scene;
        this.camera = camera;

        this._setupLights();

        // set up the basic environment
        this._buildOffice();

        this._loadMeshes()
            .then(() => {
                // we finished loading
                this.store.setLoaded(true);
                this._attachObservers();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    render() {
        this.scene.render();
    }

    _setupLights() {
        const keyLight = new BABYLON.SpotLight('keyLight', new BABYLON.Vector3(5, 10, -5), BABYLON.Vector3.Zero(), Math.PI / 2, 1, this.scene);
        keyLight.setDirectionToTarget(new BABYLON.Vector3(0, 0, 0));
        keyLight.intensity = 0.6;

        const fillLight = new BABYLON.SpotLight('fillLight', new BABYLON.Vector3(-5, 7, -10), BABYLON.Vector3.Zero(), Math.PI / 2, 10, this.scene);
        fillLight.setDirectionToTarget(new BABYLON.Vector3(0, 0, 0));
        fillLight.intensity = 0.4;
        
        const backLight = new BABYLON.SpotLight('backLight', new BABYLON.Vector3(0, 10, 5), BABYLON.Vector3.Zero(), Math.PI / 2, 10, this.scene);
        backLight.setDirectionToTarget(new BABYLON.Vector3(0, 0, 0));
        backLight.intensity = 0.2;

        const ambientLight = new BABYLON.HemisphericLight('ambient', new BABYLON.Vector3(0, 0, 0), this.scene);
        ambientLight.intensity = 0.2;

        this.shadowGenerator = new BABYLON.ShadowGenerator(1024, keyLight);
        this.shadowGenerator.usePercentageCloserFiltering = true;
    }

    _buildOffice() {
        const floor = BABYLON.MeshBuilder.CreatePlane('floor', { width: 20, height: 20 }, this.scene);
        floor.rotation.x = degToRad(90);
        floor.receiveShadows = true;
        const chair = BABYLON.MeshBuilder.CreateCylinder('chair', { diameter: 0.51, height: 0.9 }, this.scene);
        this.shadowGenerator.addShadowCaster(chair);

        this._internalMeshes.floor = floor;
        this._internalMeshes.chair = chair;
    }

    _loadMeshes() {
        const meshes = [
            {
                mesh: 'Character',
                path: './assets/robot/',
                file: 'robot.gltf',
                parser: this._parseAvatar.bind(this)
            },
            {
                mesh: 'Coin',
                path: './assets/coin_up/',
                file: 'coin_up.gltf',
                parser: this._parseCoin.bind(this, 'coin_up')
            },
            {
                mesh: 'Coin',
                path: './assets/coin_down/',
                file: 'coin_down.gltf',
                parser: this._parseCoin.bind(this, 'coin_down')
            },
            {
                mesh: 'Desk',
                path: './assets/desk/',
                file: 'desk.gltf',
                parser: this._parseDesk.bind(this)
            },
            {
                mesh: 'Laptop',
                path: './assets/laptop/',
                file: 'laptop.gltf',
                parser: this._parseLaptop.bind(this)
            }
        ];

        const operations = meshes.map((req) => {
            return BABYLON.SceneLoader.ImportMeshAsync(
                [req.mesh],
                req.path,
                req.file,
                this.scene
            );
        });

        return new Promise((resolve, reject) => {
            Promise.all(operations)
                .then((responses) => {
                    responses.forEach((meshData, idx) => {
                        const request = meshes[idx];
                        if (request.parser) {
                            request.parser(meshData);
                        }
                    });

                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    _parseAvatar(data) {
        this._skeleton = data.skeletons[0];

        // NOTE: we need to keep the two animations the same length
        // Babylon uses fps-based frames (seconds?), so we need to convert the Blender frames into seconds
        const standAnim = this.scene.beginWeightedAnimation(this._skeleton, 0, (120 / MODEL_FRAME_RATE), 0, true, 0.5);
        const sitAnim = this.scene.beginWeightedAnimation(this._skeleton, (265 / MODEL_FRAME_RATE), (385 / MODEL_FRAME_RATE), 1, true, 0.5);

        this._animations.stand = standAnim;
        this._animations.sit = sitAnim;
       

        data.meshes.forEach((mesh) => {
            if (mesh.material) {
                // imported model is using PBR, use standard Babylon lighting falloff instead
                mesh.material.usePhysicalLightFalloff = false;
            }
        });

        // rotate the character
        const character = _find(data.meshes, { name: '__root__' });
        character.rotation.y = degToRad(180);
        character.position.z = 0.3;
        this.shadowGenerator.addShadowCaster(character);
        
        // save a reference to the character mesh
        this._internalMeshes.character = character;
    }

    _parseCoin(type, data) {
        // set the material to unlit
        data.meshes.forEach((mesh) => {
            if (mesh.material) {
                // imported model is using PBR, use standard Babylon lighting falloff instead
                mesh.material.usePhysicalLightFalloff = false;
                mesh.material.unlit = true;
            }
        })

        const rootMesh = _find(data.meshes, { name: 'Coin' });
        // hide the mesh
        rootMesh.setEnabled(false);
        // save a reference for later
        this._internalMeshes[type] = rootMesh;

        const emitter = new Emitter({
            type: type,
            direction: 'up',
            mesh: rootMesh,
            scene: this.scene,
            position: {
                x: type === 'coin_up' ? 2 : -2,
                y: 0,
                z: -0.55
            }
        });
        this._internalMeshes[`emitter_${type}`] = emitter;
    }

    _parseDesk(data) {
        const rootMesh = _find(data.meshes, { name: 'Desk' });
        rootMesh.position.z = 1;

        data.meshes.forEach((mesh) => {
            if (mesh.material) {
                // imported model is using PBR, use standard Babylon lighting falloff instead
                mesh.material.usePhysicalLightFalloff = false;
            }
        });

        this.shadowGenerator.addShadowCaster(rootMesh);
    }

    _parseLaptop(data) {
        const rootMesh = _find(data.meshes, { name: 'Laptop' });
        rootMesh.position.y = 0.76;
        rootMesh.position.x = 0.5;
        rootMesh.position.z = 1;
        rootMesh.rotation.y = degToRad(20);

        data.meshes.forEach((mesh) => {
            if (mesh.material) {
                // imported model is using PBR, use standard Babylon lighting falloff instead
                mesh.material.usePhysicalLightFalloff = false;
            }
        });
    }

    _transitionState(newState) {
        if (this._transition.callback) {
            // another animation is progress, cancel it
            this.scene.onBeforeAnimationsObservable.remove(this._transition.callback);
        }

        const dest = newState === 'sit' ? 'sit' : 'stand';
        const src = newState === 'sit' ? 'stand' : 'sit';

        this._transition.callback = this.scene.onBeforeAnimationsObservable.add(() => {
            if (this._transition.targetWeight >= 1) {
                this.scene.onBeforeAnimationsObservable.remove(this._transition.callback);
                this._transition.targetWeight = 0;
            }
            else {
                this._transition.targetWeight += 0.05;
                this._animations[dest].weight = this._transition.targetWeight;
                this._animations[src].weight = 1 - this._transition.targetWeight;
            }

        });
    }

    _attachObservers() {
        observe(this.store, 'position', (change) => {
            if (change.type === 'update') {
                this._transitionState(this.store.position);
                this._lastPosition = this.store.position;

                if (this.store.mode === 'joke') {
                    if (this.store.position === 'sit') {
                        this._internalMeshes.emitter_coin_down.stop();
                        this._internalMeshes.emitter_coin_up.start();
                    }
                    else {
                        this._internalMeshes.emitter_coin_down.start();
                        this._internalMeshes.emitter_coin_up.stop();
                    }
                }
            }
        });

        observe(this.store, 'mode', (change) => {
            if (change.type === 'update') {
                // kill any emitters
                this._internalMeshes.emitter_coin_down.stop();
                this._internalMeshes.emitter_coin_up.stop();
            }
        });

        observe(this.store, 'lives', (change) => {
            if (change.type === 'update' && this.store.lives === 0 && this.store.mode === 'game') {
                this._internalMeshes.emitter_coin_down.start();
                this._internalMeshes.emitter_coin_up.stop();
            }
        });
    }

}

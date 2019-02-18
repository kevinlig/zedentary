// based on https://www.babylonjs-playground.com/#WCDZS#1
import {
    SceneLoader,
    SolidParticleSystem
} from 'babylonjs';
import {
    find as _find
} from 'lodash';

const GRAVITY = -0.001;
const SPEED = 0.04;
const PARTICLE_COUNT = 15;

export default class Emitter {
    constructor(config) {
        this.type = config.type;
        this.mesh = config.mesh;
        this.direction = config.direction;
        this.scene = config.scene;
        this.position = {
            x: config.position.x || 0,
            y: config.position.y || 0,
            z: config.position.z || 0            
        };
    }

    setupParticles() {
        // create an enabled instance of the particle to be emitted
        const particleInstance = this.mesh.createInstance(`particle_${this.type}`);
        particleInstance.setEnabled(true);

        this.emitter = new SolidParticleSystem(`emitter_${this.type}`, this.scene);
        this.emitter.addShape(particleInstance, 15);
        // always face the camera
        this.emitter.billboard = true;

        this.emitterMesh = this.emitter.buildMesh();
        this.emitterMesh.position.x = this.position.x;
        this.emitterMesh.position.y = this.position.y;
        this.emitterMesh.position.z = this.position.z;
        this.emitterMesh.material = this.mesh.material;

        // we don't need the particle any more
        particleInstance.dispose();

        // setup lifecycle methods on the emitter
        this.emitter.initParticles = this.initParticles.bind(this);
        this.emitter.recycleParticle = this.recycleParticle.bind(this);
        this.emitter.updateParticle = this.updateParticle.bind(this);

        this.render = () => {
            this.emitter.setParticles();
        }
    }

    start() {
        this.setupParticles();
        this.emitter.initParticles();
        this.emitter.setParticles();
        this.scene.registerBeforeRender(this.render);
    }

    stop() {
        if (!this.emitterMesh || !this.emitter) {
            return;
        }
        this.scene.unregisterBeforeRender(this.render);
        this.emitterMesh.dispose();
        this.emitterMesh = null;
        this.emitter.dispose();
        this.emitter = null;
    }

    initParticles() {
        // just recycle everything
        for (var p = 0; p < this.emitter.nbParticles; p++) {
            this.recycleParticle(this.emitter.particles[p]);
        }
    }

    removeParticles() {
        this.emitter.particles.forEach((particle) => {
            particle.setEnabled(false);
        });
    }

    // recycle
    recycleParticle(particle) {
        // Set particle new velocity, scale and rotation
        // As this function is called for each particle, we don't allocate new
        // memory by using "new BABYLON.Vector3()" but we set directly the
        // x, y, z particle properties instead

        var directionModifier = this.direction === 'down' ? 1 : -1;

        particle.position.x = 0;
        particle.position.y = 0;
        particle.position.z = 0;
        particle.velocity.x = (Math.random() - 0.5) *  SPEED;
        particle.velocity.y = -Math.random() * SPEED * directionModifier;

        var scale = Math.random() + 0.5;
        particle.scale.x = scale;
        particle.scale.y = scale;
        particle.scale.z = scale;
        particle.rotation.y = Math.random() * 3.5;
    }

    // update : will be called by setParticles()
    updateParticle(particle) {  
        // some physics here 
        var directionModifier = this.direction === 'down' ? 1 : -1;
        var currentY = particle.position.y;

        if (this.direction === 'down') {
            if (currentY < this.emitterMesh.position.y * -1) {
                this.recycleParticle(particle);
            }
        }
        else {
            if (currentY > 4) {
                this.recycleParticle(particle);
            }
        }

        particle.velocity.y += GRAVITY * directionModifier;                         // apply gravity to y
        (particle.position).addInPlace(particle.velocity);      // update particle new position
        particle.position.y -= (SPEED * directionModifier) / 2;

        var sign = (particle.idx % 2 == 0) ? 1 : -1;            // rotation sign and new value
        particle.rotation.x += 0.05 * sign;
        particle.rotation.y += 0.008 * sign;
    }
}

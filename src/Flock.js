/**
 * @class Flock
 * handles flocking behavior
 */
class Flock {

    constructor(currentAgent) {
        this.currentAgent = currentAgent;
        this.wandertheta = 0;
    }

    /**
     * @method seek()
     * @param {*} target
     * simple method to seek something
     */
    seek(target) {
        let desired = null;
        desired = Vector.sub(target, this.currentAgent.pos);
        desired.normalize();
        desired.mult(this.currentAgent.maxSpeed);
        let steer = Vector.sub(desired, this.currentAgent.vel);
        steer.limit(this.currentAgent.maxForce);
        return steer.mult(2);
    }

    /**
     * @method flee()
     * @param {*} target
     * simple method to flee something
     */
    flee(target) {
        let desired = null;
        let d = Vector.dist(this.currentAgent.pos, target);
        if (d < FLEE_RADIUS) {
            desired = Vector.sub(target, this.currentAgent.pos);
            desired.normalize();
            desired.mult(this.currentAgent.maxSpeed);
            let steer = Vector.sub(desired, this.currentAgent.vel);
            steer.limit(this.currentAgent.maxForce);
            return steer.mult(-1);
        } else {
            return new Vector(0, 0);
        }
    }

    _returnSteer(sum) {
        sum.normalize();
        sum.mult(this.currentAgent.maxSpeed);
        let steer = Vector.sub(sum, this.currentAgent.vel);
        steer.limit(this.currentAgent.maxForce);
        return steer;
    }

    wander() {
        let wanderR = 100;
        let wanderD = 80;
        let change = 0.1;
        this.wandertheta += -change + Math.random() * change;

        // Now we have to calculate the new location to steer towards on the wander circle
        let circleloc = this.currentAgent.vel.copy();
        circleloc.normalize();
        circleloc.mult(wanderD);
        circleloc.add(this.currentAgent.pos);

        let h = this.currentAgent.vel.heading();

        let circleOffset = new Vector(wanderR * Math.cos(this.wandertheta + h), wanderR * Math.sin(this.wandertheta + h));
        let target = Vector.add(circleloc, circleOffset);

        // SEEK (have to make the seek function generic)
        let desired = null;
        desired = Vector.sub(target, this.currentAgent.pos);
        desired.normalize();
        desired.mult(this.currentAgent.maxSpeed);
        let steer = Vector.sub(desired, this.currentAgent.vel);
        steer.limit(this.currentAgent.maxForce);
        return steer;
    }

    /**
     * @method separate()
     * @param {Array} agents
     * part of flocking system
     */
    separate(agents) {
        let desiredseparation = this.currentAgent.radius * GLOBAL_MULTIPLIER.separateRadius || 4;
        let sum = new Vector();
        let count = 0;
        for (let i = 0; i < agents.length; i++) {
            let d = Vector.distSq(this.currentAgent.pos, agents[i].pos);
            if ((d > 0) && (d < desiredseparation * desiredseparation)) {
                let diff = Vector.sub(this.currentAgent.pos, agents[i].pos);
                diff.normalize();
                diff.div(d);
                sum.add(diff);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            return this._returnSteer(sum);
        }
        return new Vector(0, 0);
    }

    align(agents) {
        let neighbordist = 50;
        let sum = new Vector(0, 0);
        let count = 0;
        for (let i = 0; i < agents.length; i++) {
            let d = Vector.distSq(this.currentAgent.pos, agents[i].pos);
            if ((d > 0) && (d < neighbordist * neighbordist)) {
                sum.add(agents[i].vel);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            return this._returnSteer(sum);
        }
        return new Vector(0, 0);
    }

    /**
     * @method cohesion()
     * @param {Array} agents
     * part of flocking system
     */
    cohesion(agents) {
        let neighbordist = 30;
        let sum = new Vector(0, 0);
        let count = 0;
        for (let i = 0; i < agents.length; i++) {
            let d = Vector.distSq(this.currentAgent.pos, agents[i].pos);
            if ((d > 0) && (d < neighbordist * neighbordist)) {
                sum.add(agents[i].pos);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            sum.sub(this.currentAgent.pos);
            return this._returnSteer(sum);
        }
        return new Vector(0, 0);
    }
}

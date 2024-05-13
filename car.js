class Car {
    // x and y are with respect to origin at top left corner
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = 3;
        this.friction = 0.05;

        this.yaw = 0;

        this.damaged = false;

        this.sensor = new Sensor(this);
        this.controls = new Controls();
    }

    update(roadBorders) {
        if (!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders);
        }
        this.sensor.update(roadBorders);
    }

    #assessDamage(roadBorders) {
        for(let i = 0; i < roadBorders.length; i++) {
            if (polysIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        return false;
    }

    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width, this.height)/2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x: this.x - Math.sin(this.yaw - alpha)*rad,
            y: this.y - Math.cos(this.yaw - alpha)*rad
        });
        points.push({
            x: this.x - Math.sin(this.yaw + alpha)*rad,
            y: this.y - Math.cos(this.yaw + alpha)*rad
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.yaw - alpha)*rad,
            y: this.y - Math.cos(Math.PI + this.yaw - alpha)*rad
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.yaw + alpha)*rad,
            y: this.y - Math.cos(Math.PI + this.yaw + alpha)*rad
        });

        return points;
    }

    #move() {
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }

        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }
        
        // Set limits
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if (this.speed < -this.maxSpeed / 2) {
            this.speed = -this.maxSpeed / 2;
        }

        // Apply friction
        if (this.speed > 0) {
            this.speed -= this.friction;
        }
        if (this.speed < 0) {
            this.speed += this.friction;
        }

        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }

        if (this.speed !=0) {
            const flip = this.speed > 0 ? 1 : -1;
            if (this.controls.left) {
                this.yaw += 0.03 * flip;
            }
            if (this.controls.right) {
                this.yaw -= 0.03 * flip;
            }
        }
        
        this.x -= Math.sin(this.yaw) * this.speed;
        this.y -= Math.cos(this.yaw) * this.speed;
    }

    draw(ctx) {
        if (this.damaged) {
            ctx.fillStyle = "gray";
        } else {
            ctx.fillStyle = "black";
        }

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
        }
        ctx.fill();

        this.sensor.draw(ctx);
    }
}
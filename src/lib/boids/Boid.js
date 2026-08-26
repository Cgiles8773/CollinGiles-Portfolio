// https://vanhunteradams.com/Pico/Animal_Movement/Boids-algorithm.html
export class Boid {

    constructor(turnFactor, centeringFactor, avoidFactor, matchingFactor, maxSpeed, minSpeed, leftMargin, rightMargin, bottomMargin, topMargin)
    {
        this.turnFactor = turnFactor;
        this.centeringFactor = centeringFactor;
        this.avoidFactor = avoidFactor;
        this.matchingFactor = matchingFactor;
        this.maxSpeed = maxSpeed;
        this.minSpeed = minSpeed;
        this.leftMargin = leftMargin;
        this.rightMargin = rightMargin;
        this.bottomMargin = bottomMargin;
        this.topMargin = topMargin;
    }

    static fromBlueprint(visibility, protection, blueprint, x, y, bias, id)
    {
        const boid = new Boid(
            blueprint.turnFactor,
            blueprint.centeringFactor,
            blueprint.avoidFactor,
            blueprint.matchingFactor,
            blueprint.maxSpeed,
            blueprint.minSpeed,
            blueprint.leftMargin,
            blueprint.rightMargin,
            blueprint.bottomMargin,
            blueprint.topMargin
        );
        boid.visRange = visibility;
        boid.protRange = protection;
        boid.x = x;
        boid.y = y;
        boid.vx = 0;
        boid.vy = 0;
        boid.id = id;
        boid.biasValue = bias;
        boid.attractRange = blueprint.attractRange;
        boid.attractFactor = blueprint.attractFactor;
        return boid;
    }

    update(grid, cellSize, mouse)
    {
        let neighbors = this.findNeighbors(grid, cellSize);

        this.separation(neighbors[1]);
        this.alignment(neighbors[0]);
        this.cohesion(neighbors[0]);
        this.marginCheck();
        this.bias();
        this.attract(mouse);
        this.speedLimit();
        this.x += this.vx;
        this.y += this.vy;
        return this
    }

    findNeighbors(grid, cellSize)
    {
        const visualNeighbors = [];
        const protNeighbors = [];
        const col = Math.floor(this.x / cellSize);
        const row = Math.floor(this.y / cellSize);
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const cell = grid.get(`${col + dc},${row + dr}`);
                if (!cell) continue;
                for (const boid of cell) {
                    if (boid.id === this.id) continue;
                    const dx = this.x - boid.x;
                    const dy = this.y - boid.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < this.visRange * this.visRange) {
                        if (distSq < this.protRange * this.protRange) {
                            protNeighbors.push(boid);
                            continue;
                        }
                        visualNeighbors.push(boid);
                    }
                }
            }
        }
        return [visualNeighbors, protNeighbors];
    }

    separation(protNeighbors)
    {
        if(protNeighbors.length == 0)
            return;
        let dx = 0;
        let dy = 0;
        for (const boid of protNeighbors)
        {
            dx += this.x - boid.x;
            dy += this.y - boid.y;
        }
        this.vx += dx*this.avoidFactor;
        this.vy += dy*this.avoidFactor;
    }

    alignment(visibleNeighbors)
    {
        if (visibleNeighbors.length == 0)
            return;
        let vx_avg = 0;
        let vy_avg = 0;
        for (const boid of visibleNeighbors)
        {
            vx_avg += boid.vx;
            vy_avg += boid.vy;
        }
        vx_avg /= visibleNeighbors.length;
        vy_avg /= visibleNeighbors.length;
        this.vx += (vx_avg - this.vx)*this.matchingFactor;
        this.vy += (vy_avg - this.vy)*this.matchingFactor;
    }

    cohesion(visibleNeighbors)
    {
        if (visibleNeighbors.length == 0)
            return;
        let x_avg = 0;
        let y_avg = 0;
        for (const boid of visibleNeighbors)
        {
            x_avg += boid.x;
            y_avg += boid.y;
        }
        x_avg /= visibleNeighbors.length;
        y_avg /= visibleNeighbors.length;
        this.vx += (x_avg - this.x)*this.centeringFactor;
        this.vy += (y_avg - this.y)*this.centeringFactor;
    }

    marginCheck()
    {
        if (this.x < this.leftMargin)
        {
            this.vx += this.turnFactor;
        }
        if (this.x > this.rightMargin)
        {
            this.vx -= this.turnFactor;
        }
        if (this.y > this.bottomMargin)
        {
            this.vy -= this.turnFactor;
        }
        if(this.y < this.topMargin)
        {
            this.vy += this.turnFactor;
        }
    }

    attract(mouse)
    {
        if (!mouse || mouse.x === null)
            return;
        if(!mouse.active)
        {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distSq = dx * dx + dy * dy;
            if (distSq > this.attractRange * this.attractRange)
                return;
            this.vx -= dx * this.attractFactor;
            this.vy -= dy * this.attractFactor;
        }
        else
        {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distSq = dx * dx + dy * dy;
            if (distSq > this.attractRange * this.attractRange)
                return;
            this.vx += dx * this.attractFactor;
            this.vy += dy * this.attractFactor;
        }
    }

    bias()
    {
        this.vx = (1-this.biasValue)*this.vx+(this.biasValue);
    }

    speedLimit()
    {
        const speed = Math.sqrt((this.vx*this.vx) + (this.vy*this.vy));
        if (speed == 0)
            return;
        if (speed > this.maxSpeed)
        {
            this.vx = (this.vx/speed)*this.maxSpeed;
            this.vy = (this.vy/speed)*this.maxSpeed;
        }
        if (speed < this.minSpeed)
        {
            this.vx = (this.vx/speed)*this.minSpeed;
            this.vy = (this.vy/speed)*this.minSpeed;
        }
    }
}

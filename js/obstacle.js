class Obstacle {
    constructor(canvas, speed) {
        this.canvas = canvas;
        this.speed = speed;
        this.width = 30 + Math.random() * 20;
        this.height = 40 + Math.random() * 30;
        this.x = canvas.width;
        
        // Random height position
        this.type = Math.random() > 0.5 ? 'ground' : 'air';
        if (this.type === 'ground') {
            this.y = canvas.height - 20 - this.height;
        } else {
            this.y = 80 + Math.random() * 100;
        }
        
        this.color = '#e94560';
    }

    update() {
        this.x -= this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw warning stripe pattern
        ctx.fillStyle = '#ff6b7a';
        for (let i = 0; i < this.height; i += 10) {
            ctx.fillRect(this.x, this.y + i, this.width, 5);
        }
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    getCollisionBox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class ObstacleManager {
    constructor(canvas, speed) {
        this.canvas = canvas;
        this.baseSpeed = speed;
        this.obstacles = [];
        this.spawnRate = 120; // Frames between spawns
        this.frameCount = 0;
    }

    update() {
        this.frameCount++;
        
        // Spawn new obstacles
        if (this.frameCount >= this.spawnRate) {
            this.obstacles.push(new Obstacle(this.canvas, this.baseSpeed));
            this.frameCount = 0;
        }

        // Update and remove off-screen obstacles
        this.obstacles = this.obstacles.filter(obs => {
            obs.update();
            return !obs.isOffScreen();
        });
    }

    draw(ctx) {
        this.obstacles.forEach(obs => obs.draw(ctx));
    }

    getObstacles() {
        return this.obstacles;
    }

    increaseSpeed(amount) {
        this.baseSpeed += amount;
        this.obstacles.forEach(obs => {
            obs.speed = this.baseSpeed;
        });
    }

    increaseDifficulty() {
        this.spawnRate = Math.max(60, this.spawnRate - 5);
    }
}

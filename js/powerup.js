class PowerUp {
    constructor(canvas, speed) {
        this.canvas = canvas;
        this.speed = speed;
        this.width = 20;
        this.height = 20;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - 100) + 50;
        this.type = Math.random() > 0.5 ? 'speed' : 'invincibility';
        this.rotation = 0;
    }

    update() {
        this.x -= this.speed;
        this.rotation += 0.1;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);

        if (this.type === 'speed') {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(10, 0);
            ctx.lineTo(0, 10);
            ctx.lineTo(-10, 0);
            ctx.fill();
        } else {
            ctx.fillStyle = '#00FF00';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#00DD00';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.restore();
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

class PowerUpManager {
    constructor(canvas, speed) {
        this.canvas = canvas;
        this.baseSpeed = speed;
        this.powerups = [];
        this.spawnRate = 300; // Frames between spawns
        this.frameCount = 0;
    }

    update() {
        this.frameCount++;
        
        // Spawn new power-ups
        if (this.frameCount >= this.spawnRate) {
            this.powerups.push(new PowerUp(this.canvas, this.baseSpeed));
            this.frameCount = 0;
        }

        // Update and remove off-screen power-ups
        this.powerups = this.powerups.filter(pu => {
            pu.update();
            return !pu.isOffScreen();
        });
    }

    draw(ctx) {
        this.powerups.forEach(pu => pu.draw(ctx));
    }

    getPowerUps() {
        return this.powerups;
    }

    increaseSpeed(amount) {
        this.baseSpeed += amount;
        this.powerups.forEach(pu => {
            pu.speed = this.baseSpeed;
        });
    }
}

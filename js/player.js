class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = 50;
        this.y = canvas.height - 100;
        this.width = 40;
        this.height = 50;
        this.velocityY = 0;
        this.jumpPower = -15;
        this.gravity = 0.6;
        this.isJumping = false;
        this.isDucking = false;
        this.color = '#00d4ff';
        this.invincible = false;
        this.invincibleTime = 0;
    }

    update() {
        // Apply gravity
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // Ground collision
        if (this.y + this.height >= this.canvas.height - 20) {
            this.y = this.canvas.height - 20 - this.height;
            this.velocityY = 0;
            this.isJumping = false;
        }

        // Update invincibility
        if (this.invincible) {
            this.invincibleTime--;
            if (this.invincibleTime <= 0) {
                this.invincible = false;
            }
        }
    }

    jump() {
        if (!this.isJumping && !this.isDucking) {
            this.velocityY = this.jumpPower;
            this.isJumping = true;
        }
    }

    duck() {
        if (!this.isJumping) {
            this.isDucking = true;
        }
    }

    stopDuck() {
        this.isDucking = false;
    }

    draw(ctx) {
        // Draw player with invincibility effect
        if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        ctx.fillStyle = this.color;
        
        if (this.isDucking) {
            // Draw ducking player
            ctx.fillRect(this.x, this.y + 25, this.width, this.height - 25);
            ctx.fillRect(this.x - 5, this.y + 30, this.width + 10, 10);
        } else {
            // Draw standing player
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Head
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y - 10, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1.0;
    }

    getCollisionBox() {
        if (this.isDucking) {
            return {
                x: this.x,
                y: this.y + 25,
                width: this.width,
                height: this.height - 25
            };
        }
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

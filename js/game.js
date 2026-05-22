const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'start'; // 'start', 'playing', 'gameOver'
let player;
let obstacleManager;
let powerUpManager;
let score = 0;
let highScore = localStorage.getItem('nbiEscapeHighScore') || 0;
let distance = 0;
let gameSpeed = 5;
let frameCount = 0;
let speedBoostActive = false;
let speedBoostTime = 0;

const BASE_SPEED = 5;
const MAX_SPEED = 12;

// Update high score display
document.getElementById('highScore').textContent = `High Score: ${highScore}`;

// Keyboard controls
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (gameState === 'playing') {
            player.jump();
        }
    }
    
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (gameState === 'playing') {
            player.duck();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    
    if (e.key === 'ArrowDown') {
        if (gameState === 'playing') {
            player.stopDuck();
        }
    }
});

// Mouse controls for mobile
canvas.addEventListener('click', () => {
    if (gameState === 'playing') {
        player.jump();
    }
});

function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    gameState = 'playing';
    score = 0;
    distance = 0;
    gameSpeed = BASE_SPEED;
    frameCount = 0;
    speedBoostActive = false;
    
    player = new Player(canvas);
    obstacleManager = new ObstacleManager(canvas, gameSpeed);
    powerUpManager = new PowerUpManager(canvas, gameSpeed);
    
    gameLoop();
}

function restartGame() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    startGame();
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function endGame() {
    gameState = 'gameOver';
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('nbiEscapeHighScore', highScore);
    }
    
    document.getElementById('finalScore').textContent = `Final Score: ${score}`;
    document.getElementById('distanceTraveled').textContent = `Distance: ${Math.floor(distance)}m`;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

function update() {
    if (gameState !== 'playing') return;
    
    frameCount++;
    
    // Update player
    player.update();
    
    // Update game speed
    if (speedBoostActive) {
        speedBoostTime--;
        if (speedBoostTime <= 0) {
            speedBoostActive = false;
            gameSpeed = BASE_SPEED + Math.floor(frameCount / 1000);
        }
    }
    
    // Update managers
    obstacleManager.update();
    powerUpManager.update();
    
    // Increase difficulty over time
    if (frameCount % 500 === 0) {
        obstacleManager.increaseDifficulty();
        if (gameSpeed < MAX_SPEED && !speedBoostActive) {
            gameSpeed += 0.1;
            obstacleManager.baseSpeed = gameSpeed;
            powerUpManager.baseSpeed = gameSpeed;
        }
    }
    
    // Update score and distance
    score += 1;
    distance += gameSpeed * 0.1;
    
    // Check obstacle collisions
    const playerBox = player.getCollisionBox();
    for (let obstacle of obstacleManager.getObstacles()) {
        if (checkCollision(playerBox, obstacle.getCollisionBox())) {
            if (!player.invincible) {
                endGame();
                return;
            }
        }
    }
    
    // Check power-up collisions
    powerUpManager.getPowerUps().forEach((powerup, index) => {
        if (checkCollision(playerBox, powerup.getCollisionBox())) {
            if (powerup.type === 'speed') {
                speedBoostActive = true;
                speedBoostTime = 300;
                gameSpeed = MAX_SPEED;
                obstacleManager.baseSpeed = gameSpeed;
                powerUpManager.baseSpeed = gameSpeed;
                score += 100;
            } else if (powerup.type === 'invincibility') {
                player.invincible = true;
                player.invincibleTime = 300;
                score += 50;
            }
            powerUpManager.powerups.splice(index, 1);
        }
    });
    
    // Update displays
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('distance').textContent = `Distance: ${Math.floor(distance)}m`;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0f3460');
    gradient.addColorStop(1, '#533483');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = '#2a2a4a';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    ctx.fillStyle = '#444466';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 10]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 20);
    ctx.lineTo(canvas.width, canvas.height - 20);
    ctx.stroke();
    ctx.setLineDash([]);
    
    if (gameState === 'playing') {
        // Draw game objects
        obstacleManager.draw(ctx);
        powerUpManager.draw(ctx);
        player.draw(ctx);
        
        // Draw speed boost indicator
        if (speedBoostActive) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#FFD700';
            ctx.font = '24px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('SPEED BOOST!', canvas.width - 20, 40);
        }
        
        // Draw invincibility indicator
        if (player.invincible) {
            ctx.fillStyle = '#00FF00';
            ctx.font = '24px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('INVINCIBLE!', canvas.width - 20, 70);
        }
    }
}

function gameLoop() {
    update();
    draw();
    
    if (gameState === 'playing') {
        requestAnimationFrame(gameLoop);
    }
}

// Initial draw
draw();

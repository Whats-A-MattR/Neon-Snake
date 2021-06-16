// set up canvas, avoid skewing by removing remainders
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext("2d");
const grid = 30;
canvas.width = window.innerWidth - (window.innerWidth % grid);
canvas.height = window.innerHeight - (window.innerHeight % grid);
const rows = Math.floor(canvas.height / grid);
const columns = Math.floor(canvas.width / grid);

// start screen
const startModal = document.getElementById('startModal')
const startHighScore = document.getElementById('startHighScore')

// pause screen
const pauseModal = document.getElementById('pauseModal')
const pMScore = document.getElementById('currentScoreField')
const pauseHighScore = document.getElementById('pauseHighScore')

// game over or end screen
const gameoverModal = document.getElementById('gameoverModal')
const endHighScore = document.getElementById('endHighScore')
const endScoreField = document.getElementById('endScoreField')

// set FPS for the game to run at, this will also increase or decrease move speed
const FPS = 9;

// pull in localStorage to save persistent high score
const userStore = window.localStorage;

// food function w/ constructor
function Food() {
    this.x;
    this.y
    this.value = 10;

    this.create = function () {
        this.x = (Math.floor(Math.random() * columns - 1) + 1) * grid;
        this.y = (Math.floor(Math.random() * rows - 1) + 1) * grid;
    }
    this.spawn = function () {
        ctx.fillStyle = "rgba(255, 105, 180, 0.7)";
        ctx.shadowBlur = 25;
        ctx.shadowColor = "rgba(255, 105, 180, 0.9)";
        ctx.fillRect(this.x, this.y, grid, grid)
    }
}

// bonus food function w/ constructor
function BonusFood() {
    this.available = false
    this.x;
    this.y
    this.value = 100;

    this.create = function () {
        this.x = (Math.floor(Math.random() * columns - 1) + 1) * grid;
        this.y = (Math.floor(Math.random() * rows - 1) + 1) * grid;
    }

    this.maybe = function () {
        if (!this.available && Math.floor((Math.random() * 100000) % 33) === 0) {
            this.available = true
            return true
        }
        else {
            return false
        }
    }

    this.spawn = function () {
        ctx.fillStyle = "rgba(172, 255, 47, 0.7)";
        ctx.shadowBlur = 25;
        ctx.shadowColor = "rgba(172, 255, 47, 0.9";
        ctx.fillRect(this.x, this.y, grid, grid)
    }
}

// snake function w/ constructor
function Snake() {
    this.x = (columns / 2) * grid;
    this.y = (rows / 2) * grid;
    this.xVel = grid;
    this.yVel = 0
    this.total = 0;
    this.tail = []

    this.draw = function () {
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.shadowBlur = 30;
        ctx.shadowColor = "rgba(255, 255, 255, 0.9)"
        ctx.border
        for (let i = 0; i < this.tail.length; i++) {
            ctx.fillRect(this.tail[i].x, this.tail[i].y, grid, grid)
        }
        ctx.fillRect(this.x, this.y, grid, grid)
    }

    this.update = function () {
        for (let i = 0; i < this.tail.length - 1; i++) {
            this.tail[i] = this.tail[i + 1]
        }
        this.tail[this.total - 1] = { x: this.x, y: this.y };
        this.x += this.xVel;
        this.y += this.yVel;

        if (this.x >= canvas.width) {
            this.x = 0;
        }
        if (this.x < 0) {
            this.x = canvas.width;
        }
        if (this.y >= canvas.height) {
            this.y = 0;
        }
        if (this.y < 0) {
            this.y = canvas.height;
        }
    };

    this.eat = function (food) {
        if (game.gameState !== "play-demo") {
            if (this.x === food.x && this.y === food.y) {
                this.total++;
                game.gameScore += food.value
                return true;
            }
            return false;
        }
    };

    this.eatBonus = function (bonusFood) {
        if (game.gameState !== "play-demo") {
            if (this.x === bonusFood.x && this.y === bonusFood.y) {
                this.total++;
                game.gameScore += bonusFood.value
                return true;
            }
            return false;
        }
    }

    this.controller = function (direction) {
        switch (direction) {
            case 'Up':
                if (this.yVel !== grid) {
                    this.xVel = 0;
                    this.yVel = -grid;
                }
                break;
            case 'Down':
                if (this.yVel !== -grid) {
                    this.xVel = 0;
                    this.yVel = grid;
                }
                break;
            case 'Left':
                if (this.xVel !== grid) {
                    this.xVel = -grid;
                    this.yVel = 0;
                }
                break;
            case 'Right':
                if (this.xVel !== -grid) {
                    this.xVel = grid;
                    this.yVel = 0;
                }
                break;
        }
    }

    this.collision = function () {
        for (let i = 0; i < this.tail.length; i++) {
            if (this.x === this.tail[i].x && this.y === this.tail[i].y) {
                return true
            }
        }
        return false
    }
}

// creates game with item constructors
function Game() {
    this.snake = new Snake()
    this.food = new Food()
    this.bonusFood = new BonusFood()
    this.bonusFood.create()
    this.food.create()
    this.gameState;
    this.lastTick = 0;
    this.moveQ = []
    this.gameScore = 0;
    this.userHighScore = userStore.getItem('highScore') || 0;

    this.play = function () {
        this.runner = setInterval(playGame, 1000 / FPS);
    }

    this.pause = function () {
        this.gameState = "paused"
        this.play()
    }

    this.playDemo = function () {
        this.gameState = "play-demo"
        this.play()
    }

    this.reset = function () {
        clearInterval(this.runner)
        this.snake = new Snake()
        this.food = new Food()
        this.food.create()
        this.lastTick = 0;
        this.moveQ = [];
        this.gameScore = 0;
    }

    this.resetTick = function () {
        this.lastTick = 0;
    }

    this.end = function () {
        if (this.gameScore > this.userHighScore) {
            userStore.setItem('highScore', this.gameScore)
            this.userHighScore = this.gameScore
        }
        game.gameState = "paused"
        gameoverModal.style.display = "inline-block"
        endHighScore.textContent = `Your Highest Score: ${game.userHighScore}`
    }
}

const playGame = () => {
    console.clear()
    pauseHighScore.textContent = `Your High Score: ${game.userHighScore}`
    startHighScore.textContent = `Your High Score: ${game.userHighScore}`
    endScoreField.textContent = `Your Score: ${game.gameScore}`
    if (game.snake.collision()) {
        console.log("ouch")
        game.end()
    }
    else if (game.gameState === "play" || game.gameState === "play-demo") {


        //Math.floor((Math.random() * 100) % 2) === 0 





        ctx.clearRect(0, 0, canvas.width, canvas.height)
        game.food.spawn()
        if (game.lastTick === 0) {
            game.bonusFood.spawn()
        }
        game.snake.update()
        game.snake.draw()

        if (!game.bonusFood.available) {
            game.bonusFood.maybe()
        }
        
        if (game.bonusFood.available) {
            game.bonusFood.spawn()
        }

        if (game.snake.eat(game.food)) {
            game.food.create()
        }

        if (game.snake.eatBonus(game.bonusFood)) {
            game.bonusFood.available = false
            game.bonusFood.create()
        }

        game.lastTick++;
        if (game.moveQ.length > 0) {
            game.snake.controller(game.moveQ.shift())
        }
    }

}

const gameStateController = (key) => {
    if (key === 'Escape') {
        if (game.gameState === "paused") {
            game.gameState = "play"
        }
        else if (game.gameState === "play") {
            game.gameState = "paused"
            pauseModal.style.display = "inline-block"
            pMScore.innerText = `Current Score: ${game.gameScore}`
        }
    }
    if (key === "playbutton-click") {
        game.gameState = "play"
        game.reset()
        game.play()
    }
    if (key === "resumebutton-click") {
        game.gameState = "play"
    }
    if (key === "reset") {
        game.gameState = "play"
        game.reset()
        game.play()
    }
    if (key === "initialLoad") {
        game.playDemo()

    }
    if (key === "playagain") {
        startModal.style.display = "inline-block"
        gameoverModal.style.display = "none"
        game.reset()
    }
    if (game.gameState === "play") {
        startModal.style.display = "none"
        pauseModal.style.display = "none"
    }

}


const arrowKeys = ["Up", "Down", "Left", "Right"];

window.addEventListener('keydown', (e) => {
    gameStateController(e.key)
    const direction = e.key.replace('Arrow', '');

    if (game.gameState === "play") {
        if (arrowKeys.includes(direction)) {
            if (game.moveQ.length < 3) {
                game.moveQ.push(direction)
            }
        }
    }
})

document.getElementById('playButton').addEventListener('click', () => gameStateController("playbutton-click"))
document.getElementById('resumeButton').addEventListener("click", () => gameStateController("resumebutton-click"))
document.getElementById('resetButton').addEventListener("click", () => gameStateController("reset"))
document.getElementById('playagainButton').addEventListener("click", () => gameStateController("playagain"))
game = new Game()
//console.log(game.userHighScore)
gameStateController("initialLoad")

console.log();




/*
window.addEventListener('resize', () => {
    canvas.style.width = window.innerWidth;
    canvas.style.height = window.innerHeight;
})
*/



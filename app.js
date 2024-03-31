window.addEventListener('load', function() {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.height = 550;
    canvas.width = 1200;
    let obstacles = Array();
    let gameOver = false;
    let score = 0;
    
    const InputHandler = function() {
        this.keys = [];
        window.addEventListener('keydown', event => {
            if ((event.key === 'ArrowUp'    ||
                 event.key === 'ArrowDown'  ||
                 event.key === 'ArrowRight' ||
                 event.key === 'ArrowLeft') &&  
                this.keys.indexOf(event.key) === -1) {
                    this.keys.push(event.key);
                }
        });
        window.addEventListener('keyup', event => {
            if ( event.key === 'ArrowDown' ||
                 event.key === 'ArrowUp'   ||
                 event.key === 'ArrowLeft' || 
                 event.key === 'ArrowRight' ) {
                this.keys.splice(this.keys.indexOf(event.key), 1);
            }
        });
    };

    const Player = function(gameHeight, gameWidth) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.imageStatic1 = document.getElementById('playerStaticImage');
        this.imageStatic2 = document.getElementById('playerStaticImage2');
        this.imageJump = document.getElementById('playerJumpImage');
        this.imageJumpFall = document.getElementById('playerJumpImageFall');
        this.imageRun1 = document.getElementById('playerRun1');
        this.imageRun2 = document.getElementById('playerRun2');
        this.imageRun3 = document.getElementById('playerRun3');
        this.imageSlide = document.getElementById('playerSlide');
        this.image = this.imageStatic1;
        this.height = 150;
        this.width = 150;
        this.x = this.gameWidth/6 ;
        this.y = this.gameHeight - this.height;
        this.vy = 0;
        this.weight = 1.5;
        this.draw = function(context) {
            context.drawImage(this.image, this.x, this.y, this.height, this.width);
        };
        this.update = function(input, obstacles) {
            //collision detection
            obstacles.forEach(obstacle => {
                const dx = (obstacle.x + obstacle.width/2) - (this.x + this.width/2);
                const dy = (obstacle.y + obstacle.height/2) - (this.y + this.height/2);
                const dist = Math.sqrt(dx**2 + dy**2);
                if (dist < obstacle.width/2 + this.width/2 - 50) {
                    gameOver = true;
                    // window.location.reload();
                }
            });
            this.y += this.vy;
            if ((input.keys.indexOf('ArrowUp') > -1) && this.Gravity()) { 
                this.vy = - 25;
            } 
            document.body.addEventListener('click', 
            () => {
                this.vy = - 25;
            }
            , true && this.Gravity()); 

            if (input.keys.indexOf('ArrowDown') > -1) {
                this.image = this.imageSlide;
            }
            if (!this.Gravity() ) {
                this.vy += this.weight;
                this.image = this.imageJumpFall;
 
                if (input.keys.indexOf('ArrowDown') > -1) {
                    this.image = this.imageSlide;
                }
            } else if (this.Gravity() && input.keys.indexOf('ArrowDown') == -1)  {
                setTimeout(() => {  this.image = this.imageRun1; }, 67);
                if (this.image == this.imageRun1) {
                    setTimeout(() => { this.image = this.imageRun2; }, 67);
                } 
            }
            if (this.y > this.gameHeight - this.height) {
                this.y = this.gameHeight - this.height;
            }
        };
        this.Gravity = function() {
            return this.y >= this.gameHeight - this.height;
        }
    };

    const Enemy = function() {};

    class Obstacle {
        constructor(gameHeight, gameWidth) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.height = 150;
            this.width = 150;
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height + 10;
            this.image = document.getElementById('marshmallow');
            this.draw = function (context) {
                context.drawImage(this.image, this.x, this.y, this.height, this.width);
            };
            this.update = function () {
                this.x -= background.speed * (score / 10 + 1);
                if (this.x < 0 - this.width) {
                    this.markedForDeletion = true;
                    score++;
                    var coinSound = new Audio('Sound/coinSound.mp3');
                    coinSound.play();
                }
            };
        }
    }

    const Background = function(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.image = document.getElementById('backgroundImage');
        this.x = 0;
        this.y = 0;
        this.width = 1200;
        this.height = 600;
        this.speed = 8;
        this.draw = function(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        };
        this.update = function() {
            //if (input.keys.indexOf('ArrowRight') > -1 )
            this.x -= this.speed * (score/20 + 1) ;
            if (input.keys.indexOf('ArrowDown') > -1)
            this.x -= 10;
            if (this.x < 0 - this.width) {
                this.x = 0;
            }
        }
    };

    const statusText = function(context){
        context.fillStyle = 'white';
        context.font = 'oblique bolder 40px Courier';
        context.fillText('SCORE: ' + score, 20, 50)
    };

    const enemyHandler = function() {};
    
    const obstacleHandler = function(deltaTime){
        if (enemyTimer > enemyInterval + randomEnemyInterval){
        obstacles.push(new Obstacle(canvas.height, canvas.width));
        randomEnemyInterval = Math.random() * 3000 + 0;
        enemyTimer = 0;
        } else{
            enemyTimer += deltaTime;
        }
        obstacles.forEach( obstacle => {
            obstacle.draw(ctx);
            obstacle.update();
        });
        obstacles = obstacles.filter(obstacle => !obstacle.markedForDeletion)
    };

    const input = new InputHandler();
    const player = new Player(canvas.height, canvas.width);
    const background = new Background(canvas.width, canvas.height);

    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 1000;
    let randomEnemyInterval = Math.random()* 3000 + 0;

    const animate = function(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0,canvas.width, canvas.height);
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input, obstacles);
        obstacleHandler(deltaTime)
        statusText(ctx);
        if (!gameOver) {
            requestAnimationFrame(animate);
        } 
    }
    animate(0);
});

const canvas = document.querySelector("#canvas")
const ctx = canvas.getContext("2d")
const scoreNow = document.querySelector(".score-now")
const scoreRecord = document.querySelector(".score-record")
const gamOver = document.querySelector(".game-over")
const controls = document.querySelectorAll(".controls")

const RECORD_STORAGE_KEY = "RECORD"

function Snake(){
    var x = 0
    var y = 0
    var grid = 20
    var dx = grid
    var dy = 0
    var cell = []
    var size = 0
    const color = "red"
    const speed = 60

    return {
        setX(_x){
            x = _x
        },
        setY(_y){
            y = _y
        },
        setCell(_cell){
            cell = _cell
        },
        getSpeed(){
            return speed
        },
        getSize(){
            return size
        },
        setSize(_size){
            size = _size
        },
        update(){
            x += dx
            y += dy

            if(x === canvas.clientWidth){
                x = 0
            }else if(y === canvas.clientHeight){
                y = 0 
            }else if(y < 0){
                y = canvas.clientHeight 
            }else if(x < 0){
                x = canvas.clientWidth
            }

            cell.unshift({x: x, y: y})
            while(cell.length > size){
                cell.pop()
            }

            this.handleMove()
        },

        draw(){
            for(let i = 0; i < cell.length; i++){
                ctx.fillStyle = color
                ctx.fillRect(cell[i].x, cell[i].y, grid, grid)
            }
        },

        eat(_x, _y){
            if(x === _x && y === _y){
                return true
            }
            return false
        },
        handleAppearFood(_x, _y){
            for(let i = 0; i < cell.length; i++){
                if(_x === cell[i].x && _y === cell[i].y){
                    return true
                }
            }
            return false
        },
        finish(){
            for(let i = 1; i < cell.length; i++){
                if(x === cell[i].x && y === cell[i].y){
                    return true
                }
            }
            return false
        },

        handleMove(){
            document.addEventListener("keydown", (e) => {
                if(e.which === 37 && dy !== 0){
                    dx = -grid
                    dy = 0
                } else if(e.which === 38 && dx !== 0){
                    dx = 0
                    dy = -grid
                } else if(e.which === 39 && dy !== 0){
                    dx = grid
                    dy = 0
                } else if(e.which === 40 && dx !==0 ){
                    dx = 0
                    dy = grid
                }
            })
        },
    }
}


function Food(){
    var x = 20
    var y = 0
    var grid = 20
    const color = "blue"

    return {
        update(){
            x = Math.floor(Math.random() * (canvas.clientWidth / grid - 1)) * grid
            y = Math.floor(Math.random() * (canvas.clientHeight / grid - 1)) * grid
        },
        draw(){
            ctx.fillStyle = color
            ctx.fillRect(x, y, grid, grid)
        },
        getX(){
            return x
        },
        getY(){
            return y
        }
    }
}

const snake = Snake()
const food = Food()

function Game(){
    snake
    food
    var speed = 90
    var scoreRecordEl
    var config = JSON.parse(localStorage.getItem(RECORD_STORAGE_KEY)) || {}

    return{
        getSpeed(){
            return speed
        },
        setSpeed(_speed){
            speed = _speed
        },

        setConfig(key, value){
            config[key] = value
            localStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(config))
        },

        render(){
            scoreRecord.innerHTML = config.record === undefined ? "Record: 0" : `Record: ${config.record}`
        },

        update(){
            if(snake.finish()){
                scoreRecordEl = snake.getSize() - 1
                if(scoreRecordEl > config.record || config.record === undefined){
                    this.setConfig("record", scoreRecordEl)
                }
                gamOver.style.display = "flex"
                clearInterval(setIntervalEl)
            }
            snake.update()
            if(snake.eat(food.getX(), food.getY())){
                var snakeCurrentSize = snake.getSize()
                snake.setSize(++snakeCurrentSize)
                scoreNow.innerHTML = `Score: ${snake.getSize() - 1}`
                food.update()
                while(snake.handleAppearFood(food.getX(), food.getY())){
                    food.update()
                }
            }
            
        },
        draw(){ 
		    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            snake.draw()
            food.draw()
        },
        restart(_speed){
            snake.setSize([{ x: 0, y: 0}])
            snake.setX(0)
            snake.setY(0)
            snake.setSize(1)
            scoreNow.innerHTML = "Score: 0"
            setIntervalEl = setInterval(() => {
                game.start()
            }, _speed);            
        },
        start(){
            this.update()
            this.draw()
            this.render()
        },
    }
}


const game = Game()
var setIntervalEl = setInterval(() => {
    game.start()
}, game.getSpeed());


// Layout
const layout = document.querySelector(".layout")
const restart = document.querySelector(".restart")

const QUARITY_WIDTH = 20
const QUARITY_HEIGHT = 20

for(let i = 0; i < QUARITY_WIDTH; i++){
    for(let j = 0; j < QUARITY_HEIGHT; j++){
        var square = document.createElement("div")
        square.classList.add("square")
        if(i % 2 !== 0){
            square.classList.toggle("special")
        }
        if(j % 2 !== 0){
            square.classList.toggle("special")
        }
        layout.append(square)
    }
}

restart.onclick = () => {
    gamOver.style.display = "none"
    game.restart(game.getSpeed())
}

// Controls game
controls.forEach(control => {
    control.onclick = (e) =>{
        if(!e.target.closest(".active")){
            if(e.target.closest(".easy")){
                clearInterval(setIntervalEl)
                game.setSpeed(120)
                game.restart(game.getSpeed())
            } else if(e.target.closest(".normal")){
                clearInterval(setIntervalEl)
                game.setSpeed(90)
                game.restart(game.getSpeed())
            } else if(e.target.closest(".hard")){
                clearInterval(setIntervalEl)
                game.setSpeed(60)
                game.restart(game.getSpeed())
            }
        }
        document.querySelector(".control.active").classList.remove("active")
        e.target.classList.add("active")
    }
})
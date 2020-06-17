const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

let frames = 0;

// Load sprite img
const sprite = new Image();
sprite.src = "img/sprite.png";

const randInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

canvas.onclick = ()=>{
	switch(state.current){
        case state.getReady:
        	state.current = state.game
        	break;
        case state.game:
            dino.jump()
            break;
        case state.over:
            state.current = state.game
            cactuses.position = [];
            dino.y = fg.y;
           	break;
    }
}

// Game state
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2
}


// Foreground
const fg = {
    sX: 2,
    sY: 104,
    x: 0,
    y: canvas.clientHeight*0.8,
    w: 2400,
    h: 26,

    dx: 8,

    draw: function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y - this.h, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y - this.h, this.w, this.h);
    },

    update(){
    	if(state.current === state.game)
        	this.x = (this.x - this.dx)%(this.w);
    }
}

// dino
const dino = {
    animation : [ {sX: 1678}, {sX: 1854}, {sX: 1942}, {sX: 2030}],

    sY:2,

    w: 88,
    h: 94,

    x: 50,
    y: fg.y,

    radius: 35,

    yDefault: fg.y,

    frame: 0,
    period: 5,

    step: 0,
    jumpHeight: 30,
    jumpCount: 0,


    isJump: false,
    onFloor: true,

    draw(){
        let curDino = this.animation[this.frame];

        // Hitbox circle
        // this.y-this.h+this.h/1.8 = this.y - this.h(1-1/1.8) = this.y - this.h(0.8/1.8) = this.y - this.h*4/9
        
        // ctx.beginPath();
        // ctx.arc(this.x+this.w/2.5,this.y - this.h*4/9,35,0,Math.PI*2,true); 
        // ctx.stroke()

        ctx.drawImage(sprite, curDino.sX, this.sY, this.w, this.h, this.x, this.y - this.h, this.w, this.h)

    },

    jump(){
        this.isJump = true
        this.onFloor = false
    },

    update(){
    	if(state.current === state.game){

	        if(!this.onFloor && this.step>=0){
	            this.jumpCount++;
	            this.step = 6*this.jumpHeight*Math.sin(Math.PI*this.jumpCount/this.jumpHeight);
	            this.y = this.yDefault - this.step

	            if(this.isJump){
	                if(this.jumpCount>=this.jumpHeight/2) this.isJump = false
	            } else {

	                if(this.jumpCount>=this.jumpHeight){
	                    this.y = this.yDefault
	                    this.onFloor = true
	                    this.jumpCount = 0
	                    this.step = 0
	                }
	            }
	        }
	       
	        if(frames%this.period === 0)
	            this.frame += 1;

	        if(this.frame >= 3)
	            this.frame = 1;

	    } else if(state.current === state.over) this.frame = 3

    }
}

const cactuses = {
    position: [],

    choose: [
        {sX: 447,sY: 3, w: 32, h: 67, radius: 15, cY:fg.y-50},
        {sX: 481,sY: 3, w: 32, h: 67, radius: 15, cY:fg.y-50},
        {sX: 515,sY: 3, w: 32, h: 67, radius: 15, cY:fg.y-50},
        {sX: 549,sY: 3, w: 32, h: 67, radius: 15, cY:fg.y-50},
        {sX: 583,sY: 3, w: 32, h: 67, radius: 15, cY:fg.y-50},
        {sX: 617,sY: 3, w: 32, h: 67, radius: 15, cY:fg.y-50},

        {sX: 653,sY: 3, w: 48, h: 97, radius: 25, cY:fg.y-62},
        {sX: 703,sY: 3, w: 46, h: 97, radius: 22, cY:fg.y-64},
        {sX: 753,sY: 3, w: 48, h: 97, radius: 25, cY:fg.y-64},
        {sX: 803,sY: 3, w: 46, h: 97, radius: 22, cY:fg.y-64},
        {sX: 851,sY: 3, w: 101, h: 97, radius: 50, cY:fg.y-40},

    ],

    y: fg.y,

    dx: 8,

    getRandomCactus(){
        return this.choose[Math.floor(Math.random() * this.choose.length)]
    },


    draw(){
        for(let i = 0; i< this.position.length; i++){
            let p = this.position[i];

            // Hitbox circle
            // ctx.beginPath();
            // ctx.arc(p.x+p.w/2,p.cY,p.radius,0,Math.PI*2,true);
            // ctx.stroke()

            ctx.drawImage(sprite, p.sX, p.sY, p.w, p.h, p.x, this.y - p.h+2, p.w, p.h);
        }
    },

    update(){
        if(state.current !== state.game) return;

        if(frames%80 === 0){
            curCactus = this.getRandomCactus()

            const randDx = randInt(150, 600)
            const randDist = canvas.clientWidth + randDx

            this.position.push({
                sX: curCactus.sX,
                sY: curCactus.sY,
                x: randDist,
                w: curCactus.w,
                h: curCactus.h,
                cY: curCactus.cY,
                radius: curCactus.radius,
            });
        }

        for(let i = 0; i<this.position.length;i++){
            let p = this.position[i];

            if(p.x + p.w < 0 && this.position.length > 10){
                this.position.shift()
            }

            p.x -= this.dx;
            

            // Collision detection
            let dx, dy, distance
            
            dx = (dino.x + dino.w/2.5) - (p.x+p.w/2);
            dy = (dino.y - dino.h + dino.h/1.8) - p.cY;

            distance = Math.sqrt(dx * dx + dy * dy);

            console.log(distance)

            if (distance < dino.radius + p.radius) {
                state.current = state.over
            }
        }
    }
}


//Draw
const draw = () => {
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight);

    ctx.fillStyle = '#ff9966';
    ctx.fillRect(0,fg.y-2,canvas.clientWidth,canvas.clientHeight);
    
    fg.draw()
    dino.draw()
    cactuses.draw()
}

// Update
const update = () => {
    fg.update()
    dino.update()
    cactuses.update()
}

// Loop
const loop = () => {
    update();
    draw();
    frames++;
    requestAnimationFrame(loop);
}

loop();
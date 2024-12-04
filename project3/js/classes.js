class Ball extends PIXI.Graphics {
    constructor(radius = 10, color = 0xff0000, x=0, y =0) {
    super();
    
    this.circle(radius / 2, radius / 2, radius);
    this.fill(0xff0000);
    
    this.tilt = {x: 0, y:0};
    this.velocity = {x: 0, y:0};
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.path = [];
    this.lastPosition = {x:x, y:y};
    }
    
    
    
    
    
}

class Shape {
    constructor() {
        this.points = [];

    }
    /*
    score(path) {
        let total = 0;
        let gained = 0;
        for (let point of path) {
            for ()  //https://math.stackexchange.com/questions/4079605/how-to-find-closest-point-to-polygon-shape-from-any-coordinate
        }
    }
        */
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}
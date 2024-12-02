class Ball extends PIXI.Graphics {
    constructor(radius = 10, color = 0xff0000, x=100, y =100) {
    super();
    
    this.circle(x, y, radius);
    this.lineStyle(4, 0xFFFF00, 1);
    this.fill(0x000000);
    

    this.x = x;
    this.y = y;
    this.radius = radius;
    }
    
    
    
    
}

class Shape {
    constructor() {
        this.points = [];

    }

    score(path) {
        let total = 0;
        let gained = 0;
        for (let point of path) {
            for ()  //https://math.stackexchange.com/questions/4079605/how-to-find-closest-point-to-polygon-shape-from-any-coordinate
        }
    }
}
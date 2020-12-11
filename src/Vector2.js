export class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    set(x, y){
        this.x = x;
        this.y = y;
    }

    makeUnitVector() {
        let length = Math.sqrt((this.x ** 2) + (this.y ** 2));
        this.x /= length;
        this.y /= length;

        return this;
    }

    getLength(){
        return Math.sqrt((this.x ** 2) + (this.y ** 2));
    }
}
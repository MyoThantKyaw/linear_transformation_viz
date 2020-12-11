import { Vector2 } from "./Vector2";

export class Arrow {
    constructor(tailPoint, tipPoint, config) {

        this.tailPoint = tailPoint;
        this.tipPoint = tipPoint;

        this.width = 2.5;
        this.color = "#00ff00";
        this.arrowHeadLength = 16;
        this.arrowHeadWidth = 12;

        for (let objName in config) {
            if (this[objName] == undefined && (this[objName] == "pencil" || this[objName] == "ruler")) {
                console.warn(Arrow.name + ": " + objName + " parameter is undefined.")
            }
            this[objName] = config[objName];
        }

        this.type = "Arrow";
        this.tempPt = new Vector2();
        this.tempPt1 = new Vector2();
        this.normalVector = new Vector2();

        this.unitDirectionVector = new Vector2(this.tipPoint.x - this.tailPoint.x,
            this.tipPoint.y - this.tailPoint.y).makeUnitVector();
    }

    setContext(draw, grid) {
        this.draw = draw;
        this.grid = grid;

        this.drawArrow();
    }

    drawArrow() {

        this.grid.getPxFromCoorXY_(this.tailPoint.x, this.tailPoint.y, this.tempPt);
        this.grid.getPxFromCoorXY_(this.tipPoint.x, this.tipPoint.y, this.tempPt1);

        this.lineSVG = this.draw.line(this.tempPt.x, this.tempPt.y, this.tempPt1.x, this.tempPt1.y).
            stroke({ color: this.color, width: this.width, linecap: 'round' });

        this.normalVector.set(this.unitDirectionVector.y, -this.unitDirectionVector.x);
        // draw arrow head
        this.arrowHeadSVG = this.draw.polyline([
            this.tempPt1.x, this.tempPt1.y,
            this.tempPt1.x - (this.unitDirectionVector.x * this.arrowHeadLength) + (this.normalVector.x * this.arrowHeadWidth * .5), this.tempPt1.y + (this.unitDirectionVector.y * this.arrowHeadLength) - (this.normalVector.y * this.arrowHeadWidth * .5),
            this.tempPt1.x - (this.unitDirectionVector.x * this.arrowHeadLength * 0.85), this.tempPt1.y + (this.unitDirectionVector.y * this.arrowHeadLength * .85),

            this.tempPt1.x - (this.unitDirectionVector.x * this.arrowHeadLength) - (this.normalVector.x * this.arrowHeadWidth * .5), this.tempPt1.y + (this.unitDirectionVector.y * this.arrowHeadLength) + (this.normalVector.y * this.arrowHeadWidth * .5),
            this.tempPt1.x, this.tempPt1.y,

        ]).fill(this.color).stroke({ linejoin: 'round', color: this.color });
        
        this.visible = true;
    }

    updatePosition(tailPtx, tailPty, tipPtx, tipPty) {

        this.tailPoint.set(tailPtx, tailPty);
        this.tipPoint.set(tipPtx, tipPty);
        
        if(tailPtx === tipPtx && tailPty === tipPty){
            if(!this.tempHided){
                this.lineSVG.hide();
                this.arrowHeadSVG.hide();
            }
            
            this.tempHided = true;
            return;
        }
        else if(this.tempHided){
            this.lineSVG.show();
            this.arrowHeadSVG.show();
            this.tempHided = false;
        }
        
        this.grid.getPxFromCoorXY_(this.tailPoint.x, this.tailPoint.y, this.tempPt);
        this.grid.getPxFromCoorXY_(this.tipPoint.x, this.tipPoint.y, this.tempPt1);

        this.lineSVG.plot(this.tempPt.x, this.tempPt.y, this.tempPt1.x, this.tempPt1.y);

        this.unitDirectionVector.set(this.tipPoint.x - this.tailPoint.x,
            this.tipPoint.y - this.tailPoint.y);
        this.unitDirectionVector.makeUnitVector();
        this.normalVector.set(this.unitDirectionVector.y, -this.unitDirectionVector.x);

        this.arrowHeadSVG.plot([
            [this.tempPt1.x, this.tempPt1.y],
            [this.tempPt1.x - (this.unitDirectionVector.x * this.arrowHeadLength) + (this.normalVector.x * this.arrowHeadWidth * .5), this.tempPt1.y + (this.unitDirectionVector.y * this.arrowHeadLength) - (this.normalVector.y * this.arrowHeadWidth * .5)],
            [this.tempPt1.x - (this.unitDirectionVector.x * this.arrowHeadLength * 0.85), this.tempPt1.y + (this.unitDirectionVector.y * this.arrowHeadLength * .85)],
            [this.tempPt1.x - (this.unitDirectionVector.x * this.arrowHeadLength) - (this.normalVector.x * this.arrowHeadWidth * .5), this.tempPt1.y + (this.unitDirectionVector.y * this.arrowHeadLength) + (this.normalVector.y * this.arrowHeadWidth * .5)],
            [this.tempPt1.x, this.tempPt1.y]]
        );
    }

    show(){
        this.lineSVG.show();
        this.arrowHeadSVG.show();
        this.visible = true;
    }

    hide(){
        this.lineSVG.hide();
        this.arrowHeadSVG.hide();
        this.visible = false;
        this.tempHided = false;
    }
}
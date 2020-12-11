const { Arrow } = require("./Arrow");

import { Vector2 } from "./Vector2";

export class ArrowHead {
    constructor(tailPoint, tipPoint, config) {

        this.tailPoint = tailPoint;
        this.tipPoint = tipPoint;

        this.color = "#00ff00";
        this.arrowHeadLength = 14;
        this.arrowHeadWidth = 10;

        for (let objName in config) {
            if (this[objName] == undefined && (this[objName] == "pencil" || this[objName] == "ruler")) {
                console.warn(ArrowHead.name + ": " + objName + " parameter is undefined.")
            }
            this[objName] = config[objName];
        }

        this.type = "ArrowHead";
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

        this.normalVector.set(this.unitDirectionVector.y, -this.unitDirectionVector.x);
        // draw arrow head
        this.arrowHeadSVG = this.draw.polyline([
            this.tempPt1.x, this.tempPt1.y,
            this.tempPt1.x - (this.unitDirectionVector.x * this.arrowHeadLength) + (this.normalVector.x * this.arrowHeadWidth * .5), this.tempPt1.y + (this.unitDirectionVector.y * this.arrowHeadLength) - (this.normalVector.y * this.arrowHeadWidth * .5),
            this.tempPt1.x - (this.unitDirectionVector.x * this.arrowHeadLength * 0.81), this.tempPt1.y + (this.unitDirectionVector.y * this.arrowHeadLength * .85),
            this.tempPt1.x - (this.unitDirectionVector.x * this.arrowHeadLength) - (this.normalVector.x * this.arrowHeadWidth * .5), this.tempPt1.y + (this.unitDirectionVector.y * this.arrowHeadLength) + (this.normalVector.y * this.arrowHeadWidth * .5),
            this.tempPt1.x, this.tempPt1.y,

        ]).fill(this.color).stroke({  color: this.color });

        this.visible = true;
    }

    updatePosition(tailPtx, tailPty, tipPtx, tipPty) {

        this.tailPoint.set(tailPtx, tailPty);
        this.tipPoint.set(tipPtx, tipPty);

        if(tailPtx === tipPtx && tailPty === tipPty){
            if(!this.tempHided ){
                this.hide();
            }
            
            this.tempHided = true;
            return;
        }
        else if(this.tempHided ){
            this.show();
            this.tempHided = false;
        }

        this.grid.getPxFromCoorXY_(this.tailPoint.x, this.tailPoint.y, this.tempPt);
        this.grid.getPxFromCoorXY_(this.tipPoint.x, this.tipPoint.y, this.tempPt1);

        this.unitDirectionVector.set(this.tipPoint.x - this.tailPoint.x,
            this.tipPoint.y - this.tailPoint.y);
        this.unitDirectionVector.makeUnitVector();
        this.normalVector.set(this.unitDirectionVector.y, -this.unitDirectionVector.x);

        this.arrowHeadSVG.plot([
            [this.tempPt1.x, this.tempPt1.y],
            [this.tempPt1.x - (this.unitDirectionVector.x * this.arrowHeadLength) + (this.normalVector.x * this.arrowHeadWidth * .5), this.tempPt1.y + (this.unitDirectionVector.y * this.arrowHeadLength) - (this.normalVector.y * this.arrowHeadWidth * .5)],
            [this.tempPt1.x - (this.unitDirectionVector.x * this.arrowHeadLength * 0.81), this.tempPt1.y + (this.unitDirectionVector.y * this.arrowHeadLength * .85)],

            [this.tempPt1.x - (this.unitDirectionVector.x * this.arrowHeadLength) - (this.normalVector.x * this.arrowHeadWidth * .5), this.tempPt1.y + (this.unitDirectionVector.y * this.arrowHeadLength) + (this.normalVector.y * this.arrowHeadWidth * .5)],
            [this.tempPt1.x, this.tempPt1.y]]
        );
    }

    show(){
        this.arrowHeadSVG.animate({ duration : 200}).stroke({ opacity : 1}).fill({ opacity : 1})
        this.visible =true;
    }

    hide(animate = true){
        if(animate){
            this.arrowHeadSVG.animate({ duration : 200}).stroke({ opacity : 0}).fill({ opacity : 0})
        }
        else{
            this.arrowHeadSVG.stroke({ opacity : 0}).fill({ opacity : 0})
        }
        this.tempHided = false;
        this.visible = false;
    }
}
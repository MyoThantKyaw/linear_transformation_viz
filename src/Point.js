
import { Vector2 } from "./Vector2";
var funcs = require("./funcs")


export class Point {
    constructor(x, y, config) {

        this.pos = new Vector2(x, y)

        this.color = "#fff500";
        this.size = 11;
        this.borderWidth = this.size;

        this.snapToGrid = false;

        for (let objName in config) {
            if (this[objName] == undefined && (this[objName] == "pencil" || this[objName] == "ruler")) {
                console.warn(Arrow.name + ": " + objName + " parameter is undefined.")
            }
            this[objName] = config[objName];
        }

        this.tempPt = new Vector2();
        this.tempPtC = { cx: 0, cy: 0 };
        this.type = "Point";
        
        this.posChangedHandlers = [];
    }

    setContext(draw, grid) {
        this.draw = draw;
        this.grid = grid;

        this.drawPoint();
    }

    drawPoint() {

        this.grid.getPxFromCoorXY_(this.pos.x, this.pos.y, this.tempPt);

        this.pointSVG = this.draw.circle(this.size).attr({ fill: this.color, cx: this.tempPt.x, cy: this.tempPt.y })
            .stroke({
                width: this.borderWidth,
                color: this.color,
                opacity: 0
            });

        this.visible = true;
    }

    checkSelection(ptPx) {
    
        return Math.sqrt(((ptPx.x - this.pointSVG.cx()) ** 2) + ((ptPx.y - this.pointSVG.cy()) ** 2)) <= this.size + this.borderWidth + 3;
    }

    handlePanStart(ptPx) {
        this.fromPointerToCenterX = ptPx.x - this.pointSVG.cx();
        this.fromPointerToCenterY = ptPx.y - this.pointSVG.cy();
        this.pointSVG.animate({ duration: 200 }).stroke({ width: this.borderWidth, opacity: .4 });
    }

    handlePanMove(ptPx) {
        this.tempPtC.cx = ptPx.x - this.fromPointerToCenterX;
        this.tempPtC.cy = ptPx.y - this.fromPointerToCenterY;

        if (this.snapToGrid) {
            this.grid.getCoorFromPxXY_(this.tempPtC.cx, this.tempPtC.cy, this.tempPt);

            this.roundedPt = { x: funcs.round(this.tempPt.x, 0.5), y: funcs.round(this.tempPt.y, 0.5) };

            if (Math.sqrt(((this.tempPt.x - this.roundedPt.x) ** 2) + ((this.tempPt.y - this.roundedPt.y) ** 2)) * this.grid.pixelPerCoordinate < 5) {
                this.grid.getPxFromCoorXY_(this.roundedPt.x, this.roundedPt.y, this.tempPt);

                this.tempPtC.cx = this.tempPt.x;
                this.tempPtC.cy = this.tempPt.y;

                if (!this.snapped) {

                    this.pointSVG.attr(this.tempPtC);
                    this.snapped = true;
                }
                this.pos.set(this.roundedPt.x, this.roundedPt.y);
            }
            else {
                this.pointSVG.attr(this.tempPtC);
                this.snapped = false;
                this.grid.getCoorFromPxXY_(this.tempPtC.cx, this.tempPtC.cy, this.pos);
            }
        }
        else {
            this.pointSVG.attr(this.tempPtC);
            this.grid.getCoorFromPxXY_(this.tempPtC.cx, this.tempPtC.cy, this.pos);
        }

        this.triggerPosChangedEvent();
    }

    handlePanEnd(ptPx) {
        this.pointSVG.animate({ duration: 200 }).stroke({ width: this.borderWidth, opacity: 0 });
    }

    addEventListener(type, handler) {
        if (type === "posChanged") {
            this.posChangedHandlers.push(handler);
        }
    }

    triggerPosChangedEvent() {
        this.posChangedHandlers.forEach(handler => {
            handler(this.pos);
        });
    }

    redraw(){
        this.grid.getPxFromCoorXY_(this.pos.x, this.pos.y, this.tempPt);
        this.pointSVG.attr({cx : this.tempPt.x, cy : this.tempPt.y});

    }

    show(){
        this.pointSVG.show();
        this.visible = true;
    }

    hide(){
        this.pointSVG.hide();
        this.visible = false;
    }
}
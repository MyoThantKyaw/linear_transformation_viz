import { Vector2 } from "./Vector2";
import TWEEN from '@tweenjs/tween.js';
import { Arrow } from "./Arrow";
import { ArrowHead } from "./ArrowHead";
import { factorial } from "mathjs";

require("hammerjs");

export class Grid {
    constructor(draw, container, config) {
        this.draw = draw;
        this.container = container;

        this.containerBox = container.getBoundingClientRect();
        this.canvasWidth = this.containerBox.width;
        this.canvasHeight = this.containerBox.height;

        // Boundary Info
        this.rightCoor = 7;

        for (let objName in config) {
            if (this[objName] == undefined && (this[objName] == "pencil" || this[objName] == "ruler")) {
                console.warn(Grid.name + ": " + objName + " parameter is undefined.")
            }
            this[objName] = config[objName];
        }

        this.leftCoor = -this.rightCoor;
        this.topCoor = ((this.rightCoor * 2) / this.containerBox.width) * this.containerBox.height * .5;
        this.bottomCoor = -this.topCoor;

        this.widthCoor = this.rightCoor - this.leftCoor;
        this.heightCoor = this.topCoor - this.bottomCoor;

        this.pixelPerCoordinate = this.canvasWidth / this.widthCoor;

        this.noOfVLinesLeft = 20;
        this.noOfHLinesBottom = 20;

        this.tempPt = new Vector2();
        this.tempPt1 = new Vector2();
        this.tempPt2 = new Vector2();
        this.tempPt3 = new Vector2();

        this.eigenVector1 = new Vector2();
        this.eigenVector2 = new Vector2();

        this.baseGridColor = "#aaaaaa50";
        this.minorGridColor = "#aaaaaa17";
        this.minorGridWidth = 1.5;

        this.gridColor = "#1099d3";

        // this.majorBaseGridHorizontalLines = [], this.majorBaseGridVerticalLines = [];
        // this.minorBaseGridHorizontalLines = [], this.minorBaseGridVerticalLines = [];
        this.baseGridLines = [];

        this.hLines = [], this.hLinesOriginalPos = [];
        this.vLines = [], this.vLinesOriginalPos = [];

        // items
        this.arrows = [], this.points = [], this.arrowHeads = [];

        // hammerjs mouse and pointer events
        this.hammer = new Hammer(container, { domEvents: true });
        this.hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 0 });

        this.hammer.on("panstart", (e) => this.panStartHandler(e));
        this.hammer.on("panmove", (e) => this.panMoveHandler(e));
        this.hammer.on("panend", (e) => this.panEndHandler(e));

        this.matrix = [
            [1, 0],
            [0, 1]
        ];

        this.effectiveMatrix = [
            [1, 0],
            [0, 1]
        ];

        this.inputVector = [1, 1];
        this.outputVector = [1, 1];

        this.currentTime = 0;

        this.eigenVectorVisibleChecked = false;

        this.txtOutput_x = document.getElementById("txt-output-vect-x");
        this.txtOutput_y = document.getElementById("txt-output-vect-y");

        this.drawGrids();
        this.drawDeterminant();
        this.drawColumnVectorArrows();
        this.drawEigenVectors();
        this.drawOutputVector();
        this.hideEigenVectors(false);
    }

    addItem(item) {
        if (item.type === "Arrow") {
            this.arrows.push(item);
        }
        else if (item.type === "Point") {
            this.points.push(item);
        }
        else if (item.type === "ArrowHead") {
            this.arrowHeads.push(item);
        }

        item.setContext(this.draw, this);
    }

    drawGrids() {

        // base grid
        this.drawBaseGrid();

        // horizontal lines (Grid to apply transformation)
        for (let i = -this.noOfHLinesBottom; i <= this.noOfHLinesBottom; i++) {

            this.getPxFromCoorXY_(-this.noOfVLinesLeft, i, this.tempPt);
            this.getPxFromCoorXY_(this.noOfVLinesLeft, i, this.tempPt1);

            if (i !== 0) {
                this.hLines.push(this.draw.line(this.tempPt.x, this.tempPt.y, this.tempPt1.x, this.tempPt1.y).stroke({ color: this.gridColor, width: 1.7 }));
                this.hLinesOriginalPos.push({ start: { x: -this.noOfVLinesLeft, y: i }, end: { x: this.noOfVLinesLeft, y: i } });
            }
        }

        for (let i = -this.noOfVLinesLeft; i <= this.noOfVLinesLeft; i++) {

            this.getPxFromCoorXY_(i, -this.noOfHLinesBottom, this.tempPt);
            this.getPxFromCoorXY_(i, this.noOfHLinesBottom, this.tempPt1);

            if (i !== 0) {
                this.vLines.push(this.draw.line(this.tempPt.x, this.tempPt.y, this.tempPt1.x, this.tempPt1.y).stroke({ color: this.gridColor, width: 1.7 }));
                this.vLinesOriginalPos.push({ start: { x: i, y: -this.noOfHLinesBottom }, end: { x: i, y: this.noOfHLinesBottom } });
            }
        }

        this.getPxFromCoorXY_(-this.noOfVLinesLeft, 0, this.tempPt);
        this.getPxFromCoorXY_(this.noOfVLinesLeft, 0, this.tempPt1);

        this.hLines.push(this.draw.line(this.tempPt.x, this.tempPt.y, this.tempPt1.x, this.tempPt1.y).stroke({ color: "#dddddd", width: 1.7 }));
        this.hLinesOriginalPos.push({ start: { x: -this.noOfVLinesLeft, y: 0 }, end: { x: this.noOfVLinesLeft, y: 0 } });

        this.getPxFromCoorXY_(0, -this.noOfHLinesBottom, this.tempPt);
        this.getPxFromCoorXY_(0, this.noOfHLinesBottom, this.tempPt1);

        this.vLines.push(this.draw.line(this.tempPt.x, this.tempPt.y, this.tempPt1.x, this.tempPt1.y).stroke({ color: "#dddddd", width: 1.7 }));
        this.vLinesOriginalPos.push({ start: { x: 0, y: -this.noOfHLinesBottom }, end: { x: 0, y: this.noOfHLinesBottom } });
    }

    drawDeterminant() {

        this.getPxFromCoorXY_(0, 0, this.tempPt);
        this.getPxFromCoorXY_(1, 0, this.tempPt1);
        this.getPxFromCoorXY_(1, 1, this.tempPt2);
        this.getPxFromCoorXY_(0, 1, this.tempPt3);

        this.determinantSVG = this.draw.polyline([
            [this.tempPt.x, this.tempPt.y],
            [this.tempPt1.x, this.tempPt1.y],
            [this.tempPt2.x, this.tempPt2.y],
            [this.tempPt3.x, this.tempPt3.y],
            [this.tempPt.x, this.tempPt.y],
        ]).fill("#ffff0044").stroke({ color: "#e0e026", width: 1.8 });
    }

    drawColumnVectorArrows() {

        this.columnVector1 = new Arrow(new Vector2(0, 0), new Vector2(this.effectiveMatrix[0][0], this.effectiveMatrix[1][0]), {
            color: "#3ca34d",
            width: 3.3,
        });

        this.columnVector2 = new Arrow(new Vector2(0, 0), new Vector2(this.effectiveMatrix[0][1], this.effectiveMatrix[1][1]), {
            color: "#dd3c39",
            width: 3.3,
        });

        this.addItem(this.columnVector1);
        this.addItem(this.columnVector2);
    }

    drawEigenVectors() {

        this.getPxFromCoorXY_(0, 0, this.tempPt);
        this.getPxFromCoorXY_(4, 0, this.tempPt1);

        this.eigenVectorLine1 = this.draw.line(this.tempPt.x, this.tempPt.y, this.tempPt1.x, this.tempPt1.y).stroke({
            color: "#f2b27b", width: 1.8,
        });

        this.getPxFromCoorXY_(0, 0, this.tempPt);
        this.getPxFromCoorXY_(0, 4, this.tempPt1);

        this.eigenVectorLine2 = this.draw.line(this.tempPt.x, this.tempPt.y, this.tempPt1.x, this.tempPt1.y).stroke({
            color: "#f2b27b", width: 1.8,
        });

        this.arrowHeadsEigen1 = [];
        this.arrowHeadsEigen2 = [];
        this.arrowHeadsEigen1Opp = []
        this.arrowHeadsEigen2Opp = []

        for (let i = 0; i < 20; i++) {
            this.arrowHeadsEigen1.push(new ArrowHead(new Vector2(0, 0), new Vector2(1, 1), { color: "#f2b27b" }));
            this.arrowHeadsEigen2.push(new ArrowHead(new Vector2(0, 0), new Vector2(1, 2), { color: "#f2b27b" }));

            this.arrowHeadsEigen1Opp.push(new ArrowHead(new Vector2(0, 0), new Vector2(1, 2), { color: "#f2b27b" }));
            this.arrowHeadsEigen2Opp.push(new ArrowHead(new Vector2(0, 0), new Vector2(1, 2), { color: "#f2b27b" }));

            this.addItem(this.arrowHeadsEigen1[i]);
            this.addItem(this.arrowHeadsEigen2[i]);
            this.addItem(this.arrowHeadsEigen1Opp[i]);
            this.addItem(this.arrowHeadsEigen2Opp[i]);

        }
        this.eigenVectorsVisible = true;
    }

    getPxFromCoorXY_(x, y, toPt) {
        toPt.x = ((x - this.leftCoor) / this.widthCoor) * this.canvasWidth;
        toPt.y = (1 - ((y - this.bottomCoor) / this.heightCoor)) * this.canvasHeight;
    }

    getCoorFromPxXY_(x, y, toPt) {
        toPt.x = (((x / this.canvasWidth)) * this.widthCoor) + this.leftCoor;
        toPt.y = ((1 - (y / this.canvasHeight)) * this.heightCoor) + this.bottomCoor;
    }

    applyMatrix() {

        this.effectiveMatrix[0][0] = (1 - this.currentTime) + (this.matrix[0][0] * this.currentTime);
        this.effectiveMatrix[0][1] = this.matrix[0][1] * this.currentTime;
        this.effectiveMatrix[1][0] = this.matrix[1][0] * this.currentTime;
        this.effectiveMatrix[1][1] = (1 - this.currentTime) + (this.matrix[1][1] * this.currentTime);

        for (let i = 0; i < this.vLines.length; i++) {

            this.getPxFromCoorXY_(

                (this.effectiveMatrix[0][0] * this.vLinesOriginalPos[i].start.x) + (this.effectiveMatrix[0][1] * this.vLinesOriginalPos[i].start.y),
                (this.effectiveMatrix[1][0] * this.vLinesOriginalPos[i].start.x) + (this.effectiveMatrix[1][1] * this.vLinesOriginalPos[i].start.y),

                this.tempPt);

            this.getPxFromCoorXY_(

                (this.effectiveMatrix[0][0] * this.vLinesOriginalPos[i].end.x) + (this.effectiveMatrix[0][1] * this.vLinesOriginalPos[i].end.y),
                (this.effectiveMatrix[1][0] * this.vLinesOriginalPos[i].end.x) + (this.effectiveMatrix[1][1] * this.vLinesOriginalPos[i].end.y),

                this.tempPt1)

            this.vLines[i].plot(this.tempPt.x, this.tempPt.y, this.tempPt1.x, this.tempPt1.y);
        }

        for (let i = 0; i < this.hLines.length; i++) {

            this.getPxFromCoorXY_(

                (this.effectiveMatrix[0][0] * this.hLinesOriginalPos[i].start.x) + (this.effectiveMatrix[0][1] * this.hLinesOriginalPos[i].start.y),
                (this.effectiveMatrix[1][0] * this.hLinesOriginalPos[i].start.x) + (this.effectiveMatrix[1][1] * this.hLinesOriginalPos[i].start.y),

                this.tempPt);

            this.getPxFromCoorXY_(

                (this.effectiveMatrix[0][0] * this.hLinesOriginalPos[i].end.x) + (this.effectiveMatrix[0][1] * this.hLinesOriginalPos[i].end.y),
                (this.effectiveMatrix[1][0] * this.hLinesOriginalPos[i].end.x) + (this.effectiveMatrix[1][1] * this.hLinesOriginalPos[i].end.y),

                this.tempPt1);

            this.hLines[i].plot(this.tempPt.x, this.tempPt.y, this.tempPt1.x, this.tempPt1.y);
        }

        // apply to determinant area
        this.getPxFromCoorXY_(0, 0, this.tempPt);
        this.getPxFromCoorXY_(
            this.effectiveMatrix[0][0],
            this.effectiveMatrix[1][0],
            this.tempPt1);

        this.getPxFromCoorXY_(
            this.effectiveMatrix[0][0] + this.effectiveMatrix[0][1],
            this.effectiveMatrix[1][0] + this.effectiveMatrix[1][1],
            this.tempPt2);

        this.getPxFromCoorXY_(
            this.effectiveMatrix[0][1],
            this.effectiveMatrix[1][1],
            this.tempPt3);

        this.determinantSVG.plot([
            [this.tempPt.x, this.tempPt.y],
            [this.tempPt1.x, this.tempPt1.y],
            [this.tempPt2.x, this.tempPt2.y],
            [this.tempPt3.x, this.tempPt3.y],
            [this.tempPt.x, this.tempPt.y],
        ]);

        // update determinant sign
        this.determinant = (this.effectiveMatrix[0][0] * this.effectiveMatrix[1][1]) - (this.effectiveMatrix[0][1] * this.effectiveMatrix[1][0]);

        if (this.determinant < 0) {
            if (this.determinantSVG.isPositive) {
                this.determinantSVG.fill("#00ffff44").stroke({ color: "#00d8d8", width: 1.8 });
                this.determinantSVG.isPositive = false;
            }
        }
        else if (!this.determinantSVG.isPositive) {
            this.determinantSVG.fill("#ffff0044").stroke({ color: "#e0e026", width: 1.8 });
            this.determinantSVG.isPositive = true;
        }

        this.columnVector1.updatePosition(0, 0, this.effectiveMatrix[0][0], this.effectiveMatrix[1][0]);
        this.columnVector2.updatePosition(0, 0, this.effectiveMatrix[0][1], this.effectiveMatrix[1][1]);

        // check if the matrix is identity matrix, 
        // in identity matrix, every non-zero vector is EigenVector
        if (!(this.matrix[0][0] === 1 && this.matrix[0][1] === 0 && this.matrix[1][0] === 0 && this.matrix[1][1] === 1)) {

            let evs = numeric.eig(this.matrix);

            if (evs.E.y == undefined && this.currentTime != 0) {
                this.eigenVector1.set(evs.E.x[0][0], evs.E.x[1][0]);
                this.eigenVector2.set(evs.E.x[0][1], evs.E.x[1][1]);

                this.lambda1 = evs.lambda.x[0];
                this.lambda2 = evs.lambda.x[1];

                let currEigenVal1 = ((evs.lambda.x[0] * this.currentTime) + (1 - this.currentTime));
                let currEigenVal2 = ((evs.lambda.x[1] * this.currentTime) + (1 - this.currentTime))

                this.getPxFromCoorXY_(-this.eigenVector1.x * currEigenVal1 * 20, -this.eigenVector1.y * currEigenVal1 * 20, this.tempPt);
                this.getPxFromCoorXY_(this.eigenVector1.x * currEigenVal1 * 20, this.eigenVector1.y * currEigenVal1 * 20, this.tempPt1);

                this.eigenVectorLine1.plot(this.tempPt.x, this.tempPt.y, this.tempPt1.x, this.tempPt1.y);

                this.getPxFromCoorXY_(-this.eigenVector2.x * currEigenVal2 * 20, -this.eigenVector2.y * currEigenVal2 * 20, this.tempPt);
                this.getPxFromCoorXY_(this.eigenVector2.x * currEigenVal2 * 20, this.eigenVector2.y * currEigenVal2 * 20, this.tempPt1);

                this.eigenVectorLine2.plot(this.tempPt.x, this.tempPt.y, this.tempPt1.x, this.tempPt1.y);

                for (let i = 0; i < this.arrowHeadsEigen1.length; i++) {

                    this.arrowHeadsEigen1[i].updatePosition(0, 0,
                        (i + 1) * this.eigenVector1.x * currEigenVal1,
                        (i + 1) * this.eigenVector1.y * currEigenVal1);

                    this.arrowHeadsEigen1Opp[i].updatePosition(0, 0,
                        -(i + 1) * this.eigenVector1.x * currEigenVal1,
                        -(i + 1) * this.eigenVector1.y * currEigenVal1);

                    this.arrowHeadsEigen2[i].updatePosition(0, 0,
                        (i + 1) * this.eigenVector2.x * currEigenVal2,
                        (i + 1) * this.eigenVector2.y * currEigenVal2);

                    this.arrowHeadsEigen2Opp[i].updatePosition(0, 0,
                        -(i + 1) * this.eigenVector2.x * currEigenVal2,
                        -(i + 1) * this.eigenVector2.y * currEigenVal2);
                }

                if (!this.eigenVectorsVisible) {
                    // show eigen vectors
                    this.showEigenVectors();
                }
            }
            else {
                if (this.eigenVectorsVisible) {
                    // hide eigen vectors
                    this.hideEigenVectors();
                }
            }
        }
        else {  // if the matrix is identity matrix
            if (this.eigenVectorsVisible) {
                // hide eigen vectors
                this.hideEigenVectors();
            }
        }

        this.updateOutputVector();

    }

    updateTime(time) {
        this.currentTime = time;
        this.applyMatrix();
    }

    testAnimate() {
        this.currentTime = 0;
        let tween = new TWEEN.Tween({ time: this.currentTime })
            .to({ time: 1 }, 500)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onUpdate((value) => {
                this.currentTime = value.time;

                this.applyMatrix(this.currentTime);

                this.container.timeSider.value = value.time;
            })
            .onComplete(() => {
                this.draw.aniController.removeAnimation(tween.getId());
            })
            .onStop(() => {
                this.draw.aniController.removeAnimation(tween.getId());
            })

        this.draw.aniController.addAnimation(tween.getId());
        tween.start();
    }

    panStartHandler(e) {
        this.boundingBox = this.container.getBoundingClientRect();

        let ptPx = { x: e.center.x - this.boundingBox.left, y: e.center.y - this.boundingBox.top };
        for (let i = this.points.length - 1; i >= 0; i--) {
            if (this.points[i].visible && this.points[i].checkSelection(ptPx)) {

                this.itemToHandlePanEvt = this.points[i];

                this.itemToHandlePanEvt.handlePanStart(ptPx);
                break;
            }
        }
    }

    panMoveHandler(e) {
        if (this.itemToHandlePanEvt === undefined) {
            return;
        }

        this.itemToHandlePanEvt.handlePanMove({ x: e.center.x - this.boundingBox.left, y: e.center.y - this.boundingBox.top });
    }

    panEndHandler(e) {
        if (this.itemToHandlePanEvt === undefined) {
            return;
        }

        this.itemToHandlePanEvt.handlePanEnd({ x: e.center.x - this.boundingBox.left, y: e.center.y - this.boundingBox.top });
        this.itemToHandlePanEvt = undefined;
    }

    drawOutputVector() {
        this.outputVectorArrow = new Arrow(new Vector2(0, 0), new Vector2(this.outputVector[0], this.outputVector[1]), {
            color: "#e0d83c", width: 2.2,
        });

        this.addItem(this.outputVectorArrow);

    }

    updateOutputVector() {

        this.outputVector[0] = (this.effectiveMatrix[0][0] * this.inputVector[0]) + (this.effectiveMatrix[0][1] * this.inputVector[1]);
        this.outputVector[1] = (this.effectiveMatrix[1][0] * this.inputVector[0]) + (this.effectiveMatrix[1][1] * this.inputVector[1]);

        this.outputVectorArrow.updatePosition(0, 0, this.outputVector[0], this.outputVector[1]);

        this.txtOutput_x.innerText = ((this.matrix[0][0] * this.inputVector[0]) + (this.matrix[0][1] * this.inputVector[1])).toFixed(2);
        this.txtOutput_y.innerText = ((this.matrix[1][0] * this.inputVector[0]) + (this.matrix[1][1] * this.inputVector[1])).toFixed(2);
    }

    showEigenVectors() {

        if(!this.eigenVectorVisibleChecked){
            return;
        }
    
        this.eigenVectorLine1.animate({ duration: 200 }).stroke({ opacity: 1 });
        this.eigenVectorLine2.animate({ duration: 200 }).stroke({ opacity: 1 });
        for (let i = 0; i < this.arrowHeads.length; i++) {
            this.arrowHeads[i].show();
        }
        this.eigenVectorsVisible = true;
    }

    hideEigenVectors(animate = true) {

        if(!this.eigenVectorsVisible) return;

        // if(!this.eigenVectorVisibleChecked){
        //     return;
        // }
        if (animate) {
            this.eigenVectorLine1.animate({ duration: 200 }).stroke({ opacity: 0 });
            this.eigenVectorLine2.animate({ duration: 200 }).stroke({ opacity: 0 });
            for (let i = 0; i < this.arrowHeads.length; i++) {
                this.arrowHeads[i].hide();
            }
        }
        else {
            this.eigenVectorLine1.stroke({ opacity: 0 });
            this.eigenVectorLine2.stroke({ opacity: 0 });
            for (let i = 0; i < this.arrowHeads.length; i++) {
                this.arrowHeads[i].hide(false);
            }
        }

        this.eigenVectorsVisible = false;
    }

    drawBaseGrid() {
        for (let i = parseInt(this.bottomCoor); i <= parseInt(this.topCoor); i++) {

            this.getPxFromCoorXY_(0, i, this.tempPt);
            this.baseGridLines.push(this.draw.line(0, this.tempPt.y, this.canvasWidth, this.tempPt.y).stroke({ color: this.baseGridColor, width: 1.4 }));

            if (i === parseInt(this.bottomCoor)) {
                this.getPxFromCoorXY_(0, i - 0.5, this.tempPt);
                this.baseGridLines.push(this.draw.line(0, this.tempPt.y, this.canvasWidth, this.tempPt.y).stroke({ color: this.minorGridColor, width: this.minorGridWidth }));
            }
            this.getPxFromCoorXY_(0, i + 0.5, this.tempPt);
            this.baseGridLines.push(this.draw.line(0, this.tempPt.y, this.canvasWidth, this.tempPt.y).stroke({ color: this.minorGridColor, width: this.minorGridWidth }));
        }

        for (let i = parseInt(this.leftCoor); i <= parseInt(this.rightCoor); i++) {

            this.getPxFromCoorXY_(i, 0, this.tempPt);
            this.baseGridLines.push(this.draw.line(this.tempPt.x, 0, this.tempPt.x, this.canvasHeight).stroke({ color: this.baseGridColor, width: 1.4 }));

            if (i === parseInt(this.bottomCoor)) {
                this.getPxFromCoorXY_(i - 0.5, 0, this.tempPt);
                this.baseGridLines.push(this.draw.line(this.tempPt.x, 0, this.tempPt.x, this.canvasHeight).stroke({ color: this.minorGridColor, width: this.minorGridWidth }));
            }

            this.getPxFromCoorXY_(i + .5, 0, this.tempPt);
            this.baseGridLines.push(this.draw.line(this.tempPt.x, 0, this.tempPt.x, this.canvasHeight).stroke({ color: this.minorGridColor, width: this.minorGridWidth }));
        }


    }

    updateGridSize(rightCoor) {

        this.rightCoor = rightCoor;

        this.containerBox = this.container.getBoundingClientRect();
        this.canvasWidth = this.containerBox.width;
        this.canvasHeight = this.containerBox.height;


        this.leftCoor = -this.rightCoor;
        this.topCoor = ((this.rightCoor * 2) / this.containerBox.width) * this.containerBox.height * .5;
        this.bottomCoor = -this.topCoor;

        this.widthCoor = this.rightCoor - this.leftCoor;
        this.heightCoor = this.topCoor - this.bottomCoor;

        this.pixelPerCoordinate = this.canvasWidth / this.widthCoor;

        this.redrawGraph();
    }

    redrawGraph() {
        this.applyMatrix();
        // redraw base grid
        this.baseGridLines.forEach(line => {
            line.remove();
        });

        this.baseGridLines.length = 0;
        this.drawBaseGrid();
    }

    showDeterminant(){
        this.determinantSVG.show();
    }

    hideDeterminant(){
        this.determinantSVG.hide();
    }


}
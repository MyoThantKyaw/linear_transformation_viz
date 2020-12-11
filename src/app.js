import { SVG } from '@svgdotjs/svg.js'

import { AnimationController } from './AnimationController';
import { Grid } from './Grid';
import { Point } from './Point';
var funcs = require("./funcs")

var container = document.getElementById("graph-view");
var boundingRect = container.getBoundingClientRect();

var horizontalAxisLimit;

if (boundingRect.width < boundingRect.height) {
    horizontalAxisLimit = boundingRect.width / funcs.calculateHorizontalAxisLimit(boundingRect.width);
}
else {
    horizontalAxisLimit = (boundingRect.height / funcs.calculateHorizontalAxisLimit(boundingRect.height)) / (boundingRect.height / boundingRect.width);
}

var draw = SVG().addTo(container).size(boundingRect.width, boundingRect.height);

draw.aniController = new AnimationController();

var grid = new Grid(draw, container, { rightCoor: horizontalAxisLimit });

var txtMatrix_00 = document.getElementById("txt-matrix-0-0");
var txtMatrix_01 = document.getElementById("txt-matrix-0-1");
var txtMatrix_10 = document.getElementById("txt-matrix-1-0");
var txtMatrix_11 = document.getElementById("txt-matrix-1-1");

var txtInput_x = document.getElementById("txt-input-vect-x");
var txtInput_y = document.getElementById("txt-input-vect-y");

var pointCol1 = new Point(1, 0, { snapToGrid: false, color: "#3ca34d" });
grid.addItem(pointCol1);
pointCol1.addEventListener("posChanged", (posCoor) => {
    grid.matrix[0][0] = posCoor.x;
    grid.matrix[1][0] = posCoor.y;

    txtMatrix_00.innerText = posCoor.x.toFixed(2);
    txtMatrix_10.innerText = posCoor.y.toFixed(2);

    grid.applyMatrix();
});

var pointCol2 = new Point(0, 1, { color: "#dd3c39", snapToGrid: false });
grid.addItem(pointCol2);
pointCol2.addEventListener("posChanged", (posCoor) => {
    grid.matrix[0][1] = posCoor.x;
    grid.matrix[1][1] = posCoor.y;

    txtMatrix_01.innerText = posCoor.x.toFixed(2);
    txtMatrix_11.innerText = posCoor.y.toFixed(2);

    grid.applyMatrix();
});

// eded00
var pointInput = new Point(1, 1, { color: "#e0d83c", snapToGrid: false });
grid.addItem(pointInput);
pointInput.addEventListener("posChanged", (posCoor) => {

    txtInput_x.innerText = posCoor.x.toFixed(2);
    txtInput_y.innerText = posCoor.y.toFixed(2);

    grid.inputVector[0] = posCoor.x;
    grid.inputVector[1] = posCoor.y;

    grid.updateOutputVector();

});

grid.matrix = [
    [pointCol1.pos.x, pointCol2.pos.x],
    [pointCol1.pos.y, pointCol2.pos.y]
];
var timeLabel = document.getElementById("time-label");
let timeSider = document.getElementById("timeSlider")
var time;
timeSider.addEventListener("input", function (evt) {
    time = parseFloat(evt.target.value);
    grid.updateTime(time);
    timeLabel.innerText = "t: " + time.toFixed(2);
    if (time === 1) {
        timeLabel.style.color = "#0fc601";
    }
    else {
        timeLabel.style.color = "#dbdbdb";
    }
});
container.timeSider = timeSider;

draw.rect(289, 84).fill("#1E1E1E76").move(3, 4).radius(6);

// Write Matrix text
var bracketColor = "#dddddd";
var bracketWidth = 1.8;

draw.polyline([
    [17, 8],
    [10, 8],
    [10, 73],
    [17, 73],
]).fill("none").stroke({ width: bracketWidth, color: bracketColor })

var rightBracketX = 158;
draw.polyline([
    [rightBracketX - 17, 8],
    [rightBracketX - 10, 8],
    [rightBracketX - 10, 73],
    [rightBracketX - 17, 73],
]).fill("none").stroke({ width: bracketWidth, color: bracketColor })

let inputVectorLeftBracket = 147;
draw.polyline([
    [inputVectorLeftBracket + 17, 8],
    [inputVectorLeftBracket + 10, 8],
    [inputVectorLeftBracket + 10, 73],
    [inputVectorLeftBracket + 17, 73],
]).fill("none").stroke({ width: bracketWidth, color: bracketColor })

var inputVectorRightBracket = 210;
draw.polyline([
    [inputVectorRightBracket - 17, 8],
    [inputVectorRightBracket - 10, 8],
    [inputVectorRightBracket - 10, 73],
    [inputVectorRightBracket - 17, 73],
]).fill("none").stroke({ width: bracketWidth, color: bracketColor })

let outputVectorLeftBracket = 226;
draw.polyline([
    [outputVectorLeftBracket + 17, 8],
    [outputVectorLeftBracket + 10, 8],
    [outputVectorLeftBracket + 10, 73],
    [outputVectorLeftBracket + 17, 73],
]).fill("none").stroke({ width: bracketWidth, color: bracketColor })

let outputVectorRightBracket = 296;
draw.polyline([
    [outputVectorRightBracket - 17, 8],
    [outputVectorRightBracket - 10, 8],
    [outputVectorRightBracket - 10, 73],
    [outputVectorRightBracket - 17, 73],
]).fill("none").stroke({ width: bracketWidth, color: bracketColor })

let a = 209;
draw.line(a, 43, a + 18, 43).stroke({ width: bracketWidth, color: bracketColor })
draw.line(a, 49, a + 18, 49).stroke({ width: bracketWidth, color: bracketColor })

window.addEventListener("resize", () => {
    boundingRect = container.getBoundingClientRect();
    draw.node.setAttribute("width", boundingRect.width);
    draw.node.setAttribute("height", boundingRect.height);

    if (boundingRect.width < boundingRect.height) {
        horizontalAxisLimit = boundingRect.width / funcs.calculateHorizontalAxisLimit(boundingRect.width);
    }
    else {
        horizontalAxisLimit = (boundingRect.height / funcs.calculateHorizontalAxisLimit(boundingRect.height)) / (boundingRect.height / boundingRect.width);
    }

    grid.updateGridSize(horizontalAxisLimit);

    pointCol1.redraw();
    pointCol2.redraw();
    pointInput.redraw();

});


// Menu
var menu = document.getElementById("menu");
var menuButton = document.getElementById("menu-button");
menuButton.addEventListener("click", (evt) => {
    toggleMenu();
    evt.stopPropagation();
});

menu.addEventListener("mousedown", evt => {
    evt.stopPropagation();
});

menuButton.addEventListener("mousedown", evt => {
    evt.stopPropagation();
});

function toggleMenu(){
    if(menu.visible){
        menu.style.right = "-200px";
        menu.visible = false;
    }
    else{
        menu.style.right = "8px";
        menu.visible = true;
    }
}

window.addEventListener("mousedown", () => {
    if(menu.visible){
        toggleMenu();
    }
})

window.toggleMenu = toggleMenu;

// Checkboxes
document.getElementById("chkShowInOutVector").addEventListener("change", (evt) => {
    if (evt.target.checked) {
        pointInput.show();
        grid.outputVectorArrow.show();
    }
    else {
        pointInput.hide();
        grid.outputVectorArrow.hide();
    }
});

document.getElementById("chkShowDeterminant").addEventListener("change", (evt) => {
    if (evt.target.checked) {
        grid.showDeterminant();
    }
    else {
        grid.hideDeterminant();
    }
});

document.getElementById("chkShowEigenVectors").addEventListener("change", (evt) => {
    if (evt.target.checked) {
        grid.eigenVectorVisibleChecked = true;
        grid.applyMatrix();
    }
    else {
        grid.hideEigenVectors();
        grid.eigenVectorVisibleChecked = false;
    }
});

document.getElementById("chkSnapToGrid").addEventListener("change", (evt) => {

    pointCol1.snapToGrid = evt.target.checked;
    pointCol2.snapToGrid = evt.target.checked;
    pointInput.snapToGrid = evt.target.checked;
});

// hide some items
pointInput.hide();
grid.outputVectorArrow.hide();
grid.hideDeterminant();


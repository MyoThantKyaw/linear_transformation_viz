export function round(value, step) {
    step || (step = 1.0);
    var inv = 1.0 / step;
    return Math.round(value * inv) / inv;
}

export function calculateHorizontalAxisLimit(widthPx){
    // 
    let l = 360; // minimum container width. Container with less than "l" will be calculated with "l"
    if(widthPx < l){
        widthPx = l;
    }

    let a = 1.5945
    let minGridWidth = 72;

    return Math.pow(widthPx - l, 1/ a) + minGridWidth;
}
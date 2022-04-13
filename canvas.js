/**
 * I couldn't figure out the zooming thing, so credit to https://dev.to/stackfindover/zoom-image-point-with-mouse-wheel-11n3 <3
 */

// Canvas
let ctx;
let pixelCountWidth = 1800;
let pixelCountHeight = 900;

// ID/Class Elements
let colourBlocks;
let menuItems;
let hoveredOverCoords;
let submitButton;
let selectedPixelText;
let canvas;

// Panning / Zooming
let dragging = false;
let start = { x: 0, y: 0 };
let zoom;
let scale = 1;
let point = {x:0,y:0};

// Bubble / Selection
let mouseDownPosition = {x:0, y:0};
let mousedOverPixel = {x:0, y:0};
let selectedPixel = {x:-1, y:-1, "colour": -1};
let colourSwitch = false;
let intervalFlashingSelectedPixel;
let selectedColour = 0;

// Options
let canvasDefaultPosition = {top:0, left:0};

let colours = [
    "#FF0000", "#FF8000", "#FFFF00", "#80FF00",
    "#00FF00", "#00FF80", "#00FFFF", "#0080FF",
    "#0000FF", "#8000FF", "#FF00FF", "#FF0080",
    "#FFFFFF", "#000000"
]

/**
 * Sets the scale and position of the canvas
 */
function setTransform() {
    zoom.style.transform = "translate(" + point.x + "px, " + point.y + "px) scale(" + scale + ")";
}

/**
 * Starts when the page fully loads
 */
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('mousedown', e=>mousedown(e));
    document.addEventListener("wheel", e=>wheel(e));
    document.addEventListener('mousemove', e=>mousemove(e));
    zoom = document.getElementById("zoom-container")

    colourBlocks = document.getElementsByClassName("block");
    menuItems = document.getElementsByClassName("menuitem");
    hoveredOverCoords = document.getElementById("HoveredOverCoords");
    submitButton = document.getElementById("submit");
    selectedPixelText = document.getElementById("SelectedPixel");
    canvas = document.getElementById("canvas");

    ctx = canvas.getContext("2d");

    canvasDefaultPosition.top = canvas.style.top;
    canvasDefaultPosition.left = canvas.style.left;

    canvas.style["transform"] = 'scale(' + zoom + ')';

    for (const [index, pixel] of clientsideData.entries()) {
        let y = (index / pixelCountWidth) >> 0;
        let x = index - (pixelCountWidth * y);
        ctx.fillStyle = colours[pixel];
        ctx.fillRect(x, y, 1, 1);
    }

    Loop();
});

/**
 * Activates on mouse move
 * @param e
 */
function mousemove(e) {
    e.preventDefault();
    if(dragging) {
        point.x = (e.clientX - start.x);
        point.y = (e.clientY - start.y);
        setTransform();

    }

    let canvasClientRect = canvas.getBoundingClientRect()
    let elementRelativeX = e.clientX - canvasClientRect.left;
    let elementRelativeY = e.clientY - canvasClientRect.top;

    mousedOverPixel.x = Math.trunc(elementRelativeX * canvas.width / canvasClientRect.width); // Do not round.
    mousedOverPixel.y = Math.trunc(elementRelativeY * canvas.height / canvasClientRect.height);
    mousedOverPixel.x = mousedOverPixel.x > -1 && mousedOverPixel.x < pixelCountWidth ? mousedOverPixel.x : null;
    mousedOverPixel.y = mousedOverPixel.y > -1 && mousedOverPixel.y < pixelCountHeight ? mousedOverPixel.y : null;

    hoveredOverCoords.innerText = "(" + (mousedOverPixel.x != null && mousedOverPixel.y != null ? mousedOverPixel.x : "NA") + ", " +
                          (mousedOverPixel.y != null && mousedOverPixel.x != null ? mousedOverPixel.y : "NA") + ")";
}

/**
 * Activates on mouse down
 * @param e
 */
function mousedown(e) {
    dragging=true;
    start = { x: e.clientX - point.x, y: e.clientY - point.y };
    mouseDownPosition.x = e.x = e.clientX;
    mouseDownPosition.y = e.y = e.clientY;
    document.onmouseup = mouseup;
}

/**
 * Activates on mouse up
 * @param e
 */
function mouseup(e) {
    dragging = false;

    if(mouseDownPosition.x === e.clientX && mouseDownPosition.y === e.clientY) { // If The mouse didnt move during the mousedown + mouseup event, Its a click
        click(e);
    }

    document.onmouseup = null;
}

/**
 * Axis aligned bounding box, Checks whether the mouse is inside an element
 * @param item
 * @param e
 * @returns {boolean}
 * @constructor
 */
function AABB(item, e) {
    let rect = item.getBoundingClientRect();
    return e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom;

}

/**
 * Outputs pixel to console
 */
function submit() {
    console.log({x: selectedPixel.x, y: selectedPixel.y, colour: selectedColour});
}

/**
 * Resets the zoom of the camera
 */
function resetZoom() {
    scale = 1;
    setTransform();
}

/**
 * Resets the position of the camera
 */
function resetPosition() {
    point = {x:0, y:0};
    setTransform();
}

/**
 * Activates on mouse press and release
 * @param e
 */
function click(e) {
    let onMenuItem = false;
    Array.from(menuItems).forEach((item) => {
        if(AABB(item, e)) {
            onMenuItem = true;
            if(item.classList.contains("block")) {
                Array.from(colourBlocks).forEach((item) => {   // TO:DO Find a better way of doing this, We need to clear the selection border from
                    if (item.classList.contains("border")) {    // All the other boxes when a new one is selected, Doing 2 iterations feels wrong
                        item.classList.remove("border");       // but im yet to come up with a solution. (Not a massive deal tbh, just bugs me)
                    }
                });
                selectedColour = colours.indexOf(item.id);
                if (item.id === "#000000") {
                    document.documentElement.style.setProperty("--animated-border-colour", "white");
                } else {
                    document.documentElement.style.setProperty("--animated-border-colour", "black");
                }
                item.classList.add("border");
            }
        }
    });
    if(AABB(submitButton, e)) {
        onMenuItem = true;
    }

    if (mousedOverPixel.x != null && mousedOverPixel.y != null && !onMenuItem) { // If the mouse is not outside of the canvas, and is not on one of our colour divs
        if (selectedPixel.x !== -1) { // Is this the first time we're selecting a pixel ?
            window.clearInterval(intervalFlashingSelectedPixel);
            updatePixel((selectedPixel.y * pixelCountWidth) + selectedPixel.x, selectedPixel.colour, false);
        }
        selectedPixel.x = mousedOverPixel.x;
        selectedPixel.y = mousedOverPixel.y;
        selectedPixel.colour = clientsideData[(mousedOverPixel.y * pixelCountWidth) + mousedOverPixel.x];

        selectedPixelText.innerText = "(" + selectedPixel.x + ", " + selectedPixel.y + ")";

        intervalFlashingSelectedPixel = window.setInterval(function () {
            let id = (selectedPixel.y * pixelCountWidth) + selectedPixel.x;
            colourSwitch = !colourSwitch;
            if (colourSwitch) {
                updatePixel(id, selectedColour, false);
            } else {
                updatePixel(id, selectedPixel.colour, false);
            }
        }, 500);
    }
}

/**
 * Activates on mouse wheel
 * @param e
 */
function wheel(e) {
    if(mousedOverPixel.x === null || mousedOverPixel.y === null) {return}
    let xs = (e.clientX - point.x) / scale;
    let ys = (e.clientY - point.y) / scale;
    let oldScale = scale;
    (e.deltaY < 0) ? (scale *= 1.2) : (scale /= 1.2);

    if(scale >45 || scale < 0.8){ scale = oldScale; return;}

    point.x = e.clientX - xs * scale;
    point.y = e.clientY - ys * scale;

    setTransform();

}

/**
 * Updates a given pixels colour
 * @param id
 * @param colour
 * @param update
 */
function updatePixel(id, colour, update) { // This function is sexy and you know it
    let y = (id / pixelCountWidth) >> 0;
    let x = id - (pixelCountWidth * y);
    ctx.fillStyle = colours[colour];
    ctx.fillRect(x, y, 1, 1);
    if(update) { // This allows us to change a colour of a pixel temporarily without effecting the data
        clientsideData[id] = colour;
    }
}

/**
 * Does nothing, might use it one day idk
 * @constructor
 */
function Loop() {
    requestAnimationFrame(Loop);
}


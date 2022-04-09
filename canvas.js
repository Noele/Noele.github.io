let dragging = false;
let mousePosition = {x:0, y:0};
let mouseDownPosition = {x:0, y:0};

let canvas;
let hoc;
let sp;
let ctx;
let colourBlocks;
let zoom = 8;
let zoomMin = 1;
let zoomMax = 30

let pixelCountWidth = 1800;
let pixelCountHeight = 900;

let mousedOverPixel = {x:0, y:0};
let selectedPixel = {x:-1, y:-1, "colour": -1};
let colourSwitch = false;

let submitButton;

let intervalFlashingSelectedPixel;

let selectedColour = 0;
let colours = [
    "#FF0000", "#FF8000", "#FFFF00", "#80FF00",
    "#00FF00", "#00FF80", "#00FFFF", "#0080FF",
    "#0000FF", "#8000FF", "#FF00FF", "#FF0080",
    "#FFFFFF", "#000000"
]

document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('mousedown', e=>mousedown(e));
    document.addEventListener('mousemove', e=>mousemove(e));
    document.addEventListener("wheel", e=>wheel(e));

    colourBlocks = document.getElementsByClassName("block");
    hoc = document.getElementById("HoveredOverCoords");
    submitButton = document.getElementById("submit");
    sp = document.getElementById("SelectedPixel");
    canvas = document.getElementById("canvas");

    ctx = canvas.getContext("2d");

    canvas.style["transform"] = 'scale(' + zoom + ')';

    for (const [index, pixel] of clientsideData.entries()) {
        let y = (index / pixelCountWidth) >> 0;
        let x = index - (pixelCountWidth * y);
        ctx.fillStyle = colours[pixel];
        ctx.fillRect(x, y, 1, 1);
    }

    Loop();
});

function mousemove(e) {
    e.preventDefault();
    if(dragging) {
        let offsetX = mousePosition.x - e.clientX;
        let offsetY = mousePosition.y - e.clientY;

        mousePosition.x = e.x;
        mousePosition.y = e.y;

        canvas.style.top = (canvas.offsetTop - offsetY) + "px";
        canvas.style.left = (canvas.offsetLeft - offsetX) + "px";
    }

    let canvasClientRect = canvas.getBoundingClientRect()
    let elementRelativeX = e.clientX - canvasClientRect.left;
    let elementRelativeY = e.clientY - canvasClientRect.top;

    mousedOverPixel.x = Math.trunc(elementRelativeX * canvas.width / canvasClientRect.width); // Do not round.
    mousedOverPixel.y = Math.trunc(elementRelativeY * canvas.height / canvasClientRect.height);
    mousedOverPixel.x = mousedOverPixel.x > -1 && mousedOverPixel.x < pixelCountWidth ? mousedOverPixel.x : null;
    mousedOverPixel.y = mousedOverPixel.y > -1 && mousedOverPixel.y < pixelCountHeight ? mousedOverPixel.y : null;

    hoc.innerText = "(" + (mousedOverPixel.x != null && mousedOverPixel.y != null ? mousedOverPixel.x : "NA") + ", " +
                          (mousedOverPixel.y != null && mousedOverPixel.x != null ? mousedOverPixel.y : "NA") + ")";
}

function mousedown(e) {
    dragging=true;
    mouseDownPosition.x = mousePosition.x = e.clientX;
    mouseDownPosition.y = mousePosition.y = e.clientY;
    document.onmouseup = mouseup;
}

function mouseup(e) {
    dragging = false;

    if(mouseDownPosition.x === e.clientX && mouseDownPosition.y === e.clientY) { // If The mouse didnt move during the mousedown + mouseup event, Its a click
        click(e);
    }

    document.onmouseup = null;
}
function AABB(item, e) {
    let rect = item.getBoundingClientRect();
    return e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom;

}

function submit() {
    console.log({x: selectedPixel.x, y: selectedPixel.y, colour: selectedColour});
}


function click(e) {
    let onDiv = false;
    Array.from(colourBlocks).forEach((item) => {
        if(AABB(item, e)) {
            Array.from(colourBlocks).forEach((item) => {   // TO:DO Find a better way of doing this, We need to clear the selection border from
                if(item.classList.contains("border")) {    // All the other boxes when a new one is selected, Doing 2 iterations feels wrong
                    item.classList.remove("border");       // but im yet to come up with a solution. (Not a massive deal tbh, just bugs me)
                }
            });
            selectedColour = colours.indexOf(item.id);
            if(item.id === "#000000") {
                document.documentElement.style.setProperty("--animated-border-colour", "white");
            } else {
                document.documentElement.style.setProperty("--animated-border-colour", "black");
            }
            item.classList.add("border");
            onDiv = true;
        }
    });
    if(AABB(submitButton, e)) {
        onDiv = true;
    }

    if (mousedOverPixel.x != null && mousedOverPixel.y != null && !onDiv) { // If the mouse is not outside of the canvas, and is not on one of our colour divs
        if (selectedPixel.x !== -1) { // Is this the first time we're selecting a pixel ?
            window.clearInterval(intervalFlashingSelectedPixel);
            updatePixel((selectedPixel.y * pixelCountWidth) + selectedPixel.x, selectedPixel.colour, false);
        }
        selectedPixel.x = mousedOverPixel.x;
        selectedPixel.y = mousedOverPixel.y;
        selectedPixel.colour = clientsideData[(mousedOverPixel.y * pixelCountWidth) + mousedOverPixel.x];

        sp.innerText = "(" + selectedPixel.x + ", " + selectedPixel.y + ")";

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
function wheel(e) {
    if(e.deltaY < 0) { // mousewheel direction check
        zoom = Math.min(zoom += 1, zoomMax);
    } else {
        zoom = Math.max(zoom -= 1, zoomMin);
    }
    canvas.style["transform"] = 'scale(' + zoom + ')';
}

function updatePixel(id, colour, update) { // This function is sexy and you know it
    let y = (id / pixelCountWidth) >> 0;
    let x = id - (pixelCountWidth * y);
    ctx.fillStyle = colours[colour];
    ctx.fillRect(x, y, 1, 1);
    if(update) { // This allows us to change a colour of a pixel temporarily without effecting the data
        clientsideData[id] = colour;
    }
}

function Loop() {
    requestAnimationFrame(Loop);
}


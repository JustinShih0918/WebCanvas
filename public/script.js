const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let brushSize = 5;
let color = '#000000';
let isDrawingMode = false;  // Whether drawing mode is active
let isErasingMode = false;  // Whether eraser mode is active
let isDrawing = false;      // Whether currently actively drawing
let lastX = 0, lastY = 0;
let mouseOffetX = -100, mouseOffsetY = -100;

const brushBtn = document.getElementById('brush');
const eraserBtn = document.getElementById('eraser');

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left - mouseOffetX,
        y: evt.clientY - rect.top - mouseOffsetY
    };
}

// Update UI to reflect active state
function updateButtonStates() {
    brushBtn.classList.toggle('active', isDrawingMode);
    eraserBtn.classList.toggle('active', isErasingMode);
    
    if (isDrawingMode) {
        canvas.style.cursor = 'url("media/brush-icon.png") 0 0, crosshair';
    } else if (isErasingMode) {
        canvas.style.cursor = 'url("media/eraser-icon.png") 0 0, crosshair';
    } else {
        canvas.style.cursor = 'default';
    }
}

brushBtn.addEventListener('click', () => {
    // Toggle drawing mode
    isDrawingMode = !isDrawingMode;
    
    // If turning on drawing mode, turn off erasing mode
    if (isDrawingMode) {
        isErasingMode = false;
        ctx.globalCompositeOperation = 'source-over';
    }
    
    updateButtonStates();
});

eraserBtn.addEventListener('click', () => {
    // Toggle erasing mode
    isErasingMode = !isErasingMode;
    
    // If turning on erasing mode, turn off drawing mode
    if (isErasingMode) {
        isDrawingMode = false;
        ctx.globalCompositeOperation = 'destination-out';
    }
    
    updateButtonStates();
});

document.getElementById('brushSize').addEventListener('change', (e) => brushSize = e.target.value);

document.getElementById('clearCanvas').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isDrawingMode = false;
    isErasingMode = false;
    isDrawing = false;
    ctx.globalCompositeOperation = 'source-over';
    updateButtonStates();
});

canvas.addEventListener('mousedown', (e) => {
    // Only start drawing if in a mode
    if (isDrawingMode || isErasingMode) {
        isDrawing = true;
        const pos = getMousePos(canvas, e);
        lastX = pos.x;
        lastY = pos.y;
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    const pos = getMousePos(canvas, e);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    lastX = pos.x;
    lastY = pos.y;
});

const pickr = Pickr.create({
    el: '#colorPicker',
    theme: 'classic',
    default: '#000000',
    components: {
        preview: true,
        opacity: true,
        hue: true,
        interaction: {
            hex: true,
            rgba: true,
            input: true,
            clear: true,
            save: true
        }
    }
});

pickr.on('change', (colorInstance) => {
    color = colorInstance.toHEXA().toString();
});
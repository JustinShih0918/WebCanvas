const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let brushSize = 5;
let color = '#000000';
let lastX = 0, lastY = 0;


// mode variables
let isDrawingMode = false;
let isErasingMode = false;
let isTextMode = false;
let isCircleMode = false;
let isRectMode = false;
let isTriangleMode = false;
let isShapeDrawing = false;

// is using canvas
let isDrawing = false;


// text input
let textInputActive = false;
let textPositionX = null;
let textPositionY = null;
let fontSize = 20;
let fontFamily = 'Arial';

// get cavas
let startX = 0, startY = 0;
let tempCanvas = document.createElement('canvas');
let tempCtx = tempCanvas.getContext('2d');
tempCanvas.width = canvas.width;
tempCanvas.height = canvas.height;

// Get DOM elements
const brushBtn = document.getElementById('brush');
const eraserBtn = document.getElementById('eraser');
const textBtn = document.getElementById('textTool');  
const textControls = document.getElementById('textControls');
const circleBtn = document.getElementById('circleShape');
const rectBtn = document.getElementById('rectShape');
const triangleBtn = document.getElementById('triangleShape');

// color selector
const selector = Pickr.create({
    el: '#colorSelector',
    theme: 'classic',
    default: '#000000',
    components: {
        preview: true,
        opacity: true,
        hue: true
    }
});

selector.on('change', (newColor) => {
    color = newColor.toHEXA().toString();
});


// get the mouse position
function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
    };
}

// when selecting a botton, do this again to update the mode
function updateButtonStates() {
    brushBtn.classList.toggle('active', isDrawingMode);
    eraserBtn.classList.toggle('active', isErasingMode);
    textBtn.classList.toggle('active', isTextMode);
    circleBtn.classList.toggle('active', isCircleMode);
    rectBtn.classList.toggle('active', isRectMode);
    triangleBtn.classList.toggle('active', isTriangleMode);
    
    textControls.style.display = isTextMode ? 'block' : 'none';
    
    // update cursor based on the mode
    if (isDrawingMode) {
        canvas.style.cursor = 'url("media/brush-icon.png") 0 0, crosshair';
    } else if (isErasingMode) {
        canvas.style.cursor = 'url("media/eraser-icon.png") 0 0, crosshair';
    } else if (isTextMode) {
        canvas.style.cursor = 'text';
    } else if (isCircleMode || isRectMode || isTriangleMode) {
        canvas.style.cursor = 'crosshair';
    } else {
        canvas.style.cursor = 'default';
    }
}

document.getElementById('brushSize').addEventListener('change', (e) => brushSize = e.target.value);
brushBtn.addEventListener('click', () => {
    isDrawingMode = !isDrawingMode;
    
    if (isDrawingMode) {
        isErasingMode = false;
        isTextMode = false;
        isCircleMode = false;
        isRectMode = false;
        isTriangleMode = false;
        ctx.globalCompositeOperation = 'source-over';
    }
    
    updateButtonStates();
});

eraserBtn.addEventListener('click', () => {
    isErasingMode = !isErasingMode;
    
    if (isErasingMode) {
        isDrawingMode = false;
        isTextMode = false;
        isCircleMode = false;
        isRectMode = false;
        isTriangleMode = false;
        ctx.globalCompositeOperation = 'destination-out';
    }
    
    updateButtonStates();
});

// Shape button event handlers
circleBtn.addEventListener('click', () => {
    isCircleMode = !isCircleMode;
    
    if (isCircleMode) {
        isDrawingMode = false;
        isErasingMode = false;
        isTextMode = false;
        isRectMode = false;
        isTriangleMode = false;
        ctx.globalCompositeOperation = 'source-over';
    }
    
    updateButtonStates();
});

rectBtn.addEventListener('click', () => {
    isRectMode = !isRectMode;
    
    if (isRectMode) {
        isDrawingMode = false;
        isErasingMode = false;
        isTextMode = false;
        isCircleMode = false;
        isTriangleMode = false;
        ctx.globalCompositeOperation = 'source-over';
    }
    
    updateButtonStates();
});

triangleBtn.addEventListener('click', () => {
    isTriangleMode = !isTriangleMode;
    
    if (isTriangleMode) {
        isDrawingMode = false;
        isErasingMode = false;
        isTextMode = false;
        isCircleMode = false;
        isRectMode = false;
        ctx.globalCompositeOperation = 'source-over';
    }
    
    updateButtonStates();
});

// text operations
textBtn.addEventListener('click', () => {
    isTextMode = !isTextMode;
    
    if (isTextMode) {
        isDrawingMode = false;
        isErasingMode = false;
        isCircleMode = false;
        isRectMode = false;
        isTriangleMode = false;
        ctx.globalCompositeOperation = 'source-over';
    } else {
        textInputActive = false;
    }
    
    updateButtonStates();
});

document.getElementById('fontFamily').addEventListener('change', (e) => {
    fontFamily = e.target.value;
});

document.getElementById('fontSize').addEventListener('change', (e) => {
    fontSize = parseInt(e.target.value);
});

// Replace the current canvas text click event handler with this improved version

canvas.addEventListener('click', (e) => {
    if (!isTextMode) return;
    
    // If there's already an active text input, remove it first
    if (textInputActive) {
        const existingInput = document.getElementById('canvasTextInput');
        if (existingInput) {
            document.body.removeChild(existingInput);
        }
        textInputActive = false;
    }
    
    const pos = getMousePos(canvas, e);
    textPositionX = pos.x;
    textPositionY = pos.y;
    
    // make a new text
    textInputActive = true;
    const canvasRect = canvas.getBoundingClientRect();
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.id = 'canvasTextInput';
    inputElement.style.position = 'absolute';
    inputElement.style.left = (canvasRect.left + pos.x) + 'px';
    inputElement.style.top = (canvasRect.top + pos.y - 15) + 'px'; 
    inputElement.style.fontFamily = fontFamily;
    inputElement.style.fontSize = fontSize + 'px';
    inputElement.style.color = color;
    inputElement.style.background = 'transparent';
    inputElement.style.border = '1px dotted #999';
    inputElement.style.outline = 'none';
    inputElement.style.minWidth = '100px';
    inputElement.style.zIndex = 1000;
    document.body.appendChild(inputElement);
    inputElement.focus();
    
    const enterHandler = function(e) {
        if (e.key === 'Enter') {
            confirmText(inputElement);
        }
    };
    inputElement.addEventListener('keydown', enterHandler);
    inputElement.enterHandler = enterHandler;
});

function confirmText(inputElement) {
    const text = inputElement.value;
    if (text && textPositionX !== null && textPositionY !== null) {
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textBaseline = 'middle';
        ctx.fillText(text, textPositionX, textPositionY);
    }
    
    // Clean
    if (inputElement.enterHandler) {
        inputElement.removeEventListener('keydown', inputElement.enterHandler);
    }
    if (document.body.contains(inputElement)) {
        document.body.removeChild(inputElement);
    }
    
    // close text input
    textInputActive = false;
}


// do clear
document.getElementById('clearCanvas').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // reset
    isDrawingMode = false;
    isErasingMode = false;
    isTextMode = false;
    isDrawing = false;
    isCircleMode = false;
    isRectMode = false;
    isTriangleMode = false;
    isShapeDrawing = false;
});

// Shape drawing
canvas.addEventListener('mousedown', (e) => {
    if (isDrawingMode || isErasingMode) {
        isDrawing = true;
        const pos = getMousePos(canvas, e);
        lastX = pos.x;
        lastY = pos.y;
    } else if (isCircleMode || isRectMode || isTriangleMode) {
        isShapeDrawing = true;
        const pos = getMousePos(canvas, e);
        startX = pos.x;
        startY = pos.y;
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (isShapeDrawing) {
        const pos = getMousePos(canvas, e);
        drawShape(startX, startY, pos.x, pos.y);
        isShapeDrawing = false;
    }
    isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
    isShapeDrawing = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
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
    } else if (isShapeDrawing) {
        const pos = getMousePos(canvas, e);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        
        previewShape(startX, startY, pos.x, pos.y);
    }
});

function previewShape(x1, y1, x2, y2) {
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    
    if (isCircleMode) {
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        ctx.beginPath();
        ctx.arc(x1, y1, radius, 0, Math.PI * 2);
        ctx.stroke();
    } else if (isRectMode) {
        const width = x2 - x1;
        const height = y2 - y1;
        ctx.beginPath();
        ctx.rect(x1, y1, width, height);
        ctx.stroke();
    } else if (isTriangleMode) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x1 - (x2 - x1), y2);
        ctx.closePath();
        ctx.stroke();
    }
}

function drawShape(x1, y1, x2, y2) {
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    
    if (isCircleMode) {
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        ctx.beginPath();
        ctx.arc(x1, y1, radius, 0, Math.PI * 2);
        ctx.stroke();
    } else if (isRectMode) {
        const width = x2 - x1;
        const height = y2 - y1;
        ctx.beginPath();
        ctx.rect(x1, y1, width, height);
        ctx.stroke();
    } else if (isTriangleMode) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x1 - (x2 - x1), y2);
        ctx.closePath();
        ctx.stroke();
    }
}
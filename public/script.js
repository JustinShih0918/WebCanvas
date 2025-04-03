const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let brushSize = 5;
let color = '#000000';
let isDrawingMode = false;
let isErasingMode = false;
let isTextMode = false;  // New text mode flag
let isDrawing = false;
let lastX = 0, lastY = 0;

// Add these variables at the top with other state variables
let textInputActive = false;
let textPositionX = null;
let textPositionY = null;

// Add shape state variables at the top
let isCircleMode = false;
let isRectMode = false;
let isTriangleMode = false;
let isShapeDrawing = false;
let startX = 0, startY = 0;
let tempCanvas = document.createElement('canvas');
let tempCtx = tempCanvas.getContext('2d');

// Configure temp canvas
tempCanvas.width = canvas.width;
tempCanvas.height = canvas.height;

// Get DOM elements
const brushBtn = document.getElementById('brush');
const eraserBtn = document.getElementById('eraser');
const textBtn = document.getElementById('textTool');  // New text button
const textControls = document.getElementById('textControls'); // Text controls container

// Get shape buttons
const circleBtn = document.getElementById('circleShape');
const rectBtn = document.getElementById('rectShape');
const triangleBtn = document.getElementById('triangleShape');

// Text properties
let fontSize = 20;
let fontFamily = 'Arial';

// Replace the getMousePos function with this improved version
function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
    };
}

// Update UI to reflect active state
function updateButtonStates() {
    brushBtn.classList.toggle('active', isDrawingMode);
    eraserBtn.classList.toggle('active', isErasingMode);
    textBtn.classList.toggle('active', isTextMode);
    circleBtn.classList.toggle('active', isCircleMode);
    rectBtn.classList.toggle('active', isRectMode);
    triangleBtn.classList.toggle('active', isTriangleMode);
    
    // Show/hide text controls
    textControls.style.display = isTextMode ? 'block' : 'none';
    
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

// Replace or update your existing text button handler
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
        // Reset text input when turning off text mode
        textInputActive = false;
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

// Handle font family changes
document.getElementById('fontFamily').addEventListener('change', (e) => {
    fontFamily = e.target.value;
});

// Handle font size changes
document.getElementById('fontSize').addEventListener('change', (e) => {
    fontSize = parseInt(e.target.value);
});

// Replace canvas click event for text tool
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
    
    // Create dynamic text input
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
    
    // Handle Enter key
    const enterHandler = function(e) {
        if (e.key === 'Enter') {
            finalizeText(inputElement);
        }
    };
    inputElement.addEventListener('keydown', enterHandler);
    
    // Replace document click handler with this
    let clickHandler;
    setTimeout(() => {
        clickHandler = function handleClick(evt) {
            if (evt.target !== inputElement && evt.target !== canvas) {
                finalizeText(inputElement);
                document.removeEventListener('click', clickHandler);
            }
        };
        document.addEventListener('click', clickHandler);
    }, 100);
    
    // Store references to event handlers for cleanup
    inputElement.enterHandler = enterHandler;
    inputElement.clickHandler = clickHandler;
});

// Function to finalize text and place on canvas
function finalizeText(inputElement) {
    const text = inputElement.value;
    if (text && textPositionX !== null && textPositionY !== null) {
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textBaseline = 'middle';
        ctx.fillText(text, textPositionX, textPositionY);
    }
    
    // Clean up event listeners
    if (inputElement.enterHandler) {
        inputElement.removeEventListener('keydown', inputElement.enterHandler);
    }
    if (inputElement.clickHandler) {
        document.removeEventListener('click', inputElement.clickHandler);
    }
    
    // Clean up DOM element
    if (document.body.contains(inputElement)) {
        document.body.removeChild(inputElement);
    }
    
    textInputActive = false;
}

document.getElementById('brushSize').addEventListener('change', (e) => brushSize = e.target.value);

// Update the clearCanvas event listener
document.getElementById('clearCanvas').addEventListener('click', () => {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Reset all states
    isDrawingMode = false;
    isErasingMode = false;
    isTextMode = false;
    isDrawing = false;
    isCircleMode = false;
    isRectMode = false;
    isTriangleMode = false;
    isShapeDrawing = false;
});

// Shape drawing event handlers
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
        // Store the current canvas state for preview
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
        // Existing drawing code...
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
        
        // Preview the shape without flickering
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        
        previewShape(startX, startY, pos.x, pos.y);
    }
});

// Function to preview shapes while dragging
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

// Function to draw the final shape
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
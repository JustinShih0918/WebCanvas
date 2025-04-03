const canvas = document.getElementById('Canvas');
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
let isImageMode = false;

// is using canvas
let isDrawing = false;

// text input
let textInputActive = false;
let textPositionX = null;
let textPositionY = null;
let fontSize = 20;
let fontFamily = 'Arial';

// image variables
let currentImage = null;
let imagePositionX = 0;
let imagePositionY = 0;
let isImagePlacing = false;

// get canvas
let startX = 0, startY = 0;
let tempCanvas = document.createElement('canvas');
let tempCtx = tempCanvas.getContext('2d');
tempCanvas.width = canvas.width;
tempCanvas.height = canvas.height;

// Get DOM elements
const brushBtn = document.getElementById('brush');
const eraserBtn = document.getElementById('eraser');
const textBtn = document.getElementById('textBtn');  
const textControls = document.getElementById('textControls');
const circleBtn = document.getElementById('circle');
const rectBtn = document.getElementById('rect');
const triangleBtn = document.getElementById('triangle');
const imageBtn = document.getElementById('imageBtn');
const imageControls = document.getElementById('imageControls');
const imageUpload = document.getElementById('imageUpload');
const uploadImageBtn = document.getElementById('uploadImageBtn');

// color selector
const selector = Pickr.create({
    el: '#colorSelector',
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

selector.on('change', (newColor) => {
    // Update the color variable
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

// when selecting a button, do this again to update the mode
function updateButtonStates() {
    brushBtn.classList.toggle('active', isDrawingMode);
    eraserBtn.classList.toggle('active', isErasingMode);
    textBtn.classList.toggle('active', isTextMode);
    circleBtn.classList.toggle('active', isCircleMode);
    rectBtn.classList.toggle('active', isRectMode);
    triangleBtn.classList.toggle('active', isTriangleMode);
    imageBtn.classList.toggle('active', isImageMode);
    
    // Only show text controls, not image controls
    textControls.style.display = isTextMode ? 'block' : 'none';
    
    // Update cursor based on mode
    if (isDrawingMode) canvas.style.cursor = 'url("media/brush-icon.png") 0 0, crosshair';
    else if (isErasingMode) canvas.style.cursor = 'url("media/eraser-icon.png") 0 0, crosshair';
    else if (isTextMode) canvas.style.cursor = 'text';
    else if (isImageMode && currentImage) canvas.style.cursor = 'move';
    else if (isImageMode) canvas.style.cursor = 'copy';
    else if(isCircleMode) canvas.style.cursor = 'url("media/circle.png") 0 0, crosshair';
    else if(isRectMode) canvas.style.cursor = 'url("media/rectangle.png") 0 0, crosshair';
    else if(isTriangleMode) canvas.style.cursor = 'url("media/triangle.png") 0 0, crosshair';
    else if(isImagePlacing) canvas.style.cursor = 'move';
    else canvas.style.cursor = 'default';
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
        isImageMode = false;
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
        isImageMode = false;
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
        isImageMode = false;
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
        isImageMode = false;
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
        isImageMode = false;
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
        isImageMode = false;
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

// Modify the image tool button handler
imageBtn.addEventListener('click', () => {
    // If already in image mode, toggle it off
    if (isImageMode) {
        isImageMode = false;
        currentImage = null;
        updateButtonStates();
        return;
    }
    
    // Otherwise, enter image mode and directly open file picker
    isImageMode = true;
    isDrawingMode = false;
    isErasingMode = false;
    isTextMode = false;
    isCircleMode = false;
    isRectMode = false;
    isTriangleMode = false;
    ctx.globalCompositeOperation = 'source-over';
    
    // Open file dialog immediately
    imageUpload.click();
    
    updateButtonStates();
});

// Keep the file input change handler the same
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
        loadImage(file);
    }
});

// Function to load image from file
function loadImage(file) {
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const img = new Image();
        
        img.onload = function() {
            currentImage = img;
            // Scale very large images down to fit
            const maxDimension = Math.max(img.width, img.height);
            if (maxDimension > canvas.width / 2) {
                const scale = (canvas.width / 2) / maxDimension;
                img.width *= scale;
                img.height *= scale;
            }
            updateButtonStates();
            showMessage('Click on canvas to place image', 'info');
        };
        
        img.src = event.target.result;
    };
    
    reader.readAsDataURL(file);
}

// do clear
document.getElementById('clearBtn').addEventListener('click', () => {
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
    isImageMode = false;
    currentImage = null;
    isImagePlacing = false;
    
    updateButtonStates();
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
    } else if (isImageMode && currentImage) {
        isImagePlacing = true;
        const pos = getMousePos(canvas, e);
        imagePositionX = pos.x - (currentImage.width / 2);
        imagePositionY = pos.y - (currentImage.height / 2);
        
        // Save the current canvas state
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);
        
        // Draw the image at the initial position
        ctx.drawImage(currentImage, imagePositionX, imagePositionY, currentImage.width, currentImage.height);
        return;
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (isShapeDrawing) {
        const pos = getMousePos(canvas, e);
        drawShape(startX, startY, pos.x, pos.y);
        isShapeDrawing = false;
    }
    
    // Add this block to exit image mode after placing an image
    if (isImagePlacing && currentImage) {
        // After placing the image, exit image mode
        isImageMode = false;
        currentImage = null;
        updateButtonStates(); // Update UI to reflect this change
        showMessage('Image placed successfully', 'success');
    }
    
    isDrawing = false;
    isImagePlacing = false;
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
    isShapeDrawing = false;
    isImagePlacing = false;
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
    } else if (isImagePlacing && currentImage) {
        const pos = getMousePos(canvas, e);
        imagePositionX = pos.x - (currentImage.width / 2);
        imagePositionY = pos.y - (currentImage.height / 2);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.drawImage(currentImage, imagePositionX, imagePositionY, currentImage.width, currentImage.height);
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

document.getElementById('downloadBtn').addEventListener('click', downloadCanvas);

async function downloadCanvas() {
    try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        
        // Get timestamp for filename suggestion
        const timestamp = new Date().toISOString().slice(0,19).replace(/[-:T]/g, '');
        const suggestedName = `web-canvas-${timestamp}.png`;
        
        // Try to use the File System Access API (Chrome, Edge)
        if ('showSaveFilePicker' in window) {
            try {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: suggestedName,
                    types: [{
                        description: 'PNG Image',
                        accept: {'image/png': ['.png']},
                    }]
                });
                
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
                
                showMessage('Image saved successfully!', 'success');
                return;
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('File System Access API error:', err);
                }
            }
        }
        
        if (window.navigator && window.navigator.msSaveBlob) {
            window.navigator.msSaveBlob(blob, suggestedName);
            showMessage('Image downloaded!', 'success');
            return;
        }
        
        const link = document.createElement('a');
        link.download = suggestedName;
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href); // Clean up
        
        showMessage('Image downloaded!', 'success');
    } catch (err) {
        console.error('Error downloading canvas:', err);
        showMessage('Failed to download image', 'error');
    }
}

// Optional: Add a simple notification system
function showMessage(message, type = 'info') {
    const msgDiv = document.createElement('div');
    msgDiv.className = `alert alert-${type} message-notification`;
    msgDiv.textContent = message;
    document.body.appendChild(msgDiv);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        msgDiv.style.opacity = '0';
        setTimeout(() => document.body.removeChild(msgDiv), 500);
    }, 3000);
}

// Add at the end of your script or in document ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="cut"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
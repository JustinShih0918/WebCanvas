const canvas = document.getElementById('Canvas');
const ctx = canvas.getContext('2d');
let brushSize = 5;
let color = '#000000';
let lastX = 0, lastY = 0;
let startX = 0, startY = 0;
let history = [];
let curHistoryIdx = -1;
const MAX_HISTORY = 50;

// mode variables
let isDrawingMode = false;
let erasingMode = false;
let textMode = false;
let circleMode = false;
let rectMode = false;
let triangleMode = false;

// is using canvas
let isDrawing = false;
let isShapeDrawing = false;
let isImgMode = false;

// text input
let textInputActive = false;
let textPosX = null;
let textPosY = null;
let fontSize = 20;
let fontType = 'Arial';

// image variables
let curImg = null;
let imgPosX = 0;
let imgPosY = 0;
let placingImg = false;

// tmp
let tmpCanvas = document.createElement('canvas');
let tmpCtx = tmpCanvas.getContext('2d');
tmpCanvas.width = canvas.width;
tmpCanvas.height = canvas.height;

// Get objects
const brushBtn = document.getElementById('brush');
const eraserBtn = document.getElementById('eraser');
const textBtn = document.getElementById('textBtn');  
const textControls = document.getElementById('textControls');
const circleBtn = document.getElementById('circle');
const rectBtn = document.getElementById('rect');
const triangleBtn = document.getElementById('triangle');
const imageBtn = document.getElementById('imageBtn');
const imgUpload = document.getElementById('imgUpload');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

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
            save: true
        }
    }
});

selector.on('change', (newColor) => {
    // Update the color variable
    color = newColor.toHEXA().toString();
});

// save history
function saveHistory(){
    if(curHistoryIdx < history.length - 1){
        history = history.slice(0, curHistoryIdx + 1);
    }

    const curMove = canvas.toDataURL();
    history.push(curMove);
    curHistoryIdx = history.length - 1;
    console.log(curHistoryIdx);

    if(history.length > MAX_HISTORY){
        history.shift();
        curHistoryIdx--;
    }
    updateUndoRedoBtn();
}

function updateUndoRedoBtn() {
    undoBtn.disabled = (curHistoryIdx <= 0);
    redoBtn.disabled = (curHistoryIdx >= history.length - 1);
}

function doRestore(move) {
    const img = new Image();
    img.onload = function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    }
    img.src = move;
}

undoBtn.addEventListener('click', () => {
    if(curHistoryIdx > 0){
        curHistoryIdx--;
        doRestore(history[curHistoryIdx]);
        updateUndoRedoBtn();
    }
    else showMessage('No more undo available', 'warning');
});

redoBtn.addEventListener('click', () => {
    if(curHistoryIdx < history.length - 1){
        curHistoryIdx++;
        doRestore(history[curHistoryIdx]);
        updateUndoRedoBtn();
    }
    else showMessage('No more redo available', 'warning');
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
    toggleButtons();
    textControls.style.display = textMode ? 'block' : 'none';
    
    // Update cursor based on mode
    switch (true) {
        case isDrawingMode:
            canvas.style.cursor = 'url("media/brush-icon.png") 0 0, crosshair';
            break;
        case erasingMode:
            canvas.style.cursor = 'url("media/eraser-icon.png") 0 0, crosshair';
            break;
        case textMode:
            canvas.style.cursor = 'text';
            break;
        case isImgMode && curImg:
            canvas.style.cursor = 'move';
            break;
        case isImgMode:
            canvas.style.cursor = 'copy';
            break;
        case circleMode:
            canvas.style.cursor = 'url("media/circle.png") 0 0, crosshair';
            break;
        case rectMode:
            canvas.style.cursor = 'url("media/rectangle.png") 0 0, crosshair';
            break;
        case triangleMode:
            canvas.style.cursor = 'url("media/triangle.png") 0 0, crosshair';
            break;
        default:
            canvas.style.cursor = 'default';
    }
}

function toggleButtons(){
    brushBtn.classList.toggle('active', isDrawingMode);
    eraserBtn.classList.toggle('active', erasingMode);
    textBtn.classList.toggle('active', textMode);
    circleBtn.classList.toggle('active', circleMode);
    rectBtn.classList.toggle('active', rectMode);
    triangleBtn.classList.toggle('active', triangleMode);
    imageBtn.classList.toggle('active', isImgMode);
}

document.getElementById('brushSize').addEventListener('change', (e) => brushSize = e.target.value);
brushBtn.addEventListener('click', () => {
    isDrawingMode = !isDrawingMode;
    
    if (isDrawingMode) {
        erasingMode = false;
        textMode = false;
        circleMode = false;
        rectMode = false;
        triangleMode = false;
        isImgMode = false;
        ctx.globalCompositeOperation = 'source-over';
    }
    
    updateButtonStates();
});

eraserBtn.addEventListener('click', () => {
    erasingMode = !erasingMode;
    
    if (erasingMode) {
        isDrawingMode = false;
        textMode = false;
        circleMode = false;
        rectMode = false;
        triangleMode = false;
        isImgMode = false;
        ctx.globalCompositeOperation = 'destination-out';
    }
    
    updateButtonStates();
});

// Shape button event handlers
circleBtn.addEventListener('click', () => {
    circleMode = !circleMode;
    
    if (circleMode) {
        isDrawingMode = false;
        erasingMode = false;
        textMode = false;
        rectMode = false;
        triangleMode = false;
        isImgMode = false;
        ctx.globalCompositeOperation = 'source-over';
    }
    
    updateButtonStates();
});

rectBtn.addEventListener('click', () => {
    rectMode = !rectMode;
    
    if (rectMode) {
        isDrawingMode = false;
        erasingMode = false;
        textMode = false;
        circleMode = false;
        triangleMode = false;
        isImgMode = false;
        ctx.globalCompositeOperation = 'source-over';
    }
    
    updateButtonStates();
});

triangleBtn.addEventListener('click', () => {
    triangleMode = !triangleMode;
    
    if (triangleMode) {
        isDrawingMode = false;
        erasingMode = false;
        textMode = false;
        circleMode = false;
        rectMode = false;
        isImgMode = false;
        ctx.globalCompositeOperation = 'source-over';
    }
    
    updateButtonStates();
});

// text operations
textBtn.addEventListener('click', () => {
    textMode = !textMode;
    
    if (textMode) {
        isDrawingMode = false;
        erasingMode = false;
        circleMode = false;
        rectMode = false;
        triangleMode = false;
        isImgMode = false;
        ctx.globalCompositeOperation = 'source-over';
    } else {
        textInputActive = false;
    }
    
    updateButtonStates();
});

document.getElementById('fontType').addEventListener('change', (e) => {
    fontType = e.target.value;
});

document.getElementById('fontSize').addEventListener('change', (e) => {
    fontSize = parseInt(e.target.value);
});

canvas.addEventListener('click', (e) => {
    if (!textMode) return;
    
    // If there's already an active text input, remove it first
    if (textInputActive) {
        const existingInput = document.getElementById('canvasTextInput');
        if (existingInput) {
            document.body.removeChild(existingInput);
        }
        textInputActive = false;
    }
    
    const pos = getMousePos(canvas, e);
    textPosX = pos.x;
    textPosY = pos.y;
    
    // make a new text
    textInputActive = true;
    const textInput = makeText(textPosX, textPosY);
    document.body.appendChild(textInput);
    textInput.focus();
    
    const enterHandler = function(e) {
        if (e.key === 'Enter') {
            confirmText(textInput);
        }
    };
    textInput.addEventListener('keydown', enterHandler);
    textInput.enterHandler = enterHandler;
});

function makeText(posX, posY){
    const canvasRect = canvas.getBoundingClientRect();
    let text = document.createElement('input');
    text.type = 'text';
    text.id = 'canvasTextInput';
    text.style.fontType = fontType;
    text.style.fontSize = fontSize + 'px';
    text.style.position = 'absolute';
    text.style.left = (canvasRect.left + posX) + 'px';
    text.style.top = (canvasRect.top + posY - 15) + 'px'; 
    text.style.color = color;
    text.style.background = 'transparent';
    text.style.border = '1px dotted #999';
    text.style.outline = 'none';
    text.style.minWidth = '100px';
    text.style.zIndex = 1000;
    return text;
}

function confirmText(inputElement) {
    const text = inputElement.value;
    if (text && textPosX !== null && textPosY !== null) {
        ctx.font = `${fontSize}px ${fontType}`;
        ctx.fillStyle = color;
        ctx.textBaseline = 'middle';
        ctx.fillText(text, textPosX, textPosY);
        saveHistory();
    }
    
    // Clean
    if (inputElement.enterHandler) {
        inputElement.removeEventListener('keydown', inputElement.enterHandler);
    }
    if (document.body.contains(inputElement)) {
        document.body.removeChild(inputElement);
    }
    textInputActive = false;
}


// image upload
imageBtn.addEventListener('click', () => {
    if (isImgMode) {
        isImgMode = false;
        curImg = null;
        updateButtonStates();
        return;
    }
    
    isImgMode = true;
    isDrawingMode = false;
    erasingMode = false;
    textMode = false;
    circleMode = false;
    rectMode = false;
    triangleMode = false;
    ctx.globalCompositeOperation = 'source-over';
    
    imgUpload.click();
    
    updateButtonStates();
});

imgUpload.addEventListener('change', (e) => {
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
            curImg = img;
            // let it fit 
            const maxDim = Math.max(img.width, img.height);
            if (maxDim > canvas.width / 2) {
                const scale = (canvas.width / 2) / maxDim;
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
    tmpCtx.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
    
    // reset
    isDrawingMode = false;
    erasingMode = false;
    textMode = false;
    isDrawing = false;
    circleMode = false;
    rectMode = false;
    triangleMode = false;
    isShapeDrawing = false;
    isImgMode = false;
    curImg = null;
    placingImg = false;
    history = [];
    curHistoryIdx = -1;
    
    saveHistory();
    updateButtonStates();
    showMessage('Canvas cleared', 'success');
});

// Shape drawing
canvas.addEventListener('mousedown', (e) => {
    const pos = getMousePos(canvas, e);
    if (isDrawingMode || erasingMode) {
        isDrawing = true;
        lastX = pos.x;
        lastY = pos.y;
    } else if (circleMode || rectMode || triangleMode) {
        isShapeDrawing = true;
        startX = pos.x;
        startY = pos.y;
        tmpCtx.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
        tmpCtx.drawImage(canvas, 0, 0);
    } else if (isImgMode && curImg) {
        placingImg = true;
        imgPosX = pos.x - (curImg.width / 2);
        imgPosY = pos.y - (curImg.height / 2);
        
        tmpCtx.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
        tmpCtx.drawImage(canvas, 0, 0);
        
        ctx.drawImage(curImg, imgPosX, imgPosY, curImg.width, curImg.height);
        return;
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (isShapeDrawing) {
        const pos = getMousePos(canvas, e);
        drawShape(startX, startY, pos.x, pos.y);
        isShapeDrawing = false;
        saveHistory();
    }
    
    if (placingImg && curImg) {
        isImgMode = false;
        curImg = null;
        updateButtonStates();
        showMessage('Image placed successfully', 'success');
        saveHistory();
    }
    
    if(isDrawing) saveHistory();

    isDrawing = false;
    placingImg = false;
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
    isShapeDrawing = false;
    placingImg = false;
});

canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e);
    if (isDrawing) {
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tmpCanvas, 0, 0);
        previewShape(startX, startY, pos.x, pos.y);
    } else if (placingImg && curImg) {
        imgPosX = pos.x - (curImg.width / 2);
        imgPosY = pos.y - (curImg.height / 2);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tmpCanvas, 0, 0);
        ctx.drawImage(curImg, imgPosX, imgPosY, curImg.width, curImg.height);
    }
});

function previewShape(x1, y1, x2, y2) {
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    
    if (circleMode) {
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        ctx.beginPath();
        ctx.arc(x1, y1, radius, 0, Math.PI * 2);
        ctx.stroke();
    } else if (rectMode) {
        const width = x2 - x1;
        const height = y2 - y1;
        ctx.beginPath();
        ctx.rect(x1, y1, width, height);
        ctx.stroke();
    } else if (triangleMode) {
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
    
    if (circleMode) {
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        ctx.beginPath();
        ctx.arc(x1, y1, radius, 0, Math.PI * 2);
        ctx.stroke();
    } else if (rectMode) {
        const width = x2 - x1;
        const height = y2 - y1;
        ctx.beginPath();
        ctx.rect(x1, y1, width, height);
        ctx.stroke();
    } else if (triangleMode) {
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
        const imgD = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        
        const suggestedName = `web-canvas.png`;
        
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
                await writable.write(imgD);
                await writable.close();
                
                showMessage('Image saved successfully!', 'success');
                return;
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('File System API error:', err);
                }
            }
        }
        
        if (window.navigator && window.navigator.msSaveBlob) {
            window.navigator.msSaveBlob(imgD, suggestedName);
            showMessage('Image downloaded!', 'success');
            return;
        }
        
        const link = document.createElement('a');
        link.download = suggestedName;
        link.href = URL.createObjectURL(imgD);
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

function showMessage(message, type = 'info') {
    const msgDiv = document.createElement('div');
    msgDiv.className = `alert alert-${type} message-notification`;
    msgDiv.textContent = message;
    document.body.appendChild(msgDiv);
    
    setTimeout(() => {
        msgDiv.style.opacity = '0';
        setTimeout(() => document.body.removeChild(msgDiv), 500);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    saveHistory();
    updateButtonStates();
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="cut"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
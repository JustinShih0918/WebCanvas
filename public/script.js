const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let brushSize = 5;
let color = '#000000';
let erasing = false;
let lastX = 0, lastY = 0;

document.getElementById('brush').addEventListener('click', () => erasing = false);
document.getElementById('eraser').addEventListener('click', () => erasing = true);
document.getElementById('brushSize').addEventListener('change', (e) => brushSize = e.target.value);
document.getElementById('clearCanvas').addEventListener('click', () => ctx.clearRect(0, 0, canvas.width, canvas.height));

canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
});
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mousemove', draw);

function draw(e) {
    if (!drawing) return;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = erasing ? '#FFFFFF' : color;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    lastX = e.offsetX;
    lastY = e.offsetY;
}

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

var canvas = document.createElement('canvas');

canvas.style.width = '100%';
canvas.style.height = '100%';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.style.position = 'absolute';
canvas.style.left = 0;
canvas.style.top = 0;
canvas.style.zIndex = 100000;
canvas.style.opacity = 0.3;
canvas.style.pointerEvents = 'none'; 
document.body.appendChild(canvas);
var context = canvas.getContext('2d');

window.addEventListener('mousemove', function (e) {

    var y = e.pageY;
    var x = window.screenX;
    var width = window.innerWidth;
    var height = 20;
    context.rect(x, y, width, height);
    context.fillStyle = 'yellow';
    context.fill();
        
});

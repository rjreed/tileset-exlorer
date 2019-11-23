const conf = {
  base_tile_height: 32,
  base_tile_width: 32,
  fps: 60,
  highlight_color: "rgba(225,225,225,0.5)",
  tooltip_bg_color: "rgba(225,225,225,.9)",
  grid_color: "green"
};

const hooks = {
  canvas: "js-canvas",
  file_upload: "js-file-upload",
  tile_height: "js-tile-height",
  tile_width: "js-tile-width",
  grid_color: "js-grid-color"
};

let interval = 1000 / conf.fps;
let lastTime = new Date().getTime();
let currentTime = 0;
let delta = 0;

let img;

let inputs = document.getElementsByTagName("input");

const canvas = el(hooks.canvas);
const ctx = canvas.getContext("2d");

let bounds = canvas.getBoundingClientRect();

let mouse = {
  x: 0,
  y: 0,
  gridX: 0,
  gridY: 0,
  within_bounds: false
};

conf.grid_color = el(hooks.grid_color).value;

function el(hook) {
  return document.getElementsByClassName(hook)[0];
}

function update() {
  bounds = canvas.getBoundingClientRect();
  conf.tile_height = el(hooks.tile_height).value || conf.base_tile_height;
  conf.tile_width = el(hooks.tile_width).value || conf.base_tile_width;
  conf.grid_color = el(hooks.grid_color).value;
}

function read_image() {
  if (this.files && this.files[0]) {
    const FR = new FileReader();
    
    FR.onload = function(e) {
      conf.tile_height = el(hooks.tile_height).value || conf.base_tile_height;
      conf.tile_width = el(hooks.tile_width).value || conf.base_tile_width;

      const g = new Image();

      g.addEventListener("load", function() {
        canvas.width = g.width + 225;
        canvas.height = g.height + 100;
        bounds = canvas.getBoundingClientRect();
        img = g;

        mainLoop();
      });

      g.src = e.target.result;
    };

    FR.readAsDataURL(this.files[0]);
  }
}

el(hooks.file_upload).addEventListener("change", read_image, false);

function draw_grid() {
  let cw = img.width;
  let ch = img.height;

  let w = cw / conf.tile_width;
  let h = ch / conf.tile_height;

  for (let i = 0; i <= w; i++) {
    let j = i * conf.tile_width;
    
    ctx.strokeStyle = conf.grid_color;
    ctx.beginPath(); // Start a new path
    ctx.moveTo(j, 0); // Move the pen to (30, 50)
    ctx.lineTo(j, img.height); // Draw a line to (150, 100)
    ctx.stroke(); // Render the path
  }

  for (let i = 0; i <= h; i++) {
    let j = i * conf.tile_height;
    
    ctx.beginPath(); // Start a new path
    ctx.moveTo(0, j); // Move the pen to (30, 50)
    ctx.lineTo(img.width, j); // Draw a line to (150, 100)
    ctx.stroke(); // Render the path
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  draw_grid();

  if (mouse.within_bounds) {
    highlight_tile(mouse.offsetX, mouse.offsetY);

    draw_tooltip(mouse.x, mouse.y);
  }
}

function mainLoop() {
  window.requestAnimationFrame(mainLoop);

  let currentTime = new Date().getTime();
  let delta = currentTime - lastTime;

  if (delta > interval) {
    render();

    lastTime = currentTime - (delta % interval);
  }

}

function highlight_tile(x, y) {
  ctx.fillStyle = conf.highlight_color;
  ctx.fillRect(x, y, conf.tile_width, conf.tile_height);
}

function draw_tooltip(x, y) {
  
  ctx.fillStyle = conf.tooltip_bg_color;
  ctx.fillRect(x + 20, y + 20, 200, 64);
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "red";
  ctx.fillText(
    "Array position: " + mouse.gridX + " , " + mouse.gridY,
    x + 25,
    y + 35
  );

  ctx.fillText("x offset: " + mouse.offsetX, x + 25, y + 55);

  ctx.fillText("y offset: " + mouse.offsetY, x + 25, y + 75);
}

function mouse_handler(e) {
  
  mouse.x = e.clientX - (e.clientX - e.offsetX);
  mouse.y = e.clientY - (e.clientY - e.offsetY);
  mouse.gridX = Math.floor(mouse.x / conf.tile_width);
  mouse.gridY = Math.floor(mouse.y / conf.tile_height);
  mouse.offsetX = mouse.gridX * conf.tile_width;
  mouse.offsetY = mouse.gridY * conf.tile_height;
  
  if (mouse.x < img.width && mouse.y < img.height){
    mouse.within_bounds = true;
  } else {
    mouse.within_bounds = false;
  }
}

function select_text(e) {
  e.target.select();
}

canvas.addEventListener("mousemove", mouse_handler);

canvas.onmouseout = function() {
  mouse.within_bounds = false;
};

for (let i = 0, len = inputs.length; i < len; i++) {
  inputs[i].addEventListener("change", function(e) {
    update();
  });
}

for (let i = 0, len = inputs.length; i < len; i++) {
  inputs[i].addEventListener("click", select_text, false);
}

window.onload = () => {
  const canvas = document.getElementById("canvas");
  const buffer = document.getElementById("buffer");
  const colorPicker = document.getElementById("color");
  const delayInput = document.getElementById("delay-input");
  const addFrameButton = document.getElementById("add-frame-button");
  const deleteFrameButton = document.getElementById("delete-frame-button");
  const copyButton = document.getElementById("copy-frame-button");
  const drawButton = document.getElementById("draw-button");
  const eraseButton = document.getElementById("erase-button");
  const exportButton = document.getElementById("export-button");
  const playButton = document.getElementById("play-button");
  const info = document.getElementById("info");
  const context = canvas.getContext("2d");
  const bufferContext = buffer.getContext("2d");
  const frames = [];
  const data = {};
  const numFrames = 1;
  const numCells = 10;
  const frameSize = 160;
  const cellSize = parseInt(frameSize / numCells);
  const space = 10;
  let isMouseDown = false;
  let isPlay = false;
  let delay = 0;
  let delayOffset = 20;
  let currentFrameIndex = 0;
  let mode = "draw";
  let copiedFrame = null;
  let copiedPixels = {};

  canvas.height = frameSize * 1;
  buffer.width = frameSize;
  buffer.height = frameSize * 1;

  const getCurrentFrame = ({ mouseX, mouseY }) => {
    let f = null;

    for (let i = 0; i < frames.length; i++) {
      f = frames[i];
      if (mouseX > f.x && mouseX < f.x + f.width &&
        mouseY > f.y && mouseY < f.y + f.height) {
        break;
      } else {
        f = null;
      }
    }
    return f || null;
  };

  const getCurrentCell = ({ mouseX, mouseY }, frame) => {
    const yId = Math.floor((mouseY / frame.height));
    const row = Math.floor(((mouseY - space * yId) % frame.height) / cellSize);
    const col = Math.floor(((mouseX - space * frame.id) % frame.width) / cellSize);

    return frame.cells[row + "-" + col];
  };

  const createFrames = (n = 1) => {
    const index = frames.length;

    for (let i = 0; i < n; i++) {
      const frameX = index * (frameSize + space);
      const frameY = 0;

      if (frameX + frameSize + space > canvas.width) {
        canvas.width += frameSize + (space);
      }

      const frame = {
        id: i + index,
        x: parseInt(frameX),
        y: parseInt(frameY),
        width: frameSize,
        height: frameSize,
        color: "#FFFFFF",
        pixels: {},
        cells: {},
      };

      frames.push(frame);

      for (let j = 0; j < numCells; j++) {
        for (let k = 0; k < numCells; k++) {
          const _x = frame.x + k * (cellSize + 0);
          const _y = frame.y + j * (cellSize + 0);
          const _row = j * (cellSize + 0);
          const _col = k * (cellSize + 0);
          const cell = {
            id: j + "-" + k,
            x: _x,
            y: _y,
            row: parseInt(_row / cellSize),
            col: parseInt(_col / cellSize),
            size: cellSize,
            color: "#444444",
          };

          frame.cells[cell.id] = cell;
        }
      }
    }
  };

  playButton.addEventListener("click", () => {
    if (!isPlay) {
      isPlay = true;
      playButton.innerHTML = "STOP";
    } else {
      isPlay = false;
      playButton.innerHTML = "PLAY";
    }
  });

  addFrameButton.addEventListener("click", () => { createFrames(); });
  drawButton.addEventListener("click", () => { 
    mode = "draw";
    info.innerHTML = "Draw on any frame";
  });
  eraseButton.addEventListener("click", () => {
    mode = "erase";
    info.innerHTML = "Erase pixels from any frame";
  });
  copyButton.addEventListener("click", () => {
    mode = "copy";
    copiedPixels = null;
    copiedFrame = null;
    info.innerHTML = "Click on any frame to copy its pixels";
  });
  deleteFrameButton.addEventListener("click", () => {
    mode = "delete";
    info.innerHTML = "Click on any frame to delete it";
  });
  exportButton.addEventListener("click", () => {
    copyToClipboard(generateScript({
      bufferWidth: buffer.width,
      bufferHeight: buffer.height,
      data: data,
      delayOffset: delayOffset,
      frameSize: frameSize,
      numFrames: frames.length,
    }));
    info.innerHTML = "Movie Clip copied to clipboard as a Div element";
  });

  const drawBuffer = () => {
    if (isPlay) {
      delay++;

      if (delay % delayOffset === 0) {
        delay = 0;
        currentFrameIndex ++;
      }

      if (!data[currentFrameIndex]) {
        if (currentFrameIndex <= frames.length) {
          currentFrameIndex ++;
        } else {
          currentFrameIndex = 0;
        }
      }
    }

    if (data[currentFrameIndex]) {
      for (let key in data[currentFrameIndex]) {
        const pixel = data[currentFrameIndex][key];
        bufferContext.fillStyle = pixel.color;
        bufferContext.fillRect(resultFrame.x + pixel.col * (pixel.size), resultFrame.y + pixel.row * (pixel.size), pixel.size, pixel.size);
      }
    }
  };

  const drawFrames = () => {
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      context.fillStyle = frame.color;
      context.fillRect(frame.x, frame.y, frame.width, frame.height);

      for (let key in frame.cells) {
        const cell = frame.cells[key];
        context.strokeStyle = cell.color;
        context.strokeRect(cell.x, cell.y, cell.size, cell.size);
      }

      for (let index in frame.pixels) {
        const pixel = frame.pixels[index];
        context.fillStyle = pixel.color;
        context.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);
      }
    }
  };

  const drawPixel = (e) => {
    isMouseDown = true;
    const frame = getCurrentFrame({
      mouseX: e.offsetX,
      mouseY: e.offsetY
    });
    if (frame) {
      const cell = getCurrentCell({
        mouseX: e.offsetX,
        mouseY: e.offsetY
      }, frame);
      cell.color = colorPicker.value;

      if (!cell) return;

      if (!data[frame.id]) {
        data[frame.id] = {};
      }

      if (!data[frame.id][cell.id]) {
        data[frame.id][cell.id] = cell;

        frame.pixels[cell.id] = {
          id: cell.id,
          x: cell.x,
          y: cell.y,
          row: cell.row,
          col: cell.col,
          size: cell.size,
          color: colorPicker.value,
        };
      }
    }
  };

  const erasePixel = (e) => {
    isMouseDown = true;
    const frame = getCurrentFrame({
      mouseX: e.offsetX,
      mouseY: e.offsetY
    });
    if (frame) {

      const cell = getCurrentCell({
        mouseX: e.offsetX,
        mouseY: e.offsetY
      }, frame);

      if (!cell) return;

      if (frame.pixels[cell.id]) {
        delete data[frame.id][cell.id];
        delete frame.pixels[cell.id];
      }
    }
  };

  delayInput.oninput = (e) => {
    delayOffset = e.target.value;
  };

  canvas.onmousedown = (e) => {
    const frame = getCurrentFrame({
      mouseX: e.offsetX,
      mouseY: e.offsetY
    });

    if (!frame) return;

    if (mode === "draw") {
      drawPixel(e);
    } else
    if (mode === "erase") {
      erasePixel(e);
    } else
    if (mode === "delete") {
      const frameToDelete = getCurrentFrame({ mouseX: e.offsetX, mouseY: e.offsetY });
      delete frameToDelete.pixels;
      delete data[frame.id];
      frames.splice(frames.indexOf(frameToDelete), 1);
    } else
    if (mode === "copy") {
      copiedFrame = getCurrentFrame({ mouseX: e.offsetX, mouseY: e.offsetY });
      copiedPixels = frame.pixels;
      mode = "paste";
    } else 
    if (mode === "paste") {
      if (copiedPixels) {
        info.innerHTML = "Click on any frame to paste the copied pixels";
        const frame = getCurrentFrame({ mouseX: e.offsetX, mouseY: e.offsetY });

        if (!data[frame.id]) {
          data[frame.id] = {};
        }

        for (let index in copiedPixels) {
          const pixel = copiedPixels[index];

          if (!data[frame.id][pixel.id]) {
            data[frame.id][pixel.id] = pixel;

            frame.pixels[pixel.id] = {
              id: pixel.id,
              x: frame.x + pixel.x - copiedFrame.x,
              y: frame.y + pixel.y - copiedFrame.y,
              row: pixel.row,
              col: pixel.col,
              size: pixel.size,
              color: pixel.color,
            };   
          } 
        }
      }
    }
  };

  canvas.onmousemove = (e) => {
    if (isMouseDown) {
      if (mode === "draw") {
        drawPixel(e);
      } else
      if (mode === "erase") {
        erasePixel(e);
      }
    }
  };

  canvas.onmouseup = () => {
    isMouseDown = false;
  };

  const draw = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    bufferContext.clearRect(0, 0, buffer.width, buffer.height);
    bufferContext.globalAlpah = 0;
    drawFrames();
    drawBuffer();
  };

  const step = () => {
    draw();
    requestAnimationFrame(step);
  };

  createFrames(numFrames);

  const resultFrame = {
    id: -1,
    x: 0,
    y: 0,
    width: frameSize,
    height: frameSize,
    color: "#FFFFFF",
    pixels: [],
    cells: [],
  };

  for (let j = 0; j < numCells; j++) {
    for (let k = 0; k < numCells; k++) {
      const cell = {
        id: j + "-" + k,
        x: resultFrame.x + j * (cellSize + 0),
        y: resultFrame.y + k * (cellSize + 0),
        size: cellSize,
        color: "#FFFFFF",
      };
      resultFrame.cells.push(cell);
    }
  }

  step();
};
const generateScript = (config) => {
  return `
    <div id="movie-div" style="border: solid 2px gray; width:${config.frameSize}px; height:${config.frameSize}px;">
      <script>
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        document.getElementById("movie-div").appendChild(canvas);
        canvas.style.display = "block";
        canvas.style.margin = "0 auto";
        canvas.width = ${config.bufferWidth};
        canvas.height = ${config.bufferHeight};
        canvas.style.background = "clear";

        const data = ${JSON.stringify(config.data)};
        const delayOffset = ${config.delayOffset};
        const frameLength = ${config.numFrames};
        let currentFrameIndex = 0;
        let delay = 0;

        const loop = () => {
          context.clearRect(0, 0, canvas.width, canvas.height);
          delay++;
      
          if (delay % delayOffset === 0) {
            delay = 0;
            currentFrameIndex ++;
          }
    
          if (!data[currentFrameIndex]) {
            if (currentFrameIndex < frameLength) {
              currentFrameIndex ++;
            } else {
              currentFrameIndex = 0;
            }
          }
      
          if (data[currentFrameIndex]) {
            for (let key in data[currentFrameIndex]) {
              const pixel = data[currentFrameIndex][key];
              context.fillStyle = pixel.color;
              context.fillRect(pixel.col * (pixel.size), pixel.row * (pixel.size), pixel.size, pixel.size);
            }
          }
          requestAnimationFrame(loop);
        };

        loop();
      </script>
    </div>`;
 };
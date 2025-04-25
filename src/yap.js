const waveformValues = {
  /** 0-255 scale */
  threshold: 3,
  /** Approximate value for silence in the waveform */
  silence: 128,
};

const openCatMouth = () => {
  const cat = document.getElementById("cat");
  cat.src = "../assets/cat-open.png";
};

const closeCatMouth = () => {
  const cat = document.getElementById("cat");
  cat.src = "../assets/cat-closed.png";
};

navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then((stream) => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    source.connect(analyser);

    const waveformArray = new Uint8Array(analyser.fftSize);

    const checkVolume = () => {
      analyser.getByteTimeDomainData(waveformArray);

      const squaredDifferences = waveformArray.map((value) => {
        /** Center value around 0. For example: if you get a value of 128 (flat line, no sound), centeredValue = 0. */
        const centeredValue = value - waveformValues.silence;
        return centeredValue * centeredValue; // Square the centered value
      });

      const sum = squaredDifferences.reduce((acc, curr) => acc + curr, 0); // Sum all squared differences

      const rms = Math.sqrt(sum / waveformArray.length); // Root mean square volume

      const isLoudNoise = rms > waveformValues.threshold;
      if (isLoudNoise) {
        openCatMouth();
      } else {
        closeCatMouth();
      }

      requestAnimationFrame(checkVolume);
    };

    checkVolume();
  })
  .catch((err) => {
    console.error("Microphone access denied:", err);
  });

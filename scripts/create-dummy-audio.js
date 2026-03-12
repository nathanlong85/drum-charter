import fs from 'fs';
import path from 'path';

const samplesDir = path.join(process.cwd(), 'public/audio/samples/drum-kit/default');
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
}

function createDummyWav(filename, frequency) {
  const sampleRate = 44100;
  const duration = 0.1;
  const numSamples = sampleRate * duration;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const val = Math.sin(2 * Math.PI * frequency * (i / sampleRate)) * 32767;
    buffer.writeInt16LE(Math.floor(val), 44 + i * 2);
  }

  fs.writeFileSync(path.join(samplesDir, filename), buffer);
}

createDummyWav('kick.wav', 60);
createDummyWav('snare.wav', 200);
createDummyWav('hihat-closed.wav', 1000);
createDummyWav('hihat-open.wav', 800);

console.log('Dummy WAV files created successfully.');

import fs from 'fs';
import path from 'path';

const samplesDir = path.join(process.cwd(), 'public/audio/samples/drum-kit/default');
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
}

/**
 * Creates a slightly more realistic dummy drum sound.
 * @param {string} filename - Output filename
 * @param {number} frequency - Base frequency
 * @param {number} decay - Decay speed (higher = faster)
 * @param {boolean} noise - Add white noise (for snare/hihat)
 */
function createRealisticDummyWav(filename, frequency, decay = 50, noise = false) {
  const sampleRate = 44100;
  const duration = 0.3; // Longer duration for better decay
  const numSamples = Math.floor(sampleRate * duration);
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
    const t = i / sampleRate;
    const envelope = Math.exp(-decay * t);
    
    let val = Math.sin(2 * Math.PI * frequency * t) * envelope;
    
    if (noise) {
      val += (Math.random() * 2 - 1) * envelope * 0.5;
    }
    
    // Normalize and clamp
    val = Math.max(-1, Math.min(1, val)) * 32767;
    buffer.writeInt16LE(Math.floor(val), 44 + i * 2);
  }

  fs.writeFileSync(path.join(samplesDir, filename), buffer);
}

// Full Set Mapping
const drumKit = [
  // Kick
  { file: 'kick.wav', freq: 50, decay: 40, noise: false },
  
  // Snares
  { file: 'snare.wav', freq: 180, decay: 60, noise: true },
  { file: 'snare_cross_stick.wav', freq: 400, decay: 150, noise: false },
  { file: 'snare_flam.wav', freq: 180, decay: 50, noise: true },
  { file: 'snare_buzz.wav', freq: 180, decay: 20, noise: true },
  { file: 'snare_rimshot.wav', freq: 220, decay: 80, noise: true },
  
  // Hi-Hats
  { file: 'hihat_open.wav', freq: 1200, decay: 10, noise: true },
  { file: 'hihat_loose.wav', freq: 1000, decay: 20, noise: true },
  { file: 'hihat_closed.wav', freq: 1500, decay: 150, noise: true },
  { file: 'hihat_pedal.wav', freq: 800, decay: 120, noise: true },
  
  // Cymbals
  { file: 'ride.wav', freq: 800, decay: 5, noise: true },
  { file: 'ride_bell.wav', freq: 1000, decay: 8, noise: false },
  { file: 'crash.wav', freq: 400, decay: 4, noise: true },
  { file: 'crash_bell.wav', freq: 600, decay: 6, noise: false },
  
  // Toms
  { file: 'tom_high.wav', freq: 150, decay: 20, noise: false },
  { file: 'tom_medium.wav', freq: 120, decay: 15, noise: false },
  { file: 'tom_floor.wav', freq: 90, decay: 10, noise: false }
];

drumKit.forEach(drum => {
  createRealisticDummyWav(drum.file, drum.freq, drum.decay, drum.noise);
});

console.log(`Created ${drumKit.length} high-fidelity (synthesized) drum samples.`);

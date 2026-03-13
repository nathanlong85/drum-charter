import fs from 'fs';
import path from 'path';

const samplesDir = path.join(process.cwd(), 'public/audio/samples/metronome');
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
}

/**
 * Creates a professional-grade metronome click sound.
 * @param {string} filename - Output filename
 * @param {number} frequency - Base frequency (Hz)
 * @param {number} duration - Duration (seconds)
 */
function createMetronomeClick(filename, frequency, duration = 0.05) {
  const sampleRate = 44100;
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
    
    // Quick decay envelope for a "click" feel
    const envelope = Math.exp(-150 * t);
    
    // Sine wave
    let val = Math.sin(2 * Math.PI * frequency * t) * envelope;
    
    // Add a bit of "knock" with a faster decaying lower frequency
    val += Math.sin(2 * Math.PI * (frequency / 2) * t) * Math.exp(-300 * t) * 0.5;
    
    // Normalize and clamp
    val = Math.max(-1, Math.min(1, val)) * 32767;
    buffer.writeInt16LE(Math.floor(val), 44 + i * 2);
  }

  try {
    fs.writeFileSync(path.join(samplesDir, filename), buffer);
  } catch (err) {
    console.error(`Failed to write ${filename}:`, err.message);
    process.exit(1);
  }
}

// Generate high and low clicks
createMetronomeClick('click_high.wav', 1200); // Beat 1 accent
createMetronomeClick('click_low.wav', 800);   // Standard beats

console.log('Created professional-grade metronome click samples.');

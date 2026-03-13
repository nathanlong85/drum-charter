import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Audio Samples Integrity', () => {
  const samplesDir = path.join(process.cwd(), 'public/audio/samples/drum-kit/default');
  const samples = [
    'kick.wav', 
    'snare.wav', 
    'snare_cross_stick.wav',
    'snare_flam.wav',
    'snare_buzz.wav',
    'snare_rimshot.wav',
    'hihat_closed.wav', 
    'hihat_open.wav',
    'hihat_loose.wav',
    'hihat_pedal.wav',
    'ride.wav',
    'ride_bell.wav',
    'crash.wav',
    'crash_bell.wav',
    'tom_high.wav',
    'tom_medium.wav',
    'tom_floor.wav'
  ];

  it('verifies that all drum samples exist and are valid WAV files', async () => {
    for (const sample of samples) {
      const filePath = path.join(samplesDir, sample);
      
      // 1. Check if file exists
      await expect(fs.promises.access(filePath)).resolves.not.toThrow();
      
      const stats = await fs.promises.stat(filePath);
      // 2. Check if file is larger than a few bytes (HTML 404s are usually small, but not always)
      expect(stats.size, `${sample} is suspiciously small (${stats.size} bytes)`).toBeGreaterThan(100);

      // 3. Check WAV magic bytes (RIFF at 0, WAVE at 8)
      const buffer = Buffer.alloc(12);
      const handle = await fs.promises.open(filePath, 'r');
      try {
        await handle.read(buffer, 0, 12, 0);
      } finally {
        await handle.close();
      }

      const riff = buffer.toString('ascii', 0, 4);
      const wave = buffer.toString('ascii', 8, 12);

      expect(riff, `${sample} is not a valid RIFF file (found ${riff})`).toBe('RIFF');
      expect(wave, `${sample} is not a valid WAVE file (found ${wave})`).toBe('WAVE');
    }
  });
});

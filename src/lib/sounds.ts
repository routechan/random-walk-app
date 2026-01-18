// Web Audio APIを使った効果音生成

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// ドラムロール音（連続したティック音）
export function playDrumRoll(duration: number = 2000): { stop: () => void } {
  const ctx = getAudioContext();
  const startTime = ctx.currentTime;
  const endTime = startTime + duration / 1000;

  let intervalId: number;
  let tickInterval = 100; // 初期間隔（ms）
  let currentTime = 0;

  const playTick = () => {
    if (ctx.currentTime >= endTime) {
      clearInterval(intervalId);
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // 高めの周波数でティック音
    osc.frequency.value = 800 + Math.random() * 200;
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);

    // 徐々に間隔を短くしてスピード感を出す
    currentTime += tickInterval;
    const progress = currentTime / duration;
    tickInterval = Math.max(30, 100 - progress * 70);
  };

  // 最初のティックをすぐ再生
  playTick();
  intervalId = window.setInterval(playTick, tickInterval);

  // 動的に間隔を更新
  const updateInterval = () => {
    if (ctx.currentTime < endTime) {
      clearInterval(intervalId);
      intervalId = window.setInterval(playTick, tickInterval);
      setTimeout(updateInterval, 200);
    }
  };
  setTimeout(updateInterval, 200);

  return {
    stop: () => {
      clearInterval(intervalId);
    }
  };
}

// 「ジャン！」の決定音
export function playRevealSound(): void {
  const ctx = getAudioContext();

  // 和音で華やかな決定音を作る
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (Cメジャーコード)

  frequencies.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = freq;
    osc.type = 'sine';

    const startTime = ctx.currentTime + index * 0.02; // 少しずらしてアルペジオ風

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);

    osc.start(startTime);
    osc.stop(startTime + 0.8);
  });

  // 低音でインパクト追加
  const bassOsc = ctx.createOscillator();
  const bassGain = ctx.createGain();

  bassOsc.connect(bassGain);
  bassGain.connect(ctx.destination);

  bassOsc.frequency.value = 130.81; // C3
  bassOsc.type = 'sine';

  bassGain.gain.setValueAtTime(0.2, ctx.currentTime);
  bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

  bassOsc.start(ctx.currentTime);
  bassOsc.stop(ctx.currentTime + 0.5);
}

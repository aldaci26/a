import { AmbientSoundMode } from '../types';

class NaturalAudioEngine {
  private currentMode: AmbientSoundMode = 'off';
  private activeAudios: HTMLAudioElement[] = [];
  private thunderAudio: HTMLAudioElement | null = null;
  private thunderTimer: number | null = null;
  private onThunderTrigger?: () => void;

  // Web Audio Context for UI chimes, page turns, and procedural forest & hearth accents
  private audioCtx: AudioContext | null = null;
  private crackleTimer: number | null = null;
  private forestTimer: number | null = null;

  private soundUrls = {
    // Fireplace: 2 layered authentic Google Actions streams for warmth & volume
    fireplaceHearth: 'https://actions.google.com/sounds/v1/ambiences/fire.ogg',
    fireplaceBonfire: 'https://actions.google.com/sounds/v1/ambiences/daytime_forrest_bonfire.ogg',
    
    // Rain: Real steady rainfall + water dripping & splashing
    rainPour: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    rainWaterDrops: 'https://actions.google.com/sounds/v1/weather/rain_water_dripping_softly.ogg',
    
    // Thunder: Soft, distant atmospheric rumble (not shocking or loud)
    thunderDistant: 'https://actions.google.com/sounds/v1/weather/distant_thunder.ogg',
    
    // Ocean: Real natural ocean waves crashing and washing on shore
    oceanWaves: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg',

    // Forest: Natural woods ambience, birds, owl, wolf, and breaking branches
    forestAmbience: 'https://actions.google.com/sounds/v1/ambiences/forest_day.ogg',
    forestMeadow: 'https://actions.google.com/sounds/v1/ambiences/meadow_morning.ogg',
    forestWolf: 'https://actions.google.com/sounds/v1/animals/wolf_howl.ogg',
    forestOwl: 'https://actions.google.com/sounds/v1/animals/owl_hoot.ogg',
    forestBranchBreak: 'https://actions.google.com/sounds/v1/foley/branches_breaking.ogg'
  };

  private getAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public getMode(): AmbientSoundMode {
    return this.currentMode;
  }

  public setThunderCallback(cb: () => void) {
    this.onThunderTrigger = cb;
  }

  /**
   * Stop all active sound streams with a smooth fade-out
   */
  public stopAmbient() {
    this.currentMode = 'off';

    // Clear background timers
    if (this.thunderTimer) {
      window.clearInterval(this.thunderTimer);
      this.thunderTimer = null;
    }
    if (this.crackleTimer) {
      window.clearTimeout(this.crackleTimer);
      this.crackleTimer = null;
    }
    if (this.forestTimer) {
      window.clearTimeout(this.forestTimer);
      this.forestTimer = null;
    }

    // Fade out and release all active audios
    const audiosToFade = [...this.activeAudios];
    this.activeAudios = [];

    audiosToFade.forEach((audio) => {
      let vol = audio.volume;
      const fadeInterval = window.setInterval(() => {
        vol -= 0.15;
        if (vol <= 0.05) {
          window.clearInterval(fadeInterval);
          try {
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
          } catch (e) {
            console.warn('[AudioEngine] Ses durdurulurken hata:', e);
          }
        } else {
          audio.volume = Math.max(0, vol);
        }
      }, 30);
    });

    if (this.thunderAudio) {
      try {
        this.thunderAudio.pause();
        this.thunderAudio.removeAttribute('src');
        this.thunderAudio.load();
      } catch (e) {
        console.warn('[AudioEngine] Gök gürültüsü sesi durdurulurken hata:', e);
      }
      this.thunderAudio = null;
    }
  }

  /**
   * Helper to spawn an authentic looping audio stream directly via HTML5 Audio
   */
  private createLoopingAudio(url: string, volume: number): HTMLAudioElement {
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = Math.min(1.0, Math.max(0, volume));

    audio.addEventListener('error', (e) => {
      console.warn(`[AudioEngine] Ortam ses akışı yüklenemedi (${url}):`, e);
    });

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('[AudioEngine] Oynatma tarayıcı etkileşimi bekliyor veya engellendi:', err);
      });
    }

    this.activeAudios.push(audio);
    return audio;
  }

  /**
   * 1. ŞÖMİNE (Ateş ve odun çıtırtıları - Yükseltilmiş, güçlü ve sıcak şömine sesi)
   */
  public playFireplace() {
    this.stopAmbient();
    this.currentMode = 'fireplace';

    // Layer 1: Main hearth fire crackling at full 1.0 volume
    this.createLoopingAudio(this.soundUrls.fireplaceHearth, 1.0);

    // Layer 2: Deep resonant bonfire for substantial warmth and presence at 0.85 volume
    this.createLoopingAudio(this.soundUrls.fireplaceBonfire, 0.85);

    // Procedural crisp wood spark snaps & crackles
    const scheduleNextCrackle = () => {
      if (this.currentMode !== 'fireplace') return;
      this.triggerWoodCrackle();
      const nextDelay = Math.random() * 650 + 250;
      this.crackleTimer = window.setTimeout(scheduleNextCrackle, nextDelay);
    };

    scheduleNextCrackle();
  }

  private triggerWoodCrackle() {
    try {
      const ctx = this.getAudioContext();
      const bufferSize = Math.floor(ctx.sampleRate * (Math.random() * 0.04 + 0.015));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.007));
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(Math.random() * 2200 + 900, ctx.currentTime);
      filter.Q.setValueAtTime(3.2, ctx.currentTime);

      const gain = ctx.createGain();
      const popVolume = Math.random() * 0.35 + 0.15;
      gain.gain.setValueAtTime(popVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + bufferSize / ctx.sampleRate);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start();
    } catch {
      // ignore
    }
  }

  /**
   * 2. YAĞMUR (Gerçek Yağmur Suyu & Damla Sesleri + Yumuşak Uzak Gök Gürültüsü)
   */
  public playRain() {
    this.stopAmbient();
    this.currentMode = 'rain';

    // Layer 1: Steady, crisp pouring rainfall
    this.createLoopingAudio(this.soundUrls.rainPour, 0.85);

    // Layer 2: Intimate water splashing and dripping sounds (yağmur su sesi)
    this.createLoopingAudio(this.soundUrls.rainWaterDrops, 0.70);

    // Delayed gentle thunder so user listens to soothing rainfall first
    window.setTimeout(() => {
      if (this.currentMode === 'rain') {
        this.triggerThunderStrike();
      }
    }, 9000);

    // Periodic distant thunder rolls (soft and lowered in volume as requested)
    this.thunderTimer = window.setInterval(() => {
      if (this.currentMode === 'rain') {
        this.triggerThunderStrike();
      }
    }, 20000);
  }

  private triggerThunderStrike() {
    if (this.onThunderTrigger) {
      this.onThunderTrigger();
    }
    try {
      const thunder = new Audio(this.soundUrls.thunderDistant);
      thunder.volume = 0.20;
      thunder.play().catch(() => {});
      this.thunderAudio = thunder;
    } catch {
      // ignore
    }
  }

  /**
   * 3. OKYANUS (Gerçek Kıyıya Vuran Okyanus Dalgası Suyu - Dengelenmiş Kısık & Huzurlu Ses)
   */
  public playOcean() {
    this.stopAmbient();
    this.currentMode = 'ocean';

    // Real ocean waves crashing on rock & pebble beach (volume 0.50)
    this.createLoopingAudio(this.soundUrls.oceanWaves, 0.50);
  }

  /**
   * 4. ORMAN (Gerçek Orman Ambiyansı, Kuşlar, Baykuş, Kurt, Dal Çatırtısı, Cırcır Böcekleri & Ağaç Sesleri)
   */
  public playForest() {
    this.stopAmbient();
    this.currentMode = 'forest';

    // Layer 1: Continuous natural forest day ambience (boosted to 0.82)
    this.createLoopingAudio(this.soundUrls.forestAmbience, 0.82);

    // Layer 2: Morning forest meadow with gentle woodland acoustic texture (boosted to 0.60)
    this.createLoopingAudio(this.soundUrls.forestMeadow, 0.60);

    // Dynamic procedural & acoustic forest events scheduler with rich natural variety
    const scheduleNextForestSound = () => {
      if (this.currentMode !== 'forest') return;

      const randomRoll = Math.random();

      if (randomRoll < 0.28) {
        // Kuş Cıvıltıları & tatlı ötüşler (kuş çeşitliliği)
        if (Math.random() < 0.5) {
          this.triggerForestBirdCall();
        } else if (Math.random() < 0.75) {
          this.triggerWoodlandFluteBird();
        } else {
          this.triggerWoodpeckerTap();
        }
      } else if (randomRoll < 0.44) {
        // Asil Orman Geyiği Sesi (Deer / Stag Call)
        this.triggerDeerCall();
      } else if (randomRoll < 0.60) {
        // Uzak ve derinden gelen asil kurt uluması (Wolf Howl)
        this.triggerDistantWolfHowl();
      } else if (randomRoll < 0.74) {
        // Baykuş ötüşü (Hoo-hoo)
        this.triggerOwlHootSound();
      } else if (randomRoll < 0.88) {
        // Ağaç ve kuru dal çıtırtısı
        this.triggerBranchSnapSound();
      } else {
        // Sincap / Yaprak hışırtısı & orman tabanı hareketi
        this.triggerForestRustleSound();
      }

      // Schedule next organic sound in 3.0 to 6.5 seconds for an active, living woodland
      const nextDelay = Math.random() * 3500 + 3000;
      this.forestTimer = window.setTimeout(scheduleNextForestSound, nextDelay);
    };

    // First event after 2.2 seconds
    this.forestTimer = window.setTimeout(scheduleNextForestSound, 2200);
  }

  /**
   * Baykuş Ötüşü (Owl Hoot - "Hoo... Hoo-hooo")
   */
  private triggerOwlHootSound() {
    // Attempt audio asset with procedural fallback
    try {
      const owl = new Audio(this.soundUrls.forestOwl);
      owl.volume = 0.35;
      owl.play().catch(() => {
        this.synthesizeOwlHoot();
      });
    } catch {
      this.synthesizeOwlHoot();
    }
  }

  private synthesizeOwlHoot() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Note 1: First soft "Hoo"
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(390, now);
      osc1.frequency.exponentialRampToValueAtTime(360, now + 0.38);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.12, now + 0.08);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Note 2: Second melodious "Hoo-hooo"
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      const t2 = now + 0.55;
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(370, t2);
      osc2.frequency.exponentialRampToValueAtTime(340, t2 + 0.55);

      gain2.gain.setValueAtTime(0.001, t2);
      gain2.gain.linearRampToValueAtTime(0.14, t2 + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.6);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t2);
      osc2.stop(t2 + 0.65);
    } catch {
      // ignore
    }
  }

  /**
   * Asil Orman Geyiği Sesi (Noble Red Deer / Elk Call)
   */
  private triggerDeerCall() {
    this.synthesizeDeerCall();
  }

  private synthesizeDeerCall() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Resonant throat / vocal tract filter for majestic deer bellow
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(420, now);
      filter.frequency.linearRampToValueAtTime(310, now + 1.2);
      filter.frequency.linearRampToValueAtTime(230, now + 2.5);
      filter.Q.setValueAtTime(3.8, now);

      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      // Harmonic frequency: starts at deep 180Hz, glides to 260Hz, softens down to 140Hz
      osc.frequency.setValueAtTime(175, now);
      osc.frequency.exponentialRampToValueAtTime(255, now + 0.45);
      osc.frequency.exponentialRampToValueAtTime(195, now + 1.6);
      osc.frequency.exponentialRampToValueAtTime(138, now + 2.6);

      // Breath vibrato (LFO)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(4.2, now);
      lfoGain.gain.setValueAtTime(14, now);
      lfo.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + 2.8);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.13, now + 0.35);
      gain.gain.linearRampToValueAtTime(0.10, now + 1.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.8);
    } catch {
      // ignore
    }
  }

  /**
   * Uzak Kurt Uluması (Distant Wolf Howl)
   */
  private triggerDistantWolfHowl() {
    try {
      const wolf = new Audio(this.soundUrls.forestWolf);
      wolf.volume = 0.22; // Distant and soothing
      wolf.play().catch(() => {
        this.synthesizeWolfHowl();
      });
    } catch {
      this.synthesizeWolfHowl();
    }
  }

  private synthesizeWolfHowl() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Smooth frequency rise and fall of a distant wolf howl
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 1.2);
      osc.frequency.exponentialRampToValueAtTime(440, now + 2.8);
      osc.frequency.exponentialRampToValueAtTime(290, now + 4.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 4.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 4.5);
    } catch {
      // ignore
    }
  }

  /**
   * Kuru Dal Çıtırtısı (Crisp, clean dry twig snaps - strictly NO heavy crash or 'güm' sound)
   */
  private triggerBranchSnapSound() {
    // Pure, crisp multi-splinter crackle with zero low-end thump
    this.synthesizeBranchSnap();
  }

  private synthesizeBranchSnap() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // High-mid frequency brittle crackles (kuru dal çıtırtısı - strictly no bass thump or crash)
      const offsets = [0, 0.012, 0.028];
      offsets.forEach((offset, idx) => {
        const bufferSize = Math.floor(ctx.sampleRate * 0.045);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(2800 + idx * 450, now + offset);
        bp.Q.setValueAtTime(4.2, now + offset);

        const crackGain = ctx.createGain();
        const crackVol = 0.28 / (idx + 1);
        crackGain.gain.setValueAtTime(crackVol, now + offset);
        crackGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.045);

        noise.connect(bp);
        bp.connect(crackGain);
        crackGain.connect(ctx.destination);
        noise.start(now + offset);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Orman Kuş Cıvıltısı (Sweet forest songbird warble)
   */
  private triggerForestBirdCall() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const chirps = Math.floor(Math.random() * 3) + 2;

      for (let i = 0; i < chirps; i++) {
        const chirpStart = now + i * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const baseFreq = 2600 + Math.random() * 700;
        osc.frequency.setValueAtTime(baseFreq, chirpStart);
        osc.frequency.exponentialRampToValueAtTime(baseFreq + 800, chirpStart + 0.04);
        osc.frequency.exponentialRampToValueAtTime(baseFreq - 200, chirpStart + 0.09);

        gain.gain.setValueAtTime(0.001, chirpStart);
        gain.gain.linearRampToValueAtTime(0.08, chirpStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, chirpStart + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(chirpStart);
        osc.stop(chirpStart + 0.1);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Orman Karatavuk / Bülbül Flüt Nağmesi (Melodic woodland thrush / robin whistle)
   */
  private triggerWoodlandFluteBird() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const notes = [1960, 2340, 2093, 2637]; // G6, D7, C7, E7

      notes.forEach((freq, idx) => {
        const startTime = now + idx * 0.14;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.linearRampToValueAtTime(freq * 1.05, startTime + 0.06);
        osc.frequency.linearRampToValueAtTime(freq * 0.98, startTime + 0.12);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.075, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.13);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.14);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Ağaçkakan Ritmik Tıklaması (Woodpecker tree tap - "tok-tok-tok")
   */
  private triggerWoodpeckerTap() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const taps = 4;

      for (let i = 0; i < taps; i++) {
        const t = now + i * 0.065;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, t);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.03);

        gain.gain.setValueAtTime(0.09, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.04);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Sincap / Yaprak Hışırtısı & Hafif Orman Tabanı Adımları
   */
  private triggerForestRustleSound() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.25);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        // Granular bursts like small paws in dry leaves
        const envelope = Math.sin((i / bufferSize) * Math.PI);
        const flutter = Math.sin(i * 0.02) > 0 ? 1 : 0.4;
        data[i] = (Math.random() * 2 - 1) * envelope * flutter * 0.4;
      }

      const rustle = ctx.createBufferSource();
      rustle.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(1.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      rustle.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      rustle.start(now);
    } catch {
      // ignore
    }
  }

  /**
   * Tıklama / İşlem Onay Sesi (Chime / Click / Select)
   * Aktif ortama göre şekillenir.
   * Sessiz moddaysa ('off') HİÇBİR ses çıkartmaz!
   */
  public playChime() {
    if (this.currentMode === 'off') {
      return; // Sessiz moddaysa hiçbir ses çıkartma
    }

    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      if (this.currentMode === 'fireplace') {
        // Şömine: Sıcak çıtırtı / köz kıvılcımı pıtırtısı
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(310, now + 0.08);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (this.currentMode === 'rain') {
        // Yağmur: Berrak ve tatlı su damlası "pıt" sesi
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1480, now);
        osc.frequency.exponentialRampToValueAtTime(980, now + 0.07);

        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (this.currentMode === 'ocean') {
        // Okyanus: Yumuşak deniz kabarcığı / su taşı dokunuşu
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(740, now);
        osc.frequency.exponentialRampToValueAtTime(1180, now + 0.06);

        gain.gain.setValueAtTime(0.10, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (this.currentMode === 'forest') {
        // Orman: Kuru ince dal / çam çıtırtısı tıklaması
        const bufferSize = Math.floor(ctx.sampleRate * 0.035);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.005));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(3200, now);
        bp.Q.setValueAtTime(4.0, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        noise.connect(bp);
        bp.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Sayfa Çevirme / Detay İnceleme Sesi
   * Aktif ortama göre şekillenir.
   * Sessiz moddaysa ('off') HİÇBİR ses çıkartmaz!
   */
  public playPageTurn() {
    if (this.currentMode === 'off') {
      return; // Sessiz moddaysa hiçbir ses çıkartma
    }

    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      if (this.currentMode === 'fireplace') {
        // Şömine: Sıcak, hafif kuru parşömen çevirme sesi
        const bufferSize = Math.floor(ctx.sampleRate * 0.11);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.035));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(880, now);
        filter.Q.setValueAtTime(1.1, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      } else if (this.currentMode === 'rain') {
        // Yağmur: Yumuşak yağmurlu esinti eşliğinde sayfa kayması
        const bufferSize = Math.floor(ctx.sampleRate * 0.09);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      } else if (this.currentMode === 'ocean') {
        // Okyanus: Serin deniz tuzu ve dalga hışırtısı yumuşaklığında sayfa
        const bufferSize = Math.floor(ctx.sampleRate * 0.13);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const envelope = Math.sin((i / bufferSize) * Math.PI);
          data[i] = (Math.random() * 2 - 1) * envelope;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1050, now);
        filter.Q.setValueAtTime(1.3, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.075, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      } else if (this.currentMode === 'forest') {
        // Orman: Kuru yaprak hışırtısı ve ince kozalak fısıltısı
        const bufferSize = Math.floor(ctx.sampleRate * 0.11);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1600, now);
        filter.Q.setValueAtTime(1.9, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      }
    } catch {
      // ignore
    }
  }
}

export const audioEngine = new NaturalAudioEngine();

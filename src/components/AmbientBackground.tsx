import React, { useEffect, useRef } from 'react';
import { AmbientSoundMode } from '../types';

interface AmbientBackgroundProps {
  mode: AmbientSoundMode;
  lightningFlash: boolean;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = React.memo(({ mode, lightningFlash }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lightningFlashRef = useRef(lightningFlash);
  lightningFlashRef.current = lightningFlash;

  useEffect(() => {
    if (mode === 'off') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // ============================================
    // 1. FIREPLACE PARTICLES
    // ============================================
    interface Ember {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      life: number;
      maxLife: number;
      color: string;
      wobbleSpeed: number;
    }

    const embers: Ember[] = [];
    const emberColors = ['#ff7a00', '#ff4500', '#ffa500', '#ffb703', '#fb8500', '#e63946'];

    for (let i = 0; i < 90; i++) {
      embers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3.5 + 1.2,
        speedY: Math.random() * 2.2 + 0.8,
        speedX: (Math.random() - 0.5) * 1.2,
        opacity: Math.random() * 0.8 + 0.2,
        life: Math.random() * 200,
        maxLife: Math.random() * 260 + 140,
        color: emberColors[Math.floor(Math.random() * emberColors.length)],
        wobbleSpeed: Math.random() * 0.05 + 0.02
      });
    }

    const flameCount = 28;
    const flameHeights: number[] = [];
    for (let i = 0; i <= flameCount; i++) {
      flameHeights.push(Math.random() * 120 + 80);
    }

    // ============================================
    // 2. RAIN PARTICLES & SPLASHES
    // ============================================
    interface RainDrop {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
      thickness: number;
    }

    interface Splash {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
    }

    const raindrops: RainDrop[] = [];
    const splashes: Splash[] = [];

    for (let i = 0; i < 160; i++) {
      raindrops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 20 + 12,
        speed: Math.random() * 8 + 11, // Minicik yavaşlatılmış, pürüzsüz ve sakin yağmur hızı
        opacity: Math.random() * 0.45 + 0.25,
        thickness: Math.random() * 1.5 + 0.8
      });
    }

    // ============================================
    // 3. OCEAN STARS, AURORA, CLOUDS & SHIP
    // ============================================
    interface OceanStar {
      x: number;
      y: number;
      size: number;
      baseOpacity: number;
      twinkleSpeed: number;
      phase: number;
      color: string;
    }

    interface ShootingStar {
      x: number;
      y: number;
      vx: number;
      vy: number;
      length: number;
      life: number;
      maxLife: number;
      active: boolean;
      sparkles: Array<{ x: number; y: number; life: number; opacity: number }>;
    }

    interface SeaSparkle {
      x: number;
      y: number;
      baseY: number;
      size: number;
      opacity: number;
      speedX: number;
      phase: number;
      color: string;
    }

    interface NightCloud {
      x: number;
      y: number;
      radiusX: number;
      radiusY: number;
      speedX: number;
      opacity: number;
    }

    const starColorPalette = ['#f0fdf4', '#ecfdf5', '#e0f2fe', '#ffffff', '#a7f3d0', '#fef3c7'];
    const oceanStars: OceanStar[] = [];
    for (let i = 0; i < 160; i++) {
      oceanStars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.58),
        size: Math.random() * 2.0 + 0.5,
        baseOpacity: Math.random() * 0.55 + 0.35,
        twinkleSpeed: Math.random() * 0.035 + 0.008,
        phase: Math.random() * Math.PI * 2,
        color: starColorPalette[Math.floor(Math.random() * starColorPalette.length)]
      });
    }

    const nightClouds: NightCloud[] = [
      { x: width * 0.15, y: height * 0.18, radiusX: 220, radiusY: 55, speedX: 0.08, opacity: 0.12 },
      { x: width * 0.55, y: height * 0.12, radiusX: 280, radiusY: 65, speedX: 0.06, opacity: 0.10 },
      { x: width * 0.85, y: height * 0.24, radiusX: 240, radiusY: 50, speedX: 0.10, opacity: 0.14 },
      { x: width * 0.35, y: height * 0.30, radiusX: 200, radiusY: 45, speedX: 0.07, opacity: 0.09 }
    ];

    const shootingStar: ShootingStar = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      length: 0,
      life: 0,
      maxLife: 0,
      active: false,
      sparkles: []
    };

    let shootingStarCooldown = Math.floor(Math.random() * 140 + 100);

    const seaSparkles: SeaSparkle[] = [];
    const sparkleColors = ['#5eead4', '#34d399', '#6ee7b7', '#bae6fd', '#a7f3d0'];
    for (let i = 0; i < 45; i++) {
      seaSparkles.push({
        x: Math.random() * width,
        y: height * 0.65 + Math.random() * (height * 0.32),
        baseY: height * 0.65 + Math.random() * (height * 0.32),
        size: Math.random() * 2.0 + 0.8,
        opacity: Math.random() * 0.55 + 0.2,
        speedX: (Math.random() - 0.5) * 0.4,
        phase: Math.random() * Math.PI * 2,
        color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)]
      });
    }

    // ============================================
    // 4. FOREST STATE (Ateşböcekleri, Yapraklar, Kuşlar, Baykuş)
    // ============================================
    interface Firefly {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      pulseSpeed: number;
      phase: number;
      color: string;
    }

    interface ForestLeaf {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      rotation: number;
      rotSpeed: number;
      swayPhase: number;
      color: string;
    }

    interface ForestBird {
      x: number;
      y: number;
      speedX: number;
      scale: number;
      flapSpeed: number;
      phase: number;
      glideDuration: number;
      glideTimer: number;
      species: 'raptor' | 'songbird';
    }

    // Azaltılmış, sakin ve göz yormayan orman ateşböcekleri (12 adet)
    const fireflies: Firefly[] = [];
    const fireflyColors = ['#fef08a', '#bef264', '#86efac', '#6ee7b7', '#a7f3d0'];
    for (let i = 0; i < 12; i++) {
      fireflies.push({
        x: Math.random() * width,
        y: height * 0.4 + Math.random() * (height * 0.55),
        radius: Math.random() * 2.0 + 1.2,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.3 - 0.1,
        pulseSpeed: Math.random() * 0.03 + 0.02,
        phase: Math.random() * Math.PI * 2,
        color: fireflyColors[Math.floor(Math.random() * fireflyColors.length)]
      });
    }

    // Azaltılmış, zarif orman yaprakları (6 adet)
    const forestLeaves: ForestLeaf[] = [];
    const leafColors = ['#ca8a04', '#d97706', '#65a30d', '#15803d', '#b45309', '#047857'];
    for (let i = 0; i < 6; i++) {
      forestLeaves.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 4.5 + 3.5,
        speedY: Math.random() * 0.6 + 0.3,
        speedX: (Math.random() - 0.5) * 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.025,
        swayPhase: Math.random() * Math.PI * 2,
        color: leafColors[Math.floor(Math.random() * leafColors.length)]
      });
    }

    // 2 Farklı, Pürüzsüz & Zarif Uçan Kuş (Yüksekte süzülen yırtıcı kartal & ağaçlar arasında zarif öten orman kuşu)
    const forestBirds: ForestBird[] = [
      {
        x: -40,
        y: height * 0.14,
        speedX: 1.35, // Pürüzsüz, sakin ve yavaş süzülüş
        scale: 1.15,
        flapSpeed: 4.8, // Ağır ve görkemli kanat çırpışı
        phase: 0,
        glideDuration: 180, // Uzun süzülme süresi
        glideTimer: 0,
        species: 'raptor'
      },
      {
        x: width * 0.45,
        y: height * 0.25,
        speedX: 1.8,
        scale: 0.82,
        flapSpeed: 8.5,
        phase: 2.2,
        glideDuration: 90,
        glideTimer: 30,
        species: 'songbird'
      }
    ];

    let time = 0;
    let oceanTime = 0;

    const render = () => {
      time += 0.03;
      oceanTime += 0.0035;
      ctx.clearRect(0, 0, width, height);

      // ============================================
      // 1. FIREPLACE ANIMATION
      // ============================================
      if (mode === 'fireplace') {
        const flamePulse = Math.sin(time * 3) * 0.04 + Math.cos(time * 5) * 0.03;
        const ambientGlow = ctx.createRadialGradient(
          width / 2, height * 0.85, 80,
          width / 2, height * 0.5, width * 0.8
        );
        ambientGlow.addColorStop(0, `rgba(249, 115, 22, ${0.22 + flamePulse})`);
        ambientGlow.addColorStop(0.4, `rgba(234, 88, 12, ${0.12 + flamePulse * 0.6})`);
        ambientGlow.addColorStop(0.8, 'rgba(180, 83, 9, 0.05)');
        ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = ambientGlow;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height);

        const step = width / flameCount;
        for (let i = 0; i <= flameCount; i++) {
          const fx = i * step;
          const variance = Math.sin(time * 4 + i * 0.8) * 35 + Math.cos(time * 7 + i) * 20;
          const fy = height - (flameHeights[i] + variance);
          if (i === 0) {
            ctx.lineTo(fx, fy);
          } else {
            const prevX = (i - 1) * step;
            const cx = (prevX + fx) / 2;
            ctx.quadraticCurveTo(prevX, fy, cx, fy);
          }
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        const flameGrad = ctx.createLinearGradient(0, height - 200, 0, height);
        flameGrad.addColorStop(0, 'rgba(255, 183, 3, 0)');
        flameGrad.addColorStop(0.3, 'rgba(249, 115, 22, 0.28)');
        flameGrad.addColorStop(0.7, 'rgba(220, 38, 38, 0.45)');
        flameGrad.addColorStop(1, 'rgba(185, 28, 28, 0.6)');
        ctx.fillStyle = flameGrad;
        ctx.fill();
        ctx.restore();

        embers.forEach((p) => {
          p.y -= p.speedY;
          p.x += Math.sin(time * 2 + p.wobbleSpeed) * 0.8 + p.speedX;
          p.life++;

          const currentAlpha = p.opacity * (1 - p.life / p.maxLife);

          ctx.save();
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, currentAlpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (p.life >= p.maxLife || p.y < -10) {
            p.y = height + Math.random() * 30;
            p.x = Math.random() * width;
            p.life = 0;
            p.speedY = Math.random() * 2.2 + 0.8;
          }
        });
      }

      // ============================================
      // 2. RAIN ANIMATION
      // ============================================
      else if (mode === 'rain') {
        const stormGrad = ctx.createLinearGradient(0, 0, 0, height);
        stormGrad.addColorStop(0, 'rgba(6, 12, 24, 0.55)');
        stormGrad.addColorStop(1, 'rgba(12, 20, 36, 0.45)');
        ctx.fillStyle = stormGrad;
        ctx.fillRect(0, 0, width, height);

        raindrops.forEach((drop) => {
          ctx.strokeStyle = `rgba(186, 215, 248, ${drop.opacity})`;
          ctx.lineWidth = drop.thickness;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 2, drop.y + drop.length);
          ctx.stroke();

          drop.y += drop.speed;
          drop.x -= 0.8;

          if (drop.y > height) {
            splashes.push({
              x: drop.x,
              y: height - Math.random() * 35,
              radius: 1,
              maxRadius: Math.random() * 6 + 3,
              opacity: 0.5
            });

            drop.y = -drop.length - Math.random() * 20;
            drop.x = Math.random() * (width + 100);
          }
        });

        for (let i = splashes.length - 1; i >= 0; i--) {
          const sp = splashes[i];
          ctx.strokeStyle = `rgba(200, 225, 255, ${sp.opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(sp.x, sp.y, sp.radius * 2, sp.radius, 0, 0, Math.PI * 2);
          ctx.stroke();

          sp.radius += 0.5;
          sp.opacity -= 0.04;
          if (sp.opacity <= 0) {
            splashes.splice(i, 1);
          }
        }

        // Realistic branched lightning strike during thunder flash
        if (lightningFlashRef.current) {
          drawPhotorealisticLightningBolt(ctx, width, height, time);
        }
      }

      // ============================================
      // 3. OCEAN ANIMATION
      // ============================================
      else if (mode === 'ocean') {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.62);
        skyGrad.addColorStop(0, 'rgba(3, 7, 18, 0.92)');
        skyGrad.addColorStop(0.45, 'rgba(5, 18, 38, 0.78)');
        skyGrad.addColorStop(0.85, 'rgba(8, 32, 58, 0.55)');
        skyGrad.addColorStop(1, 'rgba(10, 40, 68, 0.35)');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height * 0.64);

        // Soft Green Aurora Borealis
        ctx.save();
        ctx.beginPath();
        const auroraYBase = height * 0.22;
        ctx.moveTo(0, 0);
        ctx.lineTo(0, auroraYBase);

        for (let ax = 0; ax <= width; ax += 15) {
          const aWave = 
            Math.sin(ax * 0.003 + oceanTime * 1.2) * 35 +
            Math.cos(ax * 0.006 - oceanTime * 0.8) * 20;
          ctx.lineTo(ax, auroraYBase + aWave);
        }

        ctx.lineTo(width, 0);
        ctx.closePath();

        const auroraGrad = ctx.createLinearGradient(0, height * 0.05, 0, auroraYBase + 50);
        auroraGrad.addColorStop(0, 'rgba(16, 185, 129, 0)');
        auroraGrad.addColorStop(0.4, 'rgba(52, 211, 153, 0.09)');
        auroraGrad.addColorStop(0.7, 'rgba(45, 212, 191, 0.14)');
        auroraGrad.addColorStop(0.9, 'rgba(16, 185, 129, 0.06)');
        auroraGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = auroraGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, auroraYBase - 40);
        for (let ax = 0; ax <= width; ax += 15) {
          const aWave2 = Math.sin(ax * 0.004 + oceanTime * 1.5 + 2.0) * 28;
          ctx.lineTo(ax, auroraYBase - 20 + aWave2);
        }
        ctx.lineTo(width, height * 0.05);
        ctx.lineTo(0, height * 0.05);
        ctx.closePath();
        const auroraGrad2 = ctx.createLinearGradient(0, height * 0.08, 0, auroraYBase);
        auroraGrad2.addColorStop(0, 'rgba(45, 212, 191, 0)');
        auroraGrad2.addColorStop(0.5, 'rgba(52, 211, 153, 0.07)');
        auroraGrad2.addColorStop(1, 'rgba(20, 184, 166, 0)');
        ctx.fillStyle = auroraGrad2;
        ctx.fill();
        ctx.restore();

        // Ethereal Night Clouds
        nightClouds.forEach((cloud) => {
          cloud.x += cloud.speedX;
          if (cloud.x - cloud.radiusX > width) {
            cloud.x = -cloud.radiusX;
          }
          ctx.save();
          const cloudGrad = ctx.createRadialGradient(
            cloud.x, cloud.y, cloud.radiusX * 0.1,
            cloud.x, cloud.y, cloud.radiusX
          );
          cloudGrad.addColorStop(0, `rgba(30, 58, 95, ${cloud.opacity})`);
          cloudGrad.addColorStop(0.6, `rgba(20, 45, 75, ${cloud.opacity * 0.5})`);
          cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = cloudGrad;
          ctx.beginPath();
          ctx.ellipse(cloud.x, cloud.y, cloud.radiusX, cloud.radiusY, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Twinkling Stars
        oceanStars.forEach((star) => {
          const pulse = Math.sin(time * 20 * star.twinkleSpeed + star.phase);
          const currentAlpha = Math.max(0.18, Math.min(0.98, star.baseOpacity + pulse * 0.32));
          ctx.save();
          ctx.fillStyle = star.color;
          ctx.globalAlpha = currentAlpha;
          ctx.shadowBlur = star.size > 1.2 ? 6 : 2;
          ctx.shadowColor = 'rgba(215, 238, 255, 0.75)';
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Shooting Star
        shootingStarCooldown--;
        if (!shootingStar.active && shootingStarCooldown <= 0) {
          shootingStar.active = true;
          shootingStar.x = Math.random() * (width * 0.55) + width * 0.05;
          shootingStar.y = Math.random() * (height * 0.20) + 20;
          shootingStar.vx = Math.random() * 5 + 8;
          shootingStar.vy = Math.random() * 3.5 + 4;
          shootingStar.length = Math.random() * 45 + 60;
          shootingStar.life = 0;
          shootingStar.maxLife = Math.floor(Math.random() * 22 + 28);
          shootingStar.sparkles = [];
          shootingStarCooldown = Math.floor(Math.random() * 220 + 180);
        }

        if (shootingStar.active) {
          shootingStar.x += shootingStar.vx;
          shootingStar.y += shootingStar.vy;
          shootingStar.life++;

          if (Math.random() > 0.4) {
            shootingStar.sparkles.push({
              x: shootingStar.x + (Math.random() - 0.5) * 4,
              y: shootingStar.y + (Math.random() - 0.5) * 4,
              life: 0,
              opacity: 0.8
            });
          }

          const starAlpha = Math.max(0, 1 - shootingStar.life / shootingStar.maxLife);
          const tailX = shootingStar.x - shootingStar.vx * 3.8;
          const tailY = shootingStar.y - shootingStar.vy * 3.8;

          ctx.save();
          const trailGrad = ctx.createLinearGradient(tailX, tailY, shootingStar.x, shootingStar.y);
          trailGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          trailGrad.addColorStop(0.65, `rgba(186, 230, 253, ${starAlpha * 0.65})`);
          trailGrad.addColorStop(1, `rgba(255, 255, 255, ${starAlpha * 0.98})`);

          ctx.strokeStyle = trailGrad;
          ctx.lineWidth = 2.4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(shootingStar.x, shootingStar.y);
          ctx.stroke();

          ctx.shadowBlur = 16;
          ctx.shadowColor = '#ffffff';
          ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha})`;
          ctx.beginPath();
          ctx.arc(shootingStar.x, shootingStar.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (shootingStar.life >= shootingStar.maxLife || shootingStar.y > height * 0.62) {
            shootingStar.active = false;
          }
        }

        for (let sIdx = shootingStar.sparkles.length - 1; sIdx >= 0; sIdx--) {
          const sp = shootingStar.sparkles[sIdx];
          sp.life++;
          sp.opacity -= 0.04;
          if (sp.opacity <= 0) {
            shootingStar.sparkles.splice(sIdx, 1);
          } else {
            ctx.save();
            ctx.fillStyle = `rgba(224, 242, 254, ${sp.opacity})`;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        // Moon with craters
        const moonX = width * 0.82;
        const moonY = height * 0.16;
        const moonRadius = 25;

        ctx.save();
        const haloGrad = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius * 4.4);
        haloGrad.addColorStop(0, 'rgba(224, 242, 254, 0.28)');
        haloGrad.addColorStop(0.4, 'rgba(52, 211, 153, 0.08)');
        haloGrad.addColorStop(0.7, 'rgba(186, 230, 253, 0.04)');
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius * 4.4, 0, Math.PI * 2);
        ctx.fill();

        const moonGrad = ctx.createRadialGradient(moonX - 4, moonY - 4, 2, moonX, moonY, moonRadius);
        moonGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        moonGrad.addColorStop(0.65, 'rgba(224, 242, 254, 0.90)');
        moonGrad.addColorStop(1, 'rgba(186, 230, 253, 0.75)');
        ctx.fillStyle = moonGrad;
        ctx.shadowBlur = 22;
        ctx.shadowColor = 'rgba(224, 242, 254, 0.85)';
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(180, 205, 230, 0.25)';
        ctx.beginPath();
        ctx.arc(moonX - 6, moonY + 3, 4.5, 0, Math.PI * 2);
        ctx.arc(moonX + 5, moonY - 5, 3.5, 0, Math.PI * 2);
        ctx.arc(moonX + 3, moonY + 7, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Moonlight shimmer
        const shimmerGrad = ctx.createRadialGradient(
          moonX, height * 0.75, 20,
          moonX, height * 0.75, width * 0.38
        );
        shimmerGrad.addColorStop(0, 'rgba(224, 242, 254, 0.18)');
        shimmerGrad.addColorStop(0.3, 'rgba(52, 211, 153, 0.06)');
        shimmerGrad.addColorStop(0.6, 'rgba(186, 230, 253, 0.05)');
        shimmerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shimmerGrad;
        ctx.fillRect(0, height * 0.54, width, height * 0.46);

        // Ocean Waves
        drawWave(ctx, width, height, height * 0.59, 14, 0.0028, oceanTime * 0.85, 'rgba(6, 22, 45, 0.65)');
        
        const wave2BaseY = height * 0.68;
        const wave2Amp = 20;
        const wave2Freq = 0.0035;
        const wave2Phase = oceanTime * 1.15 + 1.8;
        drawWave(ctx, width, height, wave2BaseY, wave2Amp, wave2Freq, wave2Phase, 'rgba(8, 42, 75, 0.72)');

        // Tiny Sailboat on Waves
        const boatBaseX = width * 0.32 + Math.sin(oceanTime * 0.6) * 28;
        const boatY = wave2BaseY + 
          Math.sin(boatBaseX * wave2Freq + wave2Phase) * wave2Amp + 
          Math.cos(boatBaseX * wave2Freq * 0.5 + wave2Phase) * (wave2Amp * 0.45);
        
        const waveSlope = 
          Math.cos(boatBaseX * wave2Freq + wave2Phase) * wave2Freq * wave2Amp - 
          Math.sin(boatBaseX * wave2Freq * 0.5 + wave2Phase) * (wave2Freq * 0.5) * (wave2Amp * 0.45);
        const boatPitch = Math.atan(waveSlope) * 0.85;

        drawTinySailboat(ctx, boatBaseX, boatY, boatPitch, time);

        drawWave(
          ctx, width, height, height * 0.78, 24, 0.0044, oceanTime * 1.45 + 3.4, 
          'rgba(9, 58, 92, 0.80)', true, 'rgba(52, 211, 153, 0.15)'
        );

        drawWave(
          ctx, width, height, height * 0.88, 18, 0.0055, oceanTime * 1.75 + 5.0, 
          'rgba(5, 36, 70, 0.88)', true, 'rgba(45, 212, 191, 0.18)'
        );

        // Bioluminescent Plankton
        seaSparkles.forEach((p) => {
          p.x += p.speedX;
          const waveHeightOffset = Math.sin(p.x * 0.004 + oceanTime * 1.5 + p.phase) * 12;
          const py = p.baseY + waveHeightOffset;
          const pulse = Math.sin(time * 3 + p.phase) * 0.15;
          ctx.save();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0.1, p.opacity + pulse);
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, py, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
        });
      }

      // ============================================
      // 4. FOREST ANIMATION (Orman, Kuşlar, Dalda Duran Baykuş & Ateşböcekleri)
      // ============================================
      else if (mode === 'forest') {
        // 1. Deep lush twilight forest atmosphere
        const forestGrad = ctx.createLinearGradient(0, 0, 0, height);
        forestGrad.addColorStop(0, 'rgba(2, 11, 8, 0.94)');
        forestGrad.addColorStop(0.35, 'rgba(4, 22, 16, 0.88)');
        forestGrad.addColorStop(0.7, 'rgba(6, 32, 22, 0.85)');
        forestGrad.addColorStop(1, 'rgba(3, 16, 11, 0.95)');
        ctx.fillStyle = forestGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Moonlight filtering through the canopy
        const moonX = width * 0.28;
        const moonY = height * 0.18;
        const moonR = 28;

        ctx.save();
        const forestMoonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 5.5);
        forestMoonGlow.addColorStop(0, 'rgba(215, 255, 235, 0.25)');
        forestMoonGlow.addColorStop(0.3, 'rgba(110, 231, 183, 0.09)');
        forestMoonGlow.addColorStop(0.7, 'rgba(52, 211, 153, 0.03)');
        forestMoonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = forestMoonGlow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonR * 5.5, 0, Math.PI * 2);
        ctx.fill();

        // Moon disk
        const moonGrad = ctx.createRadialGradient(moonX - 4, moonY - 4, 3, moonX, moonY, moonR);
        moonGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        moonGrad.addColorStop(0.7, 'rgba(220, 252, 231, 0.85)');
        moonGrad.addColorStop(1, 'rgba(167, 243, 208, 0.70)');
        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 3. Ethereal God-Rays / Moonlight Beams piercing the forest canopy
        ctx.save();
        for (let r = 0; r < 4; r++) {
          const rayAngle = 0.35 + r * 0.12;
          const rayPulse = Math.sin(time * 0.8 + r * 1.2) * 0.03 + 0.05;
          const rayGrad = ctx.createLinearGradient(
            moonX, moonY, 
            moonX + Math.cos(rayAngle) * height * 1.2, 
            moonY + Math.sin(rayAngle) * height * 1.2
          );
          rayGrad.addColorStop(0, `rgba(167, 243, 208, ${rayPulse * 1.5})`);
          rayGrad.addColorStop(0.5, `rgba(110, 231, 183, ${rayPulse})`);
          rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          const startX = moonX + (r - 1.5) * 20;
          ctx.moveTo(startX, moonY);
          ctx.lineTo(startX + 180, height);
          ctx.lineTo(startX + 90, height);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // 4. Distant Pine / Woodland Silhouettes (Layer 1 - Misty background)
        ctx.save();
        ctx.fillStyle = 'rgba(7, 36, 26, 0.65)';
        drawPineRidge(ctx, width, height, height * 0.44, 55, 0.45);
        ctx.restore();

        // 5. Midground Majestic Forest Trees (Layer 2 - Deep pine ridge)
        ctx.save();
        ctx.fillStyle = 'rgba(5, 28, 20, 0.82)';
        drawPineRidge(ctx, width, height, height * 0.54, 75, 0.70);
        ctx.restore();

        // 5b. Dense Forest Understory (Layer 3 - Closer lush treeline)
        ctx.save();
        ctx.fillStyle = 'rgba(3, 18, 12, 0.94)';
        drawPineRidge(ctx, width, height, height * 0.64, 90, 0.95);
        ctx.restore();

        // 5c. Abundant Standalone Pine & Oak Trees (Çam ve Meşe Ağaçları)
        drawStandaloneTrees(ctx, width, height, time);

        // 6. Flying Birds across the Forest Canopy (Uçan Kuşlar)
        forestBirds.forEach((bird) => {
          bird.x += bird.speedX;
          bird.glideTimer++;

          // Alternating flapping and graceful soaring glide
          const isGliding = (bird.glideTimer % 180) > bird.glideDuration;
          const flapAngle = isGliding ? 0.08 : Math.sin(time * bird.flapSpeed + bird.phase);

          drawFlyingBird(ctx, bird.x, bird.y + Math.sin(time * 1.5 + bird.phase) * 6, bird.scale, flapAngle, bird.species);

          // Wrap bird smoothly around screen
          if (bird.x > width + 60) {
            bird.x = -60;
            bird.y = height * (0.12 + Math.random() * 0.22);
          }
        });

        // 7. Foreground Ancient Tree with Branch & Perched Owl (Dalda Duran Baykuş)
        const treeBranchX = width * 0.76;
        const treeBranchY = height * 0.38;

        // Draw the sturdy forest branch extending from the right
        drawForestBranch(ctx, width, height, treeBranchX, treeBranchY, time);

        // Draw the serene perched owl sitting on this branch
        drawPerchedOwl(ctx, treeBranchX, treeBranchY - 8, time);

        // 8. Swaying Foreground Forest Undergrowth & Ferns at bottom
        drawForestFloor(ctx, width, height, time);

        // 9. Gently Floating Autumn/Forest Leaves
        forestLeaves.forEach((leaf) => {
          leaf.y += leaf.speedY;
          leaf.x += Math.sin(time * 1.5 + leaf.swayPhase) * 1.2 + leaf.speedX;
          leaf.rotation += leaf.rotSpeed;

          ctx.save();
          ctx.translate(leaf.x, leaf.y);
          ctx.rotate(leaf.rotation);
          ctx.fillStyle = leaf.color;
          ctx.globalAlpha = 0.55;
          ctx.beginPath();
          ctx.ellipse(0, 0, leaf.size, leaf.size * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (leaf.y > height + 20) {
            leaf.y = -20;
            leaf.x = Math.random() * width;
          }
          if (leaf.x < -20) leaf.x = width + 20;
          if (leaf.x > width + 20) leaf.x = -20;
        });

        // 10. Glowing Fireflies / Forest Spores (Ateşböcekleri)
        fireflies.forEach((ff) => {
          ff.x += ff.speedX + Math.sin(time * 2 + ff.phase) * 0.4;
          ff.y += ff.speedY + Math.cos(time * 1.8 + ff.phase) * 0.3;

          const pulse = Math.sin(time * 8 * ff.pulseSpeed + ff.phase);
          const alpha = Math.max(0.12, Math.min(0.95, 0.5 + pulse * 0.45));

          ctx.save();
          ctx.shadowBlur = 10;
          ctx.shadowColor = ff.color;
          ctx.fillStyle = ff.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(ff.x, ff.y, ff.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Keep in bounds
          if (ff.y < height * 0.2) ff.speedY = Math.abs(ff.speedY);
          if (ff.y > height * 0.95) ff.speedY = -Math.abs(ff.speedY);
          if (ff.x < 0) ff.x = width;
          if (ff.x > width) ff.x = 0;
        });
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mode]);

  // Gerçekçi dallanan yıldırım efekti (Photorealistic branched lightning strike)
  const drawPhotorealisticLightningBolt = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number
  ) => {
    ctx.save();

    // 1. Gökyüzü ve bulut içi aydınlanma (Atmospheric sky flash)
    const skyFlash = ctx.createLinearGradient(0, 0, 0, h);
    skyFlash.addColorStop(0, 'rgba(238, 242, 255, 0.75)');
    skyFlash.addColorStop(0.3, 'rgba(186, 230, 253, 0.45)');
    skyFlash.addColorStop(0.7, 'rgba(129, 140, 248, 0.20)');
    skyFlash.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = skyFlash;
    ctx.fillRect(0, 0, w, h);

    // 2. Yıldırım ana gövdesi (Main jagged bolt trunk)
    const seed = Math.floor(time * 3);
    const startX = w * (0.35 + ((seed * 17) % 30) / 100);
    const segments = 14;
    const pts: Array<{ x: number; y: number }> = [{ x: startX, y: 0 }];
    
    let currX = startX;
    let currY = 0;
    const stepY = (h * 0.78) / segments;

    for (let s = 1; s <= segments; s++) {
      const jitterX = (((seed + s * 13) % 29) - 14) * 4;
      currX += jitterX;
      currY += stepY + (((seed + s * 7) % 11) - 5) * 3;
      pts.push({ x: currX, y: currY });
    }

    // Dış iyonlaşma halesi (Outer cyan-blue ionized corona)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();

    // Orta parlaklık halesi (Mid bright blue core)
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.9)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();

    // Göz alıcı bembeyaz merkez (Pure incandescent white core)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();

    // Dallanan yan yıldırımlar (Forked lightning branches)
    const branchIndices = [4, 7, 10];
    branchIndices.forEach((idx) => {
      if (idx < pts.length) {
        const bp = pts[idx];
        const dir = (idx % 2 === 0 ? 1 : -1);
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.85)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(bp.x, bp.y);
        const f1x = bp.x + dir * 35;
        const f1y = bp.y + 35;
        ctx.lineTo(f1x, f1y);
        const f2x = f1x + dir * 25;
        const f2y = f1y + 45;
        ctx.lineTo(f2x, f2y);
        ctx.stroke();
      }
    });

    // Zemin temas patlaması (Ground strike impact bloom)
    const strikeBase = pts[pts.length - 1];
    const strikeGlow = ctx.createRadialGradient(strikeBase.x, strikeBase.y, 4, strikeBase.x, strikeBase.y, 90);
    strikeGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    strikeGlow.addColorStop(0.3, 'rgba(125, 211, 252, 0.6)');
    strikeGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = strikeGlow;
    ctx.beginPath();
    ctx.arc(strikeBase.x, strikeBase.y, 90, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Helper to draw pine tree ridge silhouettes
  const drawPineRidge = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    baseY: number,
    treeHeight: number,
    density: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(0, h);

    const step = 28 / density;
    for (let x = 0; x <= w + step; x += step) {
      const peakY = baseY - (treeHeight + Math.sin(x * 0.015) * 18);
      ctx.lineTo(x - step * 0.5, peakY);
      ctx.lineTo(x, peakY + treeHeight * 0.85);
    }

    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  };

  // Bob Ross tarzı gerçekçi, katmanlı, iğne yapraklı görkemli çam/köknar ağacı
  const drawBobRossFir = (
    ctx: CanvasRenderingContext2D,
    x: number,
    baseY: number,
    height: number,
    maxWidth: number,
    time: number,
    swayMult: number = 0.4,
    highlightAlpha: number = 0.42
  ) => {
    ctx.save();

    // Gövde (Textured pine trunk)
    const trunkWidth = Math.max(4.5, maxWidth * 0.12);
    ctx.fillStyle = '#06130b';
    ctx.fillRect(x - trunkWidth / 2, baseY - height * 0.48, trunkWidth, height * 0.48 + 16);

    // Bob Ross yelpaze fırça tekniğiyle kat kat inen iğne yapraklı dallar (Tiers)
    const tiers = 9;
    for (let t = 0; t < tiers; t++) {
      const progress = t / (tiers - 1);
      const tierY = baseY - height + progress * (height * 0.88);
      const tierW = (0.18 + 0.82 * Math.pow(progress, 0.88)) * maxWidth;
      const tierSway = Math.sin(time * 0.6 + t * 0.4) * swayMult * (1 - progress * 0.4);
      const branchDrop = 9 + progress * 14;

      // Bob Ross zikzak/yelpaze dal profili
      ctx.beginPath();
      ctx.moveTo(x + tierSway, tierY - 14);
      ctx.lineTo(x - tierW * 0.35 + tierSway, tierY + branchDrop * 0.4);
      ctx.lineTo(x - tierW * 0.70 + tierSway, tierY + branchDrop * 0.75);
      ctx.lineTo(x - tierW + tierSway, tierY + branchDrop);
      ctx.quadraticCurveTo(x + tierSway, tierY + branchDrop * 0.55, x + tierW + tierSway, tierY + branchDrop);
      ctx.lineTo(x + tierW * 0.70 + tierSway, tierY + branchDrop * 0.75);
      ctx.lineTo(x + tierW * 0.35 + tierSway, tierY + branchDrop * 0.4);
      ctx.closePath();

      // Koyu orman yeşili iğne yaprak dolgusu
      ctx.fillStyle = t % 2 === 0 ? 'rgba(3, 22, 14, 0.98)' : 'rgba(5, 28, 18, 0.96)';
      ctx.fill();

      // Bob Ross ay ışığı/kar dokunuşu - ağaçların belirgin ve görünür olması için
      ctx.strokeStyle = `rgba(167, 243, 208, ${highlightAlpha * (0.3 + 0.7 * (1 - progress * 0.35))})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x + tierSway, tierY - 14);
      ctx.lineTo(x - tierW + tierSway, tierY + branchDrop);
      ctx.stroke();

      ctx.strokeStyle = `rgba(52, 211, 153, ${highlightAlpha * 0.55})`;
      ctx.beginPath();
      ctx.moveTo(x + tierSway, tierY - 14);
      ctx.lineTo(x + tierW + tierSway, tierY + branchDrop);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Helper to draw standalone natural trees (Bob Ross tarzı belirgin çam ve köknar ağaçları)
  // NOT: Sol üstteki yuvarlaklar tamamen kaldırıldı, yerine Bob Ross tarzı gerçekçi ağaçlar eklendi.
  const drawStandaloneTrees = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number
  ) => {
    ctx.save();

    // 1. Sol taraftaki devasa Bob Ross Çamı (Sol üstteki yuvarlakların yerine ekranı saran muazzam çam)
    drawBobRossFir(ctx, w * 0.05, h * 0.76, 370, 98, time, 0.35, 0.50);
    drawBobRossFir(ctx, w * 0.12, h * 0.74, 280, 78, time, 0.40, 0.45);

    // 2. Orman boyunca dizilen Bob Ross tarzı belirgin çam ve köknar ağaçları
    const forestPines = [
      { x: w * 0.22, baseY: h * 0.72, height: 215, width: 62, sway: 0.45 },
      { x: w * 0.34, baseY: h * 0.70, height: 250, width: 72, sway: 0.50 },
      { x: w * 0.46, baseY: h * 0.73, height: 185, width: 54, sway: 0.38 },
      { x: w * 0.58, baseY: h * 0.69, height: 230, width: 66, sway: 0.48 },
      { x: w * 0.68, baseY: h * 0.72, height: 195, width: 56, sway: 0.42 },
      { x: w * 0.82, baseY: h * 0.71, height: 220, width: 64, sway: 0.46 },
      { x: w * 0.92, baseY: h * 0.75, height: 160, width: 48, sway: 0.35 }
    ];

    forestPines.forEach((fp) => {
      drawBobRossFir(ctx, fp.x, fp.baseY, fp.height, fp.width, time, fp.sway, 0.42);
    });

    // 3. Sağ ağaç gövdesi desteği (Baykuşun dalını zemine bağlayan sağlam gövde)
    ctx.fillStyle = '#050c07';
    ctx.beginPath();
    ctx.moveTo(w + 10, 0);
    ctx.lineTo(w - 28, 0);
    ctx.quadraticCurveTo(w - 38, h * 0.45, w - 24, h);
    ctx.lineTo(w + 10, h);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // Helper to draw flying birds with graceful animated flapping wings
  // Desteklenen 2 zarif tür: 'raptor' (yüksekte süzülen kartal) ve 'songbird' (ağaçlar arasında süzülen orman kuşu)
  const drawFlyingBird = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    flapAngle: number,
    species: 'raptor' | 'songbird'
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#030c08';
    ctx.strokeStyle = '#030c08';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (species === 'raptor') {
      // 1. Görkemli Yırtıcı Kuş (Geniş kanat açıklığı, aerodinamik süzülüş)
      // Gövde
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 3.5, 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Yelpaze kuyruk
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(-17, -4);
      ctx.lineTo(-16, 4);
      ctx.closePath();
      ctx.fill();

      // Kanatlar - yavaş ve görkemli çırpış / süzülüş
      const wingY = flapAngle * 12;

      // Sol Kanat
      ctx.beginPath();
      ctx.moveTo(-2, -1);
      ctx.quadraticCurveTo(-6, -10 + wingY * 0.6, -20, -14 + wingY);
      ctx.lineTo(-17, -8 + wingY * 0.8);
      ctx.quadraticCurveTo(-9, -3 + wingY * 0.4, 4, 0);
      ctx.fill();

      // Sağ Kanat (Ön plan)
      ctx.beginPath();
      ctx.moveTo(1, 1);
      ctx.quadraticCurveTo(6, 11 - wingY * 0.6, 18, 15 - wingY);
      ctx.lineTo(15, 9 - wingY * 0.8);
      ctx.quadraticCurveTo(8, 4 - wingY * 0.4, -3, 1);
      ctx.fill();
    } else {
      // 2. Zarif Orman Kuşu (Akıcı, çevik ve pürüzsüz)
      // Gövde & Baş
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 3, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Kuyruk tüyleri
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(-13, -2.5);
      ctx.lineTo(-12, 2.5);
      ctx.closePath();
      ctx.fill();

      // Kanatlar
      const wingY = flapAngle * 9;

      // Sol Kanat
      ctx.beginPath();
      ctx.moveTo(-1, -1);
      ctx.quadraticCurveTo(-4, -6 + wingY * 0.6, -14, -8 + wingY);
      ctx.quadraticCurveTo(-7, -2 + wingY * 0.4, 3, 0);
      ctx.fill();

      // Sağ Kanat
      ctx.beginPath();
      ctx.moveTo(0, 1);
      ctx.quadraticCurveTo(4, 7 - wingY * 0.6, 12, 9 - wingY);
      ctx.quadraticCurveTo(6, 3 - wingY * 0.4, -2, 1);
      ctx.fill();
    }

    ctx.restore();
  };

  // Helper to draw a mossy ancient forest branch
  const drawForestBranch = (
    ctx: CanvasRenderingContext2D,
    w: number,
    _h: number,
    bx: number,
    by: number,
    time: number
  ) => {
    ctx.save();
    const branchSway = Math.sin(time * 0.6) * 1.5;

    // Main Branch Path
    ctx.beginPath();
    ctx.moveTo(w, by - 24);
    ctx.bezierCurveTo(w * 0.90, by - 12, bx + 60, by - 6 + branchSway, bx - 30, by + branchSway);
    ctx.bezierCurveTo(bx + 40, by + 18 + branchSway, w * 0.88, by + 26, w, by + 36);
    ctx.closePath();

    const barkGrad = ctx.createLinearGradient(bx, by - 20, bx, by + 30);
    barkGrad.addColorStop(0, '#1c1917');
    barkGrad.addColorStop(0.5, '#0c0a09');
    barkGrad.addColorStop(1, '#050404');
    ctx.fillStyle = barkGrad;
    ctx.fill();

    // Moss highlights on top of the branch
    ctx.beginPath();
    ctx.moveTo(w, by - 22);
    ctx.bezierCurveTo(w * 0.90, by - 10, bx + 60, by - 4 + branchSway, bx - 26, by + 1 + branchSway);
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.25)';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Hanging forest lichen / moss tendrils
    for (let m = 0; m < 5; m++) {
      const mx = bx + 20 + m * 25;
      const my = by + 8 + branchSway;
      const mLength = 12 + Math.sin(m * 3) * 6;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.quadraticCurveTo(mx + Math.sin(time + m) * 3, my + mLength * 0.5, mx + 1, my + mLength);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.22)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    ctx.restore();
  };

  // Helper to draw the charming, intelligent perched owl with glowing eyes & natural blinking
  // Belirgin, görünür ve arada bir göz kırpan bilge orman baykuşu
  const drawPerchedOwl = (
    ctx: CanvasRenderingContext2D,
    ox: number,
    oy: number,
    time: number
  ) => {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(1.28, 1.28); // Daha iri ve görünür boyut

    // Doğal baş eğimi ve etrafa bakış
    const headTilt = Math.sin(time * 0.7) * 0.08;

    // 0. Baykuş siluetinin gece karanlığında parıldaması için yumuşak ay ışığı aurası
    const aura = ctx.createRadialGradient(0, -22, 6, 0, -22, 34);
    aura.addColorStop(0, 'rgba(167, 243, 208, 0.22)');
    aura.addColorStop(0.6, 'rgba(52, 211, 153, 0.08)');
    aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, -22, 34, 0, Math.PI * 2);
    ctx.fill();

    // 1. Owl Body & Wings (Zengin sıcak tonlarda tüyler)
    ctx.save();
    // Vücut konturu
    ctx.beginPath();
    ctx.ellipse(0, -18, 14.5, 20.5, 0.05, 0, Math.PI * 2);
    const bodyGrad = ctx.createLinearGradient(-14, -38, 14, 2);
    bodyGrad.addColorStop(0, '#524338'); // Sıcak kahve-kehribar ton
    bodyGrad.addColorStop(0.5, '#3a2e26');
    bodyGrad.addColorStop(1, '#1e1713');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Göğüs tüyleri (Açık krem-fawn zarafeti)
    ctx.fillStyle = 'rgba(237, 231, 225, 0.35)';
    for (let r = 0; r < 3; r++) {
      ctx.beginPath();
      ctx.arc(-4 + r * 4, -12, 3.2, 0, Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-6 + r * 5, -6, 3.8, 0, Math.PI);
      ctx.fill();
    }

    // Katlanmış kanatlar
    ctx.beginPath();
    ctx.ellipse(-11, -16, 5.2, 17, 0.2, 0, Math.PI * 2);
    ctx.ellipse(11, -16, 5.2, 17, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#2c221c';
    ctx.fill();

    // Ay ışığı vuruşu (Moonlit rim contour)
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.55)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Dala tutunan pençeler (Talons)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(-6, 2, 2.8, 0, Math.PI * 2);
    ctx.arc(-2, 2.5, 2.8, 0, Math.PI * 2);
    ctx.arc(2, 2.5, 2.8, 0, Math.PI * 2);
    ctx.arc(6, 2, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Head with Tufted Horns (Karakteristik Kulak Tüyleri ve Baş)
    ctx.save();
    ctx.translate(0, -34);
    ctx.rotate(headTilt);

    // Baş tabanı
    ctx.beginPath();
    ctx.ellipse(0, 0, 13.5, 11.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#4a3d33';
    ctx.fill();

    // Kulak püskülleri (Tufted horns)
    ctx.beginPath();
    ctx.moveTo(-11, -6);
    ctx.lineTo(-15, -19);
    ctx.lineTo(-5, -10);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(11, -6);
    ctx.lineTo(15, -19);
    ctx.lineTo(5, -10);
    ctx.closePath();
    ctx.fill();

    // Kulak uçlarında ay ışığı parıltısı
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.65)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-11, -6);
    ctx.lineTo(-15, -19);
    ctx.moveTo(11, -6);
    ctx.lineTo(15, -19);
    ctx.stroke();

    // Yüz diski halkaları
    ctx.fillStyle = 'rgba(74, 62, 53, 0.7)';
    ctx.beginPath();
    ctx.arc(-5, 0, 6.2, 0, Math.PI * 2);
    ctx.arc(5, 0, 6.2, 0, Math.PI * 2);
    ctx.fill();

    // Gaga
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.lineTo(-2.2, 7.5);
    ctx.lineTo(2.2, 7.5);
    ctx.closePath();
    ctx.fill();

    // 3. Parlak Kehribar Baykuş Gözleri ve Doğal Göz Kırpma (Intelligent Eye Blinking)
    // Her ~3.6 saniyede bir gözlerini 0.18 saniye kırpar
    const blinkCycle = (time * 0.9) % 3.6;
    const isBlinking = blinkCycle > 3.42;

    if (!isBlinking) {
      // Açık gözlerde parlak kehribar halesi
      const eyeGlow = ctx.createRadialGradient(0, 0, 4, 0, 0, 22);
      eyeGlow.addColorStop(0, 'rgba(251, 191, 36, 0.38)');
      eyeGlow.addColorStop(0.6, 'rgba(245, 158, 11, 0.12)');
      eyeGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();

      // Sol Göz
      ctx.save();
      ctx.translate(-5, 0);
      ctx.beginPath();
      ctx.arc(0, 0, 4.4, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24'; // Parlak altın kehribar
      ctx.fill();

      // İris / Gözbebeği
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#09090b';
      ctx.fill();

      // Işık yansıması (Catchlight dots)
      ctx.beginPath();
      ctx.arc(-1, -1, 1.0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      // Sağ Göz
      ctx.save();
      ctx.translate(5, 0);
      ctx.beginPath();
      ctx.arc(0, 0, 4.4, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#09090b';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(-1, -1, 1.0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
    } else {
      // Göz Kırpma Durumu: Zarifçe kapanan göz kapakları çizgisi
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';

      // Sol göz kapağı
      ctx.beginPath();
      ctx.arc(-5, 1, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Sağ göz kapağı
      ctx.beginPath();
      ctx.arc(5, 1, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    ctx.restore(); // end head
    ctx.restore(); // end owl
  };

  // Helper to draw dense, authentic forest floor grass (kısa, sık ve yavaş salınan orman zemini çimi)
  const drawForestFloor = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number
  ) => {
    ctx.save();

    // 1. Natural rolling mossy ground mound
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.quadraticCurveTo(w * 0.25, h - 30, w * 0.55, h - 18);
    ctx.quadraticCurveTo(w * 0.85, h - 12, w, h - 26);
    ctx.lineTo(w, h);
    ctx.closePath();

    const floorGrad = ctx.createLinearGradient(0, h - 35, 0, h);
    floorGrad.addColorStop(0, '#041d13');
    floorGrad.addColorStop(0.4, '#03140d');
    floorGrad.addColorStop(1, '#020b07');
    ctx.fillStyle = floorGrad;
    ctx.fill();

    // Ground profile helper to calculate Y on the ground curve for any X
    const getGroundY = (x: number) => {
      const normX = x / Math.max(w, 1);
      if (normX < 0.55) {
        const t = normX / 0.55;
        // Bezier from (0, h) through (w*0.25, h-30) to (w*0.55, h-18)
        const p0 = h;
        const p1 = h - 30;
        const p2 = h - 18;
        return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
      } else {
        const t = (normX - 0.55) / 0.45;
        // Bezier from (w*0.55, h-18) through (w*0.85, h-12) to (w, h-26)
        const p0 = h - 18;
        const p1 = h - 12;
        const p2 = h - 26;
        return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
      }
    };

    // 2. Layer 1: Dense Back Woodland Grass Blades (Sık Arka Çim Örtüsü)
    // Step = 5px (çimler çok sık, boyu 10-18px arası kısa)
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    for (let gx = 0; gx <= w; gx += 5) {
      const gy = getGroundY(gx);
      const bladeHeight = 10 + Math.sin(gx * 0.12) * 5 + Math.cos(gx * 0.3) * 3;
      // Slow, relaxing breeze animation (yavaşlatılmış salınım)
      const sway = Math.sin(time * 0.45 + gx * 0.08) * 2.2;

      ctx.strokeStyle = 'rgba(20, 83, 45, 0.65)';
      ctx.beginPath();
      ctx.moveTo(gx, gy + 1);
      ctx.quadraticCurveTo(gx + sway * 0.5, gy - bladeHeight * 0.6, gx + sway, gy - bladeHeight);
      ctx.stroke();
    }

    // 3. Layer 2: Dense Foreground Forest Carpet Grass (Sık Ön Zemin Çimi)
    // Step = 3.5px (gerçek bir orman zemini gibi gür ve sık, boyu 7-14px arası kısa)
    ctx.lineWidth = 1.3;
    for (let gx = 2; gx <= w; gx += 3.5) {
      const gy = getGroundY(gx);
      const bladeHeight = 7 + Math.sin(gx * 0.22) * 4 + Math.cos(gx * 0.15) * 2.5;
      const sway = Math.sin(time * 0.55 + gx * 0.11) * 1.8;

      const isBright = Math.floor(gx) % 7 === 0;
      ctx.strokeStyle = isBright ? 'rgba(74, 222, 128, 0.65)' : 'rgba(34, 197, 94, 0.75)';
      ctx.beginPath();
      ctx.moveTo(gx, gy + 2);
      ctx.quadraticCurveTo(gx + sway * 0.4, gy - bladeHeight * 0.5, gx + sway, gy - bladeHeight);
      ctx.stroke();
    }

    // 4. Compact Low Forest Fern Fronds (Kısa Orman Eğrelti Otları)
    const fernClusters = [w * 0.05, w * 0.14, w * 0.23, w * 0.42, w * 0.61, w * 0.82, w * 0.92];
    fernClusters.forEach((fx, fIdx) => {
      const fy = getGroundY(fx);
      const clusterSway = Math.sin(time * 0.5 + fIdx * 0.9) * 3.5;
      // 3 short radiating fronds per cluster (12-18px short)
      [-1, 0, 1].forEach((dir) => {
        const length = 13 + Math.abs(dir) * 4;
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.50)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.quadraticCurveTo(
          fx + dir * 8 + clusterSway * 0.5, 
          fy - length * 0.55, 
          fx + dir * 14 + clusterSway, 
          fy - length
        );
        ctx.stroke();
      });
    });

    ctx.restore();
  };

  // Helper to draw ultra-smooth undulating sine waves with sub-pixel sampling
  const drawWave = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    baseY: number,
    amplitude: number,
    frequency: number,
    phase: number,
    fillColor: string,
    drawFoam = false,
    crestTint?: string
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, h);

    for (let x = 0; x <= w; x += 3) {
      const y =
        baseY +
        Math.sin(x * frequency + phase) * amplitude +
        Math.cos(x * frequency * 0.5 + phase) * (amplitude * 0.45);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    if (crestTint) {
      ctx.save();
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y =
          baseY +
          Math.sin(x * frequency + phase) * amplitude +
          Math.cos(x * frequency * 0.5 + phase) * (amplitude * 0.45);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = crestTint;
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();
    }

    if (drawFoam) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y =
          baseY +
          Math.sin(x * frequency + phase) * amplitude +
          Math.cos(x * frequency * 0.5 + phase) * (amplitude * 0.45);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(215, 245, 255, 0.45)';
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }
    ctx.restore();
  };

  // Helper to draw the miniature wooden sailboat bobbing on the ocean
  const drawTinySailboat = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    pitch: number,
    time: number
  ) => {
    ctx.save();
    ctx.translate(x, y - 2);
    ctx.rotate(pitch);

    const waterGlow = ctx.createRadialGradient(0, 4, 1, 0, 8, 22);
    waterGlow.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
    waterGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.12)');
    waterGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = waterGlow;
    ctx.beginPath();
    ctx.ellipse(0, 7, 24, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-16, -2);
    ctx.lineTo(16, -2);
    ctx.quadraticCurveTo(17, 4, 11, 7);
    ctx.lineTo(-11, 7);
    ctx.quadraticCurveTo(-17, 4, -16, -2);
    ctx.closePath();

    const hullGrad = ctx.createLinearGradient(0, -2, 0, 7);
    hullGrad.addColorStop(0, '#3e2723');
    hullGrad.addColorStop(0.5, '#2b1b17');
    hullGrad.addColorStop(1, '#1b120f');
    ctx.fillStyle = hullGrad;
    ctx.fill();

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-15, -1);
    ctx.lineTo(15, -1);
    ctx.stroke();

    ctx.strokeStyle = '#d7ccc8';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(1, -1);
    ctx.lineTo(1, -27);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(1, -26);
    ctx.quadraticCurveTo(11, -16, 12, -7);
    ctx.lineTo(1, -6);
    ctx.closePath();

    const sailGrad = ctx.createLinearGradient(1, -26, 12, -6);
    sailGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    sailGrad.addColorStop(0.7, 'rgba(241, 245, 249, 0.88)');
    sailGrad.addColorStop(1, 'rgba(203, 213, 225, 0.82)');
    ctx.fillStyle = sailGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.quadraticCurveTo(-7, -15, -13, -4);
    ctx.lineTo(0, -5);
    ctx.closePath();
    ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
    ctx.fill();

    const lanternX = 3;
    const lanternY = -4;

    const lanternGlow = ctx.createRadialGradient(lanternX, lanternY, 1, lanternX, lanternY, 14);
    lanternGlow.addColorStop(0, 'rgba(251, 191, 36, 0.95)');
    lanternGlow.addColorStop(0.4, 'rgba(245, 158, 11, 0.40)');
    lanternGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = lanternGlow;
    ctx.beginPath();
    ctx.arc(lanternX, lanternY, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#fbbf24';
    ctx.beginPath();
    ctx.arc(lanternX, lanternY, 1.8, 0, Math.PI * 2);
    ctx.fill();

    const flagFlutter = Math.sin(time * 8) * 2;
    ctx.beginPath();
    ctx.moveTo(1, -27);
    ctx.lineTo(8, -25 + flagFlutter);
    ctx.lineTo(1, -23);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    ctx.restore();
  };

  if (mode === 'off') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Lightning Flash Overlay */}
      {lightningFlash && mode === 'rain' && (
        <div className="absolute inset-0 bg-blue-100/35 transition-opacity duration-300 pointer-events-none animate-pulse" />
      )}
    </div>
  );
});

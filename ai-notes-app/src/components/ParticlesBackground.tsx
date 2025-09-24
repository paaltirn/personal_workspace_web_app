'use client';

import { useCallback, useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadBasic } from '@tsparticles/basic';

interface ParticlesBackgroundProps {
  className?: string;
}

export default function ParticlesBackground({ className }: ParticlesBackgroundProps) {
  const [init, setInit] = useState(false);

  // Initialize particles engine once
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      console.log('Particles initializing...', engine);
      await loadBasic(engine);
      console.log('Particles initialized successfully!');
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = useCallback(async (container: unknown) => {
    console.log('Particles loaded!', container);
  }, []);

  if (!init) {
    return null;
  }

  return (
    <Particles
      className={className}
      id="tsparticles"
      particlesLoaded={particlesLoaded}
      options={{
        background: {
          color: {
            value: 'transparent',
          },
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: 'push',
            },
            onHover: {
              enable: true,
              mode: 'repulse',
            },

          },
          modes: {
            push: {
              quantity: 3,
            },
            repulse: {
              distance: 100,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
          },
          links: {
            color: '#3b82f6',
            distance: 120,
            enable: true,
            opacity: 0.4,
            width: 1,
          },
          move: {
            direction: 'none',
            enable: true,
            outModes: {
              default: 'bounce',
            },
            speed: 1.5,
          },
          number: {
            density: {
              enable: true,
            },
            value: 40,
          },
          opacity: {
            value: 0.6,
          },
          shape: {
            type: 'circle',
          },
          size: {
            value: { min: 2, max: 5 },
          },
        },
        detectRetina: true,
        fullScreen: {
          enable: false,
          zIndex: 1,
        },
      }}
    />
  );
}
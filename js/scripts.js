// Créer des nuages animés avec apparition aléatoire continue
function createClouds() {
  function spawnCloud() {
    const cloud = document.createElement('div');
    cloud.className = 'cloud';
    
    // Taille aléatoire (entre 80 et 150px de largeur)
    const width = Math.floor(Math.random() * 70) + 80;
    const height = width * 0.6;
    
    // Position verticale aléatoire (entre 0% et 100% de la hauteur de la fenêtre)
    const top = Math.floor(Math.random() * 100);
    
    // Durée d'animation aléatoire (entre 20 et 40 secondes - plus rapide)
    const duration = Math.floor(Math.random() * 20) + 20;
    
    cloud.style.position = 'fixed';
    cloud.style.top = top + '%';
    cloud.style.left = '-250px';
    cloud.style.width = width + 'px';
    cloud.style.height = height + 'px';
    cloud.style.pointerEvents = 'none';
    cloud.style.zIndex = '-5';
    cloud.style.background = '#ffffff';
    cloud.style.borderRadius = '50%';
    
    // Choisir une forme de nuage aléatoire parmi 5 formes différentes
    const cloudType = Math.floor(Math.random() * 5);
    let shadows;
    
    switch(cloudType) {
      case 0: // Nuage compact et rond
        shadows = [
          `#ffffff ${width * 0.45}px ${height * -0.2}px 0 ${height * 0.12}px`,
          `#ffffff ${width * 0.65}px ${height * 0.08}px 0 ${height * 0.18}px`,
          `#ffffff ${width * 0.25}px ${height * -0.12}px 0 ${height * 0.08}px`,
          `#ffffff ${width * 0.55}px ${height * 0.18}px 0 ${height * 0.08}px`
        ];
        break;
      
      case 1: // Nuage allongé
        shadows = [
          `#ffffff ${width * 0.35}px ${height * -0.1}px 0 ${height * 0.05}px`,
          `#ffffff ${width * 0.55}px ${height * 0}px 0 ${height * 0.1}px`,
          `#ffffff ${width * 0.75}px ${height * -0.08}px 0 ${height * 0.06}px`,
          `#ffffff ${width * 0.15}px ${height * 0.05}px 0 ${height * 0.04}px`,
          `#ffffff ${width * 0.95}px ${height * 0.03}px 0 ${height * 0.05}px`
        ];
        break;
      
      case 2: // Nuage gonflé avec beaucoup de boules
        shadows = [
          `#ffffff ${width * 0.3}px ${height * -0.25}px 0 ${height * 0.15}px`,
          `#ffffff ${width * 0.5}px ${height * -0.18}px 0 ${height * 0.2}px`,
          `#ffffff ${width * 0.7}px ${height * -0.22}px 0 ${height * 0.12}px`,
          `#ffffff ${width * 0.4}px ${height * 0.1}px 0 ${height * 0.1}px`,
          `#ffffff ${width * 0.6}px ${height * 0.15}px 0 ${height * 0.08}px`,
          `#ffffff ${width * 0.2}px ${height * 0}px 0 ${height * 0.06}px`
        ];
        break;
      
      case 3: // Nuage petit et mignon
        shadows = [
          `#ffffff ${width * 0.4}px ${height * -0.15}px 0 ${height * 0.1}px`,
          `#ffffff ${width * 0.6}px ${height * 0.05}px 0 ${height * 0.12}px`,
          `#ffffff ${width * 0.2}px ${height * -0.05}px 0 ${height * 0.05}px`
        ];
        break;
      
      case 4: // Nuage asymétrique
        shadows = [
          `#ffffff ${width * 0.5}px ${height * -0.3}px 0 ${height * 0.2}px`,
          `#ffffff ${width * 0.7}px ${height * -0.1}px 0 ${height * 0.15}px`,
          `#ffffff ${width * 0.3}px ${height * 0.05}px 0 ${height * 0.08}px`,
          `#ffffff ${width * 0.85}px ${height * 0.08}px 0 ${height * 0.1}px`,
          `#ffffff ${width * 0.15}px ${height * -0.15}px 0 ${height * 0.06}px`
        ];
        break;
    }
    
    cloud.style.boxShadow = shadows.join(', ');
    cloud.style.opacity = '0.85';
    
    cloud.style.animation = `cloud-float ${duration}s linear forwards`;
    
    document.body.appendChild(cloud);
    
    // Supprimer le nuage après l'animation
    setTimeout(() => {
      cloud.remove();
    }, duration * 1000);
  }
  
  // Faire apparaître des nuages à des intervalles aléatoires
  function scheduleNextCloud() {
    // Intervalle aléatoire entre 1 et 4 secondes
    const interval = Math.floor(Math.random() * 4000) + 1000;
    
    setTimeout(() => {
      spawnCloud();
      scheduleNextCloud(); // Planifier le prochain nuage
    }, interval);
  }
  
  // Lancer le premier nuage immédiatement
  spawnCloud();
  
  // Puis lancer le cycle régulier après 2-6 secondes
  scheduleNextCloud();
}

// Appeler la fonction au chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createClouds);
} else {
  createClouds();
}

// Créer des feux d'artifice
function createFireworks() {
  function spawnFirework() {
    // Position horizontale aléatoire
    const posX = Math.random() * 100;
    
    // Hauteur de lancement aléatoire (entre 30% et 80% de la hauteur)
    const launchHeight = (Math.random() * 50 + 30);
    
    // Couleur aléatoire pour l'explosion ET la fusée
    const colors = ['#ff6b9d', '#c06c84', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e', '#00b894', '#0984e3', '#ffa502'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Créer la fusée
    const rocket = document.createElement('div');
    rocket.style.position = 'fixed';
    rocket.style.left = posX + '%';
    rocket.style.bottom = '0px';
    rocket.style.width = '4px';
    rocket.style.height = '30px';
    rocket.style.background = randomColor;
    rocket.style.zIndex = '-4';
    rocket.style.pointerEvents = 'none';
    rocket.style.boxShadow = `0 0 8px ${randomColor}`;
    rocket.style.setProperty('--launch-height', launchHeight + 'vh');
    rocket.style.animation = `firework-launch 1.5s ease-out forwards`;
    
    document.body.appendChild(rocket);
    
    // Créer l'explosion après le lancement
    setTimeout(() => {
      rocket.remove();
      
      // Créer les particules de l'explosion
      const particleCount = 30 + Math.random() * 20;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const angle = (i / particleCount) * Math.PI * 2;
        const velocity = 3 + Math.random() * 5;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        particle.style.position = 'fixed';
        particle.style.left = posX + '%';
        particle.style.bottom = launchHeight + 'vh';
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.background = randomColor;
        particle.style.borderRadius = '50%';
        particle.style.zIndex = '-4';
        particle.style.pointerEvents = 'none';
        particle.style.boxShadow = `0 0 12px ${randomColor}`;
        
        document.body.appendChild(particle);
        
        // Animer la particule
        let x = 0, y = 0;
        const gravity = 0.1;
        let velY = vy;
        let frame = 0;
        const maxFrames = 80;
        
        const animate = () => {
          frame++;
          x += vx;
          y += velY;
          velY += gravity;
          
          particle.style.left = (posX + (x / 10)) + '%';
          particle.style.bottom = (launchHeight + (y / 10)) + 'vh';
          particle.style.opacity = (1 - (frame / maxFrames));
          
          if (frame < maxFrames) {
            requestAnimationFrame(animate);
          } else {
            particle.remove();
          }
        };
        
        animate();
      }
    }, 1500);
  }
  
  // Planifier les feux d'artifice à des intervalles aléatoires
  function scheduleNextFirework() {
    // Intervalle aléatoire entre 5 et 30 secondes
    const interval = Math.floor(Math.random() * 5000) + 1000;
    
    setTimeout(() => {
      spawnFirework();
      scheduleNextFirework();
    }, interval);
  }
  
  // Lancer le cycle
  scheduleNextFirework();
}

// Appeler la fonction au chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createFireworks);
} else {
  createFireworks();
}
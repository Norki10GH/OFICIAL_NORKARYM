// --- LÒGICA DE L'ANIMACIÓ DE PARTÍCULES (BACKGROUND.html) ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let isMouseMoving = false;
        let mouseMoveTimer;
        const vibrantColors = ['#cccccc', '#aaaaaa', '#888888', '#dddddd', '#bbbbbb'];
        let particlesArray;
        const particleCount = 120;
        const maxDistance = 120;

        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x; this.y = y; this.directionX = directionX; this.directionY = directionY; this.size = size;
                this.originalColor = color; this.vibrantColor = vibrantColors[Math.floor(Math.random() * vibrantColors.length)]; this.color = this.originalColor;
            }
            draw() {
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                this.color = isMouseMoving ? this.vibrantColor : this.originalColor;
                ctx.fillStyle = this.color; ctx.fill();
            }
            update() {
                if (this.x > canvas.width || this.x < 0) { this.directionX = -this.directionX; }
                if (this.y > canvas.height || this.y < 0) { this.directionY = -this.directionY; }
                this.x += this.directionX; this.y += this.directionY; this.draw();
            }
        }
        function init() {
            particlesArray = [];
            for (let i = 0; i < particleCount; i++) {
                let size = Math.random() * 2 + 1;
                let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * .4) - .2; let directionY = (Math.random() * .4) - .2;
                let color = getComputedStyle(document.documentElement).getPropertyValue('--particle-color').trim() || '#777777';
                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }
        function connect() {
            let opacityValue = 1;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let distance = ((particlesArray[a].x - particlesArray[b].x) ** 2) + ((particlesArray[a].y - particlesArray[b].y) ** 2);
                    if (distance < (maxDistance ** 2)) {
                        opacityValue = 1 - (distance / (maxDistance ** 2));
                        ctx.strokeStyle = `rgba(150, 150, 150, ${opacityValue})`; 
                        ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y); ctx.stroke();
                    }
                }
            }
        }
        function animate() {
            requestAnimationFrame(animate); ctx.clearRect(0, 0, innerWidth, innerHeight);
            for (let i = 0; i < particlesArray.length; i++) { particlesArray[i].update(); }
            connect();
        }
        window.addEventListener('mousemove', () => { isMouseMoving = true; clearTimeout(mouseMoveTimer); mouseMoveTimer = setTimeout(() => { isMouseMoving = false; }, 100); });
        window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; init(); });
        init(); animate();
    }
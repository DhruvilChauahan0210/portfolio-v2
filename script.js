document.addEventListener('DOMContentLoaded', () => {
    // --- Fluid Custom Cursor ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    // Mouse position
    let mouseX = 0;
    let mouseY = 0;

    // Cursor position (for trailing effect)
    let cursorX = 0;
    let cursorY = 0;

    // Magnetic elements
    const magneticElements = document.querySelectorAll('.btn, .nav-link, .social-icon, .icon-btn');

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Instant movement for dot
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth trailing animation loop
    const animateCursor = () => {
        // Linear interpolation for smooth trailing
        // Increased weight (0.15) for slightly heavier/more fluid feel
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;

        // Calculate velocity
        const deltaX = mouseX - cursorX;
        const deltaY = mouseY - cursorY;
        const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxVelocity = 150; // Cap for deformation
        const scaleValue = Math.min(velocity / maxVelocity, 0.5); // Max deformation 0.5

        // Calculate angle of movement
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

        // Apply transform: translate + rotate + scale (stretch)
        // We scale X (direction of movement) and squeeze Y
        if (!cursorOutline.classList.contains('cursor-hover') && !cursorOutline.classList.contains('cursor-magnetic')) {
            cursorOutline.style.transform = `translate(-50%, -50%) 
                                           translate(${cursorX}px, ${cursorY}px) 
                                           rotate(${angle}deg) 
                                           scale(${1 + scaleValue}, ${1 - scaleValue * 0.5})`;
        } else {
            // Reset transform for hover/magnetic states (handled by CSS mostly, but need position)
            cursorOutline.style.transform = `translate(-50%, -50%) translate(${cursorX}px, ${cursorY}px)`;
            // Note: CSS classes handle size/scale, but we need to keep position updated here
            // Ideally, we should separate position logic from style logic to avoid conflicts
            // For now, we just ensure position is set.
        }

        // Note: The previous implementation set left/top directly. 
        // To use transforms for performance and rotation, we switch to transform.
        // We need to remove left/top from CSS or JS to avoid conflicts if we switch fully.
        // However, to keep it simple with existing CSS transitions, we can just apply rotation/scale 
        // to a child element or use matrix3d. 
        // A simpler approach for "jelly" without breaking existing CSS:
        // Keep left/top for position, use transform for deformation ONLY.

        cursorOutline.style.left = `${cursorX}px`;
        cursorOutline.style.top = `${cursorY}px`;

        if (!cursorOutline.classList.contains('cursor-hover') && !cursorOutline.classList.contains('cursor-magnetic')) {
            cursorOutline.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(${1 + scaleValue}, ${1 - scaleValue * 0.5})`;
        } else {
            cursorOutline.style.transform = `translate(-50%, -50%) scale(1)`;
        }

        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Magnetic Effect & Hover States
    magneticElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.classList.add('cursor-magnetic');
            cursorDot.style.opacity = '0'; // Hide dot when magnetic
        });

        el.addEventListener('mouseleave', () => {
            cursorOutline.classList.remove('cursor-magnetic');
            cursorDot.style.opacity = '1';
        });

        // Optional: True magnetic pull (moves element slightly)
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Pull cursor towards center of element
            mouseX = centerX + (e.clientX - centerX) * 0.5;
            mouseY = centerY + (e.clientY - centerY) * 0.5;
        });
    });

    // Project Card "Merge" Effect
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            cursorOutline.classList.add('cursor-hover');
        });
        card.addEventListener('mouseleave', () => {
            cursorOutline.classList.remove('cursor-hover');
        });
    });

    // Text Hover Effect (Headings & Paragraphs)
    const textElements = document.querySelectorAll('h1, h2, h3, p, li');
    textElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.classList.add('cursor-text');
            cursorDot.style.opacity = '0'; // Hide dot for cleaner look
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.classList.remove('cursor-text');
            cursorDot.style.opacity = '1';
        });
    });

    // Add magnetic effect to project tags only
    const projectTags = document.querySelectorAll('.project-tags span');
    projectTags.forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            cursorOutline.classList.add('cursor-magnetic');
            cursorDot.style.opacity = '0';
        });
        tag.addEventListener('mouseleave', () => {
            cursorOutline.classList.remove('cursor-magnetic');
            cursorDot.style.opacity = '1';
        });
    });

    // Scroll Reveal Animation
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));

    // Smooth Scrolling for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Theme Toggle removed as per request (Dark Mode Only)

    // --- Interactive Particle Background ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let mouse = {
            x: null,
            y: null,
            radius: (canvas.height / 80) * (canvas.width / 80)
        }

        window.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        });

        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.baseX = x; // Store original position
                this.baseY = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = '#64ffda'; // Accent color
                ctx.fill();
            }

            update() {
                // Bounce off edges
                if (this.baseX > canvas.width || this.baseX < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.baseY > canvas.height || this.baseY < 0) {
                    this.directionY = -this.directionY;
                }

                // Update base position
                this.baseX += this.directionX;
                this.baseY += this.directionY;

                // Mouse interaction - gentler repulsion
                if (mouse.x != null && mouse.y != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let maxDistance = mouse.radius;
                    let force = (maxDistance - distance) / maxDistance;

                    if (distance < mouse.radius) {
                        // Repel from mouse with smooth force
                        this.x -= forceDirectionX * force * 5;
                        this.y -= forceDirectionY * force * 5;
                    }
                }

                // Smoothly ease back to base position
                this.x += (this.baseX - this.x) * 0.05;
                this.y += (this.baseY - this.y) * 0.05;

                this.draw();
            }
        }

        function init() {
            particlesArray = [];
            let numberOfParticles = (canvas.height * canvas.width) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2) + 1;
                let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * 2) - 1; // -1 to 1
                let directionY = (Math.random() * 2) - 1;
                let color = '#64ffda';

                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, innerWidth, innerHeight);

            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
        }

        window.addEventListener('resize', () => {
            canvas.width = innerWidth;
            canvas.height = innerHeight;
            mouse.radius = ((canvas.height / 80) * (canvas.height / 80));
            init();
        });

        window.addEventListener('mouseout', () => {
            mouse.x = undefined;
            mouse.y = undefined;
        });

        init();
        animate();
    }

    // --- 3D Tilt Effect for Bento Cards ---
    const cards = document.querySelectorAll('.bento-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * 10; // Max rotation deg
            const rotateY = ((centerX - x) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
});

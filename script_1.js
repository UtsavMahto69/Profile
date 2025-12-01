// FIXED: Changed event listener from 'DOMContentLoaded' to 'load'
// This ensures all assets (images, etc.) are loaded before animations are initialized,
// preventing layout shifts from breaking animation calculations on slower networks.
window.addEventListener('load', () => {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorFollower = document.querySelector('.cursor-follower');
    const magneticItems = document.querySelectorAll('.magnetic-item');
    const logo = document.getElementById('logo');
    const pageTransition = document.querySelector('.page-transition');
    
    // --- ADDED: Smooth scroll behavior ---
    document.documentElement.style.scrollBehavior = 'smooth';

    // This function gets the current time and updates the clock
    function updateClock() {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const timeString = new Intl.DateTimeFormat('en-US', options).format(now) + ' IST';

      const clockEl = document.getElementById('clock');
      // Set the text inside the #clock div to our formatted time
      if(clockEl) {
          clockEl.textContent = timeString;
      }
    }

    // Call updateClock every 1000 milliseconds (1 second)
    setInterval(updateClock, 1000);
    // Run it once right away so it shows instantly on page load
    updateClock();

    // Only run cursor animations on devices that support hover
    if (window.matchMedia("(pointer: fine)").matches) {
        let followerX = 0, followerY = 0;
        let dotX = 0, dotY = 0;
        const speed = 0.2;
        function animateCursor() {
            followerX += (dotX - followerX) * speed;
            followerY += (dotY - followerY) * speed;
            cursorFollower.style.transform = `translate(-50%, -50%) translate3d(${followerX}px, ${followerY}px, 0)`;
            cursorDot.style.transform = `translate(-50%, -50%) translate3d(${dotX}px, ${dotY}px, 0)`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        window.addEventListener('mousemove', (e) => {
            dotX = e.clientX;
            dotY = e.clientY;
        });

        magneticItems.forEach(item => {
            const strength = 40;
            item.addEventListener('mouseenter', () => {
                cursorFollower.style.width = '30px';
                cursorFollower.style.height = '30px';
                cursorFollower.style.backgroundColor = 'rgba(239, 68, 68, 0.7)';
            });
            item.addEventListener('mousemove', (e) => {
                const rect = item.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                item.style.transform = `translate3d(${x / rect.width * strength}px, ${y / rect.height * strength}px, 0)`;
            });
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translate3d(0,0,0)';
                cursorFollower.style.width = '20px';
                cursorFollower.style.height = '20px';
                cursorFollower.style.backgroundColor = 'rgba(255, 32, 0, 1)';
            });
        });
    }

    logo.addEventListener('click', (e) => {
        e.preventDefault();
        pageTransition.classList.add('active');
        setTimeout(() => {
            pageTransition.classList.remove('active');
        }, 2000);
    });

    CustomEase.create("customEase", "0.65, 0.05, 0, 1");
    document.querySelectorAll('[data-split="letters"]').forEach(el => {
        const split = new SplitText(el, { type: "chars" });
        const button = el.closest(".button");
        const tl = gsap.timeline({ paused: true });
        tl.to(split.chars, {
            y: "-1.25em", duration: 0.735, stagger: 0.00666667, ease: "customEase"
        });
        button.addEventListener("mouseenter", () => tl.play());
        button.addEventListener("mouseleave", () => tl.reverse());
    });
    
    // --- ADDED: SCRIPT FOR DIRECTIONAL FILL BUTTON ---
    const fillButton = document.querySelector('.fill-button');
    if (fillButton) {
        const setFillPosition = (e) => {
            const rect = fillButton.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            fillButton.style.setProperty('--x', `${x}px`);
            fillButton.style.setProperty('--y', `${y}px`);
        };
        fillButton.addEventListener('mouseenter', setFillPosition);
        fillButton.addEventListener('mousemove', setFillPosition);
    }

    //  --- UPDATED: SCRIPT FOR EYE ANIMATION --- 
    const eyeContainer = document.getElementById('eye-container');
    if (eyeContainer) {
        const pupil = document.getElementById('pupil');
        const eyeSvg = document.getElementById('eye-svg');

        // Pupil follows the cursor across the entire page
        window.addEventListener('mousemove', (e) => {
            // Get the position and size of the SVG element
            const rect = eyeSvg.getBoundingClientRect();
            // Calculate the center of the eye
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Get the mouse coordinates
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Calculate the angle between the eye's center and the mouse
            const deltaX = mouseX - centerX;
            const deltaY = mouseY - centerY;
            const angle = Math.atan2(deltaY, deltaX);

            // Set the maximum distance the pupil can move from the center
            const maxViewBoxRadius = 3; 

            // Calculate the new position for the pupil
            const pupilX = maxViewBoxRadius * Math.cos(angle);
            const pupilY = maxViewBoxRadius * Math.sin(angle);
            
            // Animate the pupil to the new position using GSAP
            gsap.to(pupil, {
                attr: {
                    cx: 12 + pupilX,
                    cy: 12 + pupilY
                },
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        // Function to create a blink animation
        function blink() {
            gsap.to(eyeSvg, {
                scaleY: 0.1, // Squeeze the eye vertically
                repeat: 1,
                yoyo: true, // Animates back to the original state
                duration: 0.08,
                ease: 'power1.inOut',
                transformOrigin: 'center'
            });
        }

        // Function to schedule blinks at random intervals
        function scheduleBlink() {
            // Set a random delay between 3 and 5 seconds
            const randomDelay = Math.random() * 2000 + 3000; 
            setTimeout(() => {
                blink();
                scheduleBlink(); // Schedule the next blink to create a loop
            }, randomDelay);
        }

        scheduleBlink(); // Start the blinking loop
    }
    
    // --- ADDED: SCRIPT FOR VIDEO PLAYBACK DEBUGGING ---
    const video = document.querySelector('video');
    if (video) {
        video.play().catch(error => {
            console.error("Video playback failed. This could be due to browser restrictions or an unsupported file format.", error);
            const videoContainer = video.parentElement;
            if (videoContainer && !videoContainer.querySelector('.video-error-message')) {
                const errorMessage = document.createElement('p');
                errorMessage.textContent = 'Video could not be played.';
                errorMessage.className = 'video-error-message text-red-500 text-center mt-2';
                videoContainer.appendChild(errorMessage);
            }
        });
    }

    // --- ADDED: SCROLL-BASED ACTIVE LINK for Shortcut Station ---
    const sections = document.querySelectorAll('.main-section');
    const navLinks = document.querySelectorAll('#shortcut-nav a');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5 
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('active-link');
                    if (link.getAttribute('href').substring(1) === entry.target.id) {
                        link.classList.add('active-link');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // --- MODIFIED: SCROLLING TEXT ANIMATION for multiple sections ---
    gsap.utils.toArray('.scrolling-text').forEach(section => {
        // MODIFIED: Select all direct children (h4 and img) of the rail
        const scrollingText = section.querySelectorAll('.rail > *');

        const tl_scroll = horizontalLoop(scrollingText, {
            repeat: -1,
        });

        let speedTween;

        ScrollTrigger.create({
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
                if (speedTween) speedTween.kill();

                speedTween = gsap.timeline()
                    .to(tl_scroll, {
                        timeScale: 3 * self.direction,
                        duration: 0.25
                    })
                    .to(tl_scroll, {
                        timeScale: 1 * self.direction,
                        duration: 1.5
                    }, "+=0.5")
            },
            markers: false
        });
    });

    function horizontalLoop(items, config) {
        items = gsap.utils.toArray(items);
        config = config || {};
        let tl = gsap.timeline({
            repeat: config.repeat,
            paused: config.paused,
            defaults: {ease: "none"},
            onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)
        });
        let length = items.length,
            startX = items[0].offsetLeft,
            times = [],
            widths = [],
            xPercents = [],
            curIndex = 0,
            pixelsPerSecond = (config.speed || 1) * 100,
            snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1),
            totalWidth, curX, distanceToStart, distanceToLoop, item, i;
        gsap.set(items, {
            xPercent: (i, el) => {
                let w = widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
                xPercents[i] = snap(parseFloat(gsap.getProperty(el, "x", "px")) / w * 100 + gsap.getProperty(el, "xPercent"));
                return xPercents[i];
            }
        });
        gsap.set(items, {x: 0});
        totalWidth = items[length - 1].offsetLeft + xPercents[length - 1] / 100 * widths[length - 1] - startX + items[length - 1].offsetWidth * gsap.getProperty(items[length - 1], "scaleX") + (parseFloat(config.paddingRight) || 0);
        for (i = 0; i < length; i++) {
            item = items[i];
            curX = xPercents[i] / 100 * widths[i];
            distanceToStart = item.offsetLeft + curX - startX;
            distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
            tl.to(item, {xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond}, 0)
              .fromTo(item, {xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100)}, {xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond, immediateRender: false}, distanceToLoop / pixelsPerSecond)
              .add("label" + i, distanceToStart / pixelsPerSecond);
            times[i] = distanceToStart / pixelsPerSecond;
        }
        function toIndex(index, vars) {
            vars = vars || {};
            if (Math.abs(index - curIndex) > length / 2) {
                index += index > curIndex ? -length : length;
            }
            let newIndex = gsap.utils.wrap(0, length, index),
                time = times[newIndex];
            if ((time > tl.time()) !== (index > curIndex)) {
                vars.modifiers = {time: gsap.utils.wrap(0, tl.duration())};
                time += tl.duration() * (index > curIndex ? 1 : -1);
            }
            curIndex = newIndex;
            vars.overwrite = true;
            return tl.tweenTo(time, vars);
        }
        tl.next = vars => toIndex(curIndex + 1, vars);
        tl.previous = vars => toIndex(curIndex - 1, vars);
        tl.current = () => curIndex;
        tl.toIndex = (index, vars) => toIndex(index, vars);
        tl.times = times;
        tl.progress(1, true).progress(0, true);
        if (config.reversed) {
            tl.vars.onReverseComplete();
            tl.reverse();
        }
        return tl;
    }

    // --- ADDED: RESIZE LISTENER ---
    // This ensures elements like the scrolling text recalculate their positions
    // when the window is resized (e.g., rotating a phone).
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 200);
    });

    // Refresh ScrollTrigger to recalculate positions after everything is loaded
    ScrollTrigger.refresh();

    document.addEventListener('contextmenu', e => e.preventDefault());
});

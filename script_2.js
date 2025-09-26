        window.addEventListener('load', () => {
            const cursorDot = document.querySelector('.cursor-dot');
            const cursorFollower = document.querySelector('.cursor-follower');
            const magneticItems = document.querySelectorAll('.magnetic-item');
            const logo = document.getElementById('logo');
            const pageTransition = document.querySelector('.page-transition');
            
            document.documentElement.style.scrollBehavior = 'smooth';

            // --- REAL-TIME CLOCK SCRIPT ---
            function updateClock() {
                const clockEl = document.getElementById('clock');
                if (clockEl) {
                    // Current date in UTC
                    const now_utc = new Date();
                    // Convert to IST (UTC+5:30)
                    const now_ist = new Date(now_utc.getTime() + (5.5 * 60 * 60 * 1000));

                    let hours = now_ist.getUTCHours();
                    const minutes = now_ist.getUTCMinutes();
                    const seconds = now_ist.getUTCSeconds();
                    
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12;
                    
                    const padded = (n) => (n < 10 ? '0' + n : n);
                    
                    const timeString = `${padded(hours)}:${padded(minutes)}:${padded(seconds)} ${ampm}`;
                    
                    clockEl.textContent = `${timeString} IST`;
                }
            }
            updateClock();
            setInterval(updateClock, 1000);
            // --- END REAL-TIME CLOCK SCRIPT ---

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

            if (logo) {
                logo.addEventListener('click', (e) => {
                    e.preventDefault();
                    pageTransition.classList.add('active');
                    setTimeout(() => {
                        pageTransition.classList.remove('active');
                    }, 2000);
                });
            }

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

            const eyeContainer = document.getElementById('eye-container');
            if (eyeContainer) {
                const pupil = document.getElementById('pupil');
                const eyeSvg = document.getElementById('eye-svg');
                window.addEventListener('mousemove', (e) => {
                    const rect = eyeSvg.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const mouseX = e.clientX;
                    const mouseY = e.clientY;
                    const deltaX = mouseX - centerX;
                    const deltaY = mouseY - centerY;
                    const angle = Math.atan2(deltaY, deltaX);
                    const maxViewBoxRadius = 3; 
                    const pupilX = maxViewBoxRadius * Math.cos(angle);
                    const pupilY = maxViewBoxRadius * Math.sin(angle);
                    
                    gsap.to(pupil, {
                        attr: {
                            cx: 12 + pupilX,
                            cy: 12 + pupilY
                        },
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                });
                
                function blink() {
                    gsap.to(eyeSvg, {
                        scaleY: 0.1,
                        repeat: 1,
                        yoyo: true,
                        duration: 0.08,
                        ease: 'power1.inOut',
                        transformOrigin: 'center'
                    });
                }

                function scheduleBlink() {
                    const randomDelay = Math.random() * 2000 + 3000; 
                    setTimeout(() => {
                        blink();
                        scheduleBlink();
                    }, randomDelay);
                }
                scheduleBlink();
            }
            
            const video = document.querySelector('video');
            if (video) {
                video.play().catch(error => {
                    console.error("Video playback failed.", error);
                    const videoContainer = video.parentElement;
                    if (videoContainer && !videoContainer.querySelector('.video-error-message')) {
                        const errorMessage = document.createElement('p');
                        errorMessage.textContent = 'Video could not be played.';
                        errorMessage.className = 'video-error-message text-red-500 text-center mt-2';
                        videoContainer.appendChild(errorMessage);
                    }
                });
            }

            const sections = document.querySelectorAll('.main-section');
            const navLinks = document.querySelectorAll('#shortcut-nav a');
            if (navLinks.length > 0) {
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
            }

            // --- INFINITE SLIDER SCRIPT ---
            let tickerFn; 
            let scrollTimeout;

            function initSlider() {
                const sliderContainer = document.querySelector('.slider-container');
                if (!sliderContainer) return;

                const slider = document.querySelector('#slider');
                let isMouseOverSlider = false;
                
                sliderContainer.addEventListener('mouseenter', () => { isMouseOverSlider = true; });
                sliderContainer.addEventListener('mouseleave', () => { isMouseOverSlider = false; });

                const originalItems = Array.from(slider.children);
                if (originalItems.length === 0) return;

                slider.innerHTML = '';
                originalItems.forEach(item => slider.appendChild(item));

                const itemStyle = getComputedStyle(originalItems[0]);
                const itemWidth = originalItems[0].offsetWidth + parseFloat(itemStyle.marginRight);
                const fullSetWidth = originalItems.length * itemWidth;
                const cloneCount = 4;
                for (let i = 0; i < cloneCount; i++) {
                    originalItems.forEach(item => {
                        const clone = item.cloneNode(true);
                        slider.appendChild(clone);
                    });
                }

                // Re-select all items after cloning
                const allSliderItems = document.querySelectorAll(".slider-item");

                const setX = gsap.quickSetter(slider, "x", "px");
                let target = 0;
                let current = 0;
                const lerp = (a, b, n) => a + (b - a) * n;
                const sensitivity = 1;
                const easeFactor = 0.05;
                const autoScrollSpeed = 0.5;
                let lastInteractionTime = Date.now();
                setX(0);

                window.addEventListener('wheel', (e) => {
                    if (isMouseOverSlider) {
                        e.preventDefault();
                        target += e.deltaY * sensitivity;
                        lastInteractionTime = Date.now();

                        gsap.to(allSliderItems, { scale: 0.9, duration: 0.5, ease: "power2.out" });
                        clearTimeout(scrollTimeout);
                        scrollTimeout = setTimeout(() => {
                            gsap.to(allSliderItems, { scale: 1, duration: 0.5, ease: "power2.out" });
                        }, 150);
                    }
                }, { passive: false });
                
                if (tickerFn) gsap.ticker.remove(tickerFn);
                tickerFn = () => {
                    if (Date.now() - lastInteractionTime > 1500) {
                        target += autoScrollSpeed;
                    }
                    current = lerp(current, target, easeFactor);
                    let mod = current % fullSetWidth;
                    if (mod < 0) mod += fullSetWidth;
                    setX(-mod);
                };
                gsap.ticker.add(tickerFn);
            }
            initSlider();
            // --- END SLIDER SCRIPT ---


            gsap.utils.toArray('.scrolling-text').forEach(section => {
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

            ScrollTrigger.refresh();

            document.addEventListener('contextmenu', e => e.preventDefault());
        });
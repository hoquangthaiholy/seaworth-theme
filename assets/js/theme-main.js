/**
 * Seaworth Theme Frontend Interactive & Animation Suite
 * Extracted directly from static index.html prototype
 *
 * @package Seaworth
 */

(function() {
    'use strict';

    // Prevent executing frontend animation loops inside WordPress admin or block editor
    if (document.body.classList.contains('wp-admin') || 
        document.body.classList.contains('block-editor-page') || 
        document.querySelector('.editor-styles-wrapper')) {
        return;
    }

// --- Module 3 ---
(function() {
            const loader = document.getElementById('siteLoader');
            if (!loader) return;
            const MIN_DISPLAY = 1500; // 最短顯示時間，避免快取時一閃而過，看不清楚內容
            const shownAt = performance.now();

            // Safety timeout: ensure preloader dismisses within max 3500ms even if external resources lag
            const maxTimer = setTimeout(hide, 3500);

            function hide() {
                clearTimeout(maxTimer);
                const wait = Math.max(0, MIN_DISPLAY - (performance.now() - shownAt));
                setTimeout(() => {
                    loader.classList.add('is-hidden');
                    window.dispatchEvent(new Event('siteLoaderHidden'));
                    setTimeout(() => {
                        loader.remove();
                    }, 900);
                }, wait);
            }

            if (document.readyState === 'complete') {
                hide();
            } else {
                window.addEventListener('load', hide);
            }
        })();

// --- Module 4 ---
(function() {
            const header = document.querySelector('.blanz-header');
            if (!header) return;
            function setHeaderHeight() {
                if (document.body.classList.contains('nav-open')) return;
                const inner = header.querySelector('.blanz-nav-inner');
                const h = inner ? inner.offsetHeight : header.offsetHeight;
                document.documentElement.style.setProperty('--header-h', h + 'px');
            }
            setHeaderHeight();
            window.addEventListener('resize', setHeaderHeight);
        })();

// --- Module 5 ---
(function() {
            const hamburger = document.getElementById('navHamburger');
            const panel = document.getElementById('navMobilePanel');
            if (!hamburger || !panel) return;

            function closeMenu() {
                document.body.classList.remove('nav-open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
            function toggleMenu() {
                const isOpen = document.body.classList.toggle('nav-open');
                hamburger.setAttribute('aria-expanded', String(isOpen));
                if (isOpen && window.lucide) {
                    window.lucide.createIcons();
                }
            }

            hamburger.addEventListener('click', toggleMenu);

            panel.addEventListener('click', (e) => {
                const head = e.target.closest('.nav-mobile-group-head');
                if (head) {
                    head.closest('.nav-mobile-group').classList.toggle('is-open');
                    return;
                }
                const link = e.target.closest('a');
                if (link) {
                    closeMenu();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeMenu();
            });

            // 螢幕放大回桌機版時，確保選單面板與漢堡狀態重置乾淨
            window.addEventListener('resize', () => {
                if (window.innerWidth > 1024) closeMenu();
            });
        })();

// --- Module 6 ---
lucide.createIcons();

        function handleFormSubmit(e) {
            e.preventDefault();

            const serviceInput = document.getElementById('serviceSelect');
            if (serviceInput && !serviceInput.value) {
                document.getElementById('serviceSelectTrigger').focus();
                return;
            }

            const toast = document.getElementById('blanzToast');
            toast.style.display = 'flex';

            document.getElementById('blanzContactForm').reset();

            setTimeout(() => {
                toast.style.display = 'none';
            }, 4500);
        }

// --- Module 7 ---
(function() {
            const wrap = document.getElementById('serviceSelectCustom');
            if (!wrap) return;
            const trigger = document.getElementById('serviceSelectTrigger');
            const valueEl = trigger.querySelector('.custom-select-value');
            const list = wrap.querySelector('.custom-select-list');
            const items = Array.from(list.querySelectorAll('li'));
            const hiddenInput = document.getElementById('serviceSelect');
            const placeholderText = valueEl.textContent;

            function close() {
                wrap.classList.remove('is-open');
                trigger.setAttribute('aria-expanded', 'false');
            }
            function open() {
                wrap.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
            }

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                wrap.classList.contains('is-open') ? close() : open();
            });

            items.forEach(item => {
                item.addEventListener('click', () => {
                    items.forEach(i => i.classList.remove('is-active'));
                    item.classList.add('is-active');
                    hiddenInput.value = item.getAttribute('data-value');
                    valueEl.textContent = item.textContent;
                    valueEl.classList.remove('is-placeholder');
                    close();
                });
            });

            document.addEventListener('click', (e) => {
                if (!wrap.contains(e.target)) close();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') close();
            });

            // 表單重置時，把自訂下拉的顯示狀態也還原成預設提示文字
            const form = document.getElementById('blanzContactForm');
            if (form) {
                form.addEventListener('reset', () => {
                    items.forEach(i => i.classList.remove('is-active'));
                    valueEl.textContent = placeholderText;
                    valueEl.classList.add('is-placeholder');
                    close();
                });
            }
        })();

// --- Module 8 ---
(function() {
            const aboutTitle = document.querySelector('.about-hero-title');
            if (!aboutTitle) return;

            const START_OFFSET = -90; // px，初始往上偏移的距離

            function updateAboutTitle() {
                if (window.innerWidth <= 1024) {
                    aboutTitle.style.transform = '';
                    return;
                }
                const rect = aboutTitle.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    // 進度：從標題進入視窗底部（0）到完全離開視窗頂部（1），拉長距離讓位移更明顯
                    const progress = Math.min(1, Math.max(0,
                        (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
                    ));
                    aboutTitle.style.transform = `translateY(${START_OFFSET * (1 - progress)}px)`;
                }
            }

            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        updateAboutTitle();
                        ticking = false;
                    });
                    ticking = true;
                }
            });
            updateAboutTitle();
        })();

// --- Module 9 ---
// 圖片視差滾動效果 (Parallax Scrolling)
        (function() {
            const parallaxImages = document.querySelectorAll('.card-img-wrapper img, .about-hero-banner img');
            
            function animateParallax() {
                parallaxImages.forEach(img => {
                    const wrapper = img.parentElement;
                    const rect = wrapper.getBoundingClientRect();
                    // 確保元素在畫面內才進行運算
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        // 計算滾動進度：0代表剛進入畫面底部，1代表即將離開畫面頂部
                        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                        
                        // 擴大位移範圍，從 -30% 到 0%，讓滾動效果非常明顯
                        const translateY = -30 + (progress * 30); 
                        img.style.transform = `translateY(${translateY}%)`;
                    }
                });
            }
            
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        animateParallax();
                        ticking = false;
                    });
                    ticking = true;
                }
            });
            // 初始化呼叫一次，確保初始位置正確
            animateParallax();
        })();

        // Hero 幻燈片 Morph 轉場（WebGL 位移融化效果，仿 reactbits MorphSlider intensity=0.3）
        (function() {
            const wrapper = document.querySelector('.hero-bg-wrapper');
            const canvas = document.getElementById('heroMorphCanvas');
            if (!wrapper || !canvas) return;

            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return; // 不支援 WebGL 時，交回原本的 CSS 淡入淡出效果

            const VERT_SRC = `
                attribute vec2 aPos;
                varying vec2 vUv;
                void main() {
                    vUv = aPos * 0.5 + 0.5;
                    gl_Position = vec4(aPos, 0.0, 1.0);
                }
            `;
            const FRAG_SRC = `
                precision highp float;
                uniform sampler2D uTexA;
                uniform sampler2D uTexB;
                uniform float uProgress;
                uniform float uIntensity;
                uniform float uScale;
                uniform float uTime;
                uniform vec2 uResolution;
                uniform vec2 uTexASize;
                uniform vec2 uTexBSize;
                varying vec2 vUv;

                float hash21(vec2 p) {
                    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
                    p3 += dot(p3, p3.yzx + 33.33);
                    return fract((p3.x + p3.y) * p3.z);
                }
                float noise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    float a = hash21(i);
                    float b = hash21(i + vec2(1.0, 0.0));
                    float c = hash21(i + vec2(0.0, 1.0));
                    float d = hash21(i + vec2(1.0, 1.0));
                    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
                }
                float fbm(vec2 p) {
                    float v = 0.0;
                    float a = 0.5;
                    for (int i = 0; i < 5; i++) {
                        v += a * noise(p);
                        p *= 2.0;
                        a *= 0.5;
                    }
                    return v;
                }
                vec2 coverUv(vec2 uv, vec2 res, vec2 texSize) {
                    float rA = res.x / max(res.y, 1.0);
                    float iA = texSize.x / max(texSize.y, 1.0);
                    vec2 s = vec2(1.0);
                    float ratio = rA / max(iA, 0.0001);
                    if (ratio > 1.0) { s.y = 1.0 / ratio; } else { s.x = ratio; }
                    return (uv - 0.5) * s + 0.5;
                }

                void main() {
                    float p = clamp(uProgress, 0.0, 1.0);
                    // 對應 .hero-bg-img 的 CSS transform: scale(1.02) 基準縮放，
                    // 否則轉場結束、畫面交還給真正的 <img> 時會突然放大 2% 產生一下顫動
                    vec2 uv = (vUv - 0.5) / 1.02 + 0.5;

                    // 仿 reactbits MorphSlider 的 melt 轉場：以 fbm 噪聲做局部位移融化，
                    // 邊界由噪聲值與進度共同決定，而非單純直線擦除
                    float nn = fbm(uv * uScale + uTime * 0.03);
                    float warp = fbm(uv * uScale * 1.7 - uTime * 0.02);
                    vec2 g = vec2(nn, warp) - 0.5;
                    vec2 uvA = uv + g * uIntensity * 0.5 * p;
                    vec2 uvB = uv - g * uIntensity * 0.5 * (1.0 - p);
                    float m = smoothstep(nn - 0.15, nn + 0.15, p);

                    vec2 sA = coverUv(uvA, uResolution, uTexASize);
                    vec2 sB = coverUv(uvB, uResolution, uTexBSize);

                    vec4 colA = texture2D(uTexA, clamp(sA, 0.001, 0.999));
                    vec4 colB = texture2D(uTexB, clamp(sB, 0.001, 0.999));
                    vec3 outColor = mix(colA.rgb, colB.rgb, m);
                    gl_FragColor = vec4(outColor, 1.0);
                }
            `;

            function compileShader(type, src) {
                const s = gl.createShader(type);
                gl.shaderSource(s, src);
                gl.compileShader(s);
                if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                    console.warn('Hero morph shader error:', gl.getShaderInfoLog(s));
                }
                return s;
            }

            const program = gl.createProgram();
            gl.attachShader(program, compileShader(gl.VERTEX_SHADER, VERT_SRC));
            gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, FRAG_SRC));
            gl.linkProgram(program);
            gl.useProgram(program);

            const quadBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
            const aPos = gl.getAttribLocation(program, 'aPos');
            gl.enableVertexAttribArray(aPos);
            gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

            const uTexA = gl.getUniformLocation(program, 'uTexA');
            const uTexB = gl.getUniformLocation(program, 'uTexB');
            const uProgress = gl.getUniformLocation(program, 'uProgress');
            const uIntensity = gl.getUniformLocation(program, 'uIntensity');
            const uScale = gl.getUniformLocation(program, 'uScale');
            const uTime = gl.getUniformLocation(program, 'uTime');
            const uResolution = gl.getUniformLocation(program, 'uResolution');
            const uTexASize = gl.getUniformLocation(program, 'uTexASize');
            const uTexBSize = gl.getUniformLocation(program, 'uTexBSize');

            function createTexture() {
                const tex = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                return tex;
            }

            // 把來源圖片先縮小畫到離屏 canvas 上限制最長邊，避免把動輒 5000px+ 的原圖整張上傳給顯卡
            const MAX_TEX_DIM = 1920;
            const scratchCanvas = document.createElement('canvas');
            const scratchCtx = scratchCanvas.getContext('2d');
            function downscaleForTexture(img) {
                const w = img.naturalWidth || img.width;
                const h = img.naturalHeight || img.height;
                const scale = Math.min(1, MAX_TEX_DIM / Math.max(w, h));
                const tw = Math.max(1, Math.round(w * scale));
                const th = Math.max(1, Math.round(h * scale));
                scratchCanvas.width = tw;
                scratchCanvas.height = th;
                scratchCtx.drawImage(img, 0, 0, tw, th);
                return { source: scratchCanvas, width: tw, height: th };
            }

            // 貼圖快取：同一張圖只上傳一次 GPU，換頁時直接重複使用，避免每次轉場都重新上傳造成卡頓
            const textureCache = new Map();
            function getTexture(img) {
                const srcKey = img.currentSrc || img.src;
                const cached = textureCache.get(srcKey);
                if (cached) return cached;
                const { source, width, height } = downscaleForTexture(img);
                const tex = createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
                const entry = { tex, width, height };
                textureCache.set(srcKey, entry);
                return entry;
            }

            function resize() {
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                canvas.width = Math.round(wrapper.clientWidth * dpr);
                canvas.height = Math.round(wrapper.clientHeight * dpr);
                gl.viewport(0, 0, canvas.width, canvas.height);
            }
            window.addEventListener('resize', resize);
            resize();

            // 預先把所有幻燈片圖片上傳成貼圖（分散到閒置時間執行），第一次真正切換時就不用再等上傳
            const allSlideImgs = document.querySelectorAll('.hero-bg-img');
            function prewarm(i) {
                if (i >= allSlideImgs.length) return;
                const img = allSlideImgs[i];
                const go = () => {
                    if (img.complete) { try { getTexture(img); } catch (e) {} }
                    prewarm(i + 1);
                };
                if (img.complete) go();
                else img.addEventListener('load', go, { once: true });
            }
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => prewarm(0));
            } else {
                setTimeout(() => prewarm(0), 300);
            }

            const INTENSITY = 0.3;
            const SCALE = 2.4;
            let animating = false;
            let rafId = null;

            function easeInOutQuad(t) {
                // 對應 gsap 的 power2.inOut
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            }

            function runMorph(fromImg, toImg, duration, onDone) {
                if (animating) return;
                if (!fromImg.complete || !toImg.complete) { onDone(); return; }
                animating = true;
                canvas.classList.add('active');

                let a, b;
                try {
                    a = getTexture(fromImg);
                    b = getTexture(toImg);

                    gl.useProgram(program);
                    gl.uniform1i(uTexA, 0);
                    gl.uniform1i(uTexB, 1);
                    gl.uniform1f(uIntensity, INTENSITY);
                    gl.uniform1f(uScale, SCALE);
                    gl.uniform2f(uResolution, canvas.width, canvas.height);
                    gl.uniform2f(uTexASize, a.width, a.height);
                    gl.uniform2f(uTexBSize, b.width, b.height);
                } catch (err) {
                    // 本機以 file:// 開啟時，部分瀏覽器會擋跨源畫布讀取（tainted canvas）
                    console.warn('Hero morph disabled (WebGL texture upload failed):', err);
                    animating = false;
                    canvas.classList.remove('active');
                    delete window.heroMorphTransition;
                    onDone();
                    return;
                }

                const start = performance.now();
                function frame(now) {
                    const elapsed = now - start;
                    const t = Math.min(1, elapsed / duration);
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, a.tex);
                    gl.activeTexture(gl.TEXTURE1);
                    gl.bindTexture(gl.TEXTURE_2D, b.tex);
                    gl.uniform1f(uProgress, easeInOutQuad(t));
                    gl.uniform1f(uTime, elapsed * 0.001);
                    gl.drawArrays(gl.TRIANGLES, 0, 3);

                    if (t < 1) {
                        rafId = requestAnimationFrame(frame);
                    } else {
                        canvas.classList.remove('active');
                        animating = false;
                        rafId = null;
                        onDone();
                    }
                }
                rafId = requestAnimationFrame(frame);
            }

            window.heroMorphTransition = runMorph;
        })();

        // 主視覺 Hero 幻燈片切換腳本
        (function() {
            const bgs = document.querySelectorAll('.hero-bg-img');
            if (bgs.length === 0) return;

            // 確保初始狀態乾淨：僅第 0 張為 active，其餘移除 active 避免重疊動畫
            bgs.forEach((bg, i) => {
                bg.classList.toggle('active', i === 0);
            });

            const dotsContainer = document.querySelector('.hero-slide-dots');
            if (dotsContainer && dotsContainer.children.length !== bgs.length) {
                dotsContainer.innerHTML = '';
                bgs.forEach((_, i) => {
                    const span = document.createElement('span');
                    span.className = 'dot' + (i === 0 ? ' active' : '');
                    span.setAttribute('data-index', i);
                    dotsContainer.appendChild(span);
                });
            }
            const dots = document.querySelectorAll('.hero-slide-dots .dot');
            const navItems = document.querySelectorAll('.slide-nav-item');
            
            let currentIndex = 0;
            let timer = null;

            // 自動切換間隔（含轉場時間）與轉場動畫本身的時長。
            // 放大動畫要在「間隔 - 轉場時間」內跑完，收回原尺寸的時機才會剛好對齊下一次轉場開始的瞬間
            const AUTO_INTERVAL = 5500;
            const TRANSITION_DURATION = 1100;
            const ZOOM_DURATION = AUTO_INTERVAL - TRANSITION_DURATION;

            // 轉場完成後，讓真正的 <img> 狀態瞬間同步（不觸發原本的 CSS 淡入淡出，避免與 WebGL 畫面打架）
            function setActiveImmediate(index) {
                // 只讓 opacity 瞬間切換（避免跟 canvas 交接時重複淡入淡出）；
                // 放大動畫改用 animation（hero-zoom-cycle）驅動，強制 reflow 讓它在新的 active 圖片上重新從頭播放
                bgs.forEach((bg, i) => {
                    bg.style.transition = 'opacity 0s';
                    bg.style.animationDuration = ZOOM_DURATION + 'ms';
                    bg.classList.toggle('active', i === index);
                });
                void bgs[0].offsetWidth; // 強制 reflow，讓 animation 重新觸發
                requestAnimationFrame(() => {
                    bgs.forEach(bg => { bg.style.transition = ''; });
                });
            }

            function goToSlide(index) {
                if (index === currentIndex) { resetTimer(); return; }

                const currentDots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : document.querySelectorAll('.hero-slide-dots .dot');
                currentDots.forEach(dot => dot.classList.remove('active'));
                if (currentDots[index]) currentDots[index].classList.add('active');

                const fromImg = bgs[currentIndex];
                const toImg = bgs[index];
                currentIndex = index;
                resetTimer();

                if (window.heroMorphTransition) {
                    window.heroMorphTransition(fromImg, toImg, TRANSITION_DURATION, () => setActiveImmediate(index));
                } else {
                    setActiveImmediate(index);
                }
            }

            function nextSlide() {
                let next = (currentIndex + 1) % bgs.length;
                goToSlide(next);
            }

            function resetTimer() {
                clearInterval(timer);
                timer = setInterval(nextSlide, AUTO_INTERVAL);
            }

            // 綁定點擊事件（使用事件委派，動態增減 dots 依然精確生效）
            if (dotsContainer) {
                dotsContainer.addEventListener('click', (e) => {
                    const dot = e.target.closest('.dot');
                    if (!dot) return;
                    e.preventDefault();
                    const targetIndex = parseInt(dot.getAttribute('data-index'), 10);
                    if (!isNaN(targetIndex)) goToSlide(targetIndex);
                });
            }
            
            navItems.forEach(nav => {
                nav.addEventListener('click', (e) => {
                    // 只攔截帶有 data-index 的導覽點擊，作為幻燈片切換
                    if (nav.hasAttribute('data-index')) {
                        e.preventDefault();
                        let targetIndex = parseInt(nav.getAttribute('data-index'));
                        if(!isNaN(targetIndex)) goToSlide(targetIndex);
                    }
                });
            });

            // 初始化
            resetTimer();
        })();

        // 右側導覽選單醒目狀態獨立輪播（跟封面背景圖切換速度脫鉤，各自獨立計時）
        (function() {
            const navItems = document.querySelectorAll('.hero-slide-nav .slide-nav-item');
            if (navItems.length === 0) return;

            let navIndex = Array.from(navItems).findIndex(el => el.classList.contains('active-nav'));
            if (navIndex < 0) navIndex = 0;

            setInterval(() => {
                navItems[navIndex].classList.remove('active-nav');
                navIndex = (navIndex + 1) % navItems.length;
                navItems[navIndex].classList.add('active-nav');
            }, 2500);
        })();

        // ===== 全站流暢滾動入場效果 (Scroll Reveal Observer) =====
        (function() {
            // 針對網格/卡片容器自動為子項目加上錯落延遲
            const staggerGrids = document.querySelectorAll('.projects-4-grid, .dark-sectors-row, .staggered-layout, .contact-channels-list');
            staggerGrids.forEach(grid => {
                const items = grid.children;
                for (let i = 0; i < items.length; i++) {
                    if (!items[i].classList.contains('reveal')) {
                        items[i].classList.add('reveal', `delay-${(i % 4) + 1}`);
                    }
                }
            });

            // 選取全站重點大標題、文字與圖表區塊
            const revealSelectors = [
                '.contact-poetic-header',
                '.about-hero-title',
                '.about-hero-desc',
                '.about-hero-banner',
                '.header-block',
                '.ship-img',
                '.overlay-panel',
                '.sector-group',
                '.dark-sectors-intro',
                '.dark-sectors-row .dark-card',
                '.poetic-quote-wrap',
                '.certs-header',
                '.medallion-row',
                '.network-row',
                '.cta-container',
                '.projects-header-top',
                '.project-card-item',
                '.contact-poetic-info',
                '.form-poetic-box',
                '.footer-logo-center',
                '.footer-poetic-statement',
                '.footer-bottom-info'
            ];

            revealSelectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    if (!el.classList.contains('reveal')) {
                        el.classList.add('reveal');
                    }
                });
            });

            // 建立 IntersectionObserver 進行平滑入場監控
            // 等待全站 Loading 畫面淡出後才開始觀察，避免入場動畫在 Loading 遮罩後面就播完，使用者完全看不到
            let revealStarted = false;
            function startRevealObserver() {
                if (revealStarted) return;
                revealStarted = true;
                const observer = new IntersectionObserver((entries, obs) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('in');
                            obs.unobserve(entry.target); // 動畫觸發一次即解綁，節省效能
                        }
                    });
                }, {
                    threshold: 0.05,
                    rootMargin: '0px 0px 0px 0px'
                });

                document.querySelectorAll('.reveal, .reveal-trigger').forEach(el => observer.observe(el));
            }

            // 封面圖入場 (Subpage Hero Entrance Animation)
            let heroRevealed = false;
            function revealHero() {
                if (heroRevealed) return;
                heroRevealed = true;
                document.querySelectorAll('.sp-hero').forEach(el => el.classList.add('is-revealed'));
            }

            if (document.getElementById('siteLoader')) {
                window.addEventListener('siteLoaderHidden', () => {
                    startRevealObserver();
                    revealHero();
                }, { once: true });
                setTimeout(() => {
                    startRevealObserver();
                    revealHero();
                }, 3000); // Fallback: đề phòng loader dismiss nhanh hoặc không bắt được event
            } else {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => {
                        startRevealObserver();
                        revealHero();
                    });
                } else {
                    startRevealObserver();
                    revealHero();
                }
            }
        })();

// --- Module 10 ---
(function() {
            const wrapper = document.getElementById('flagshipScrollWrapper');
            const section = wrapper ? wrapper.querySelector('.flagship-section') : null;
            if (!wrapper || !section) return;

            const assetsBase = (window.seaworthThemeData && window.seaworthThemeData.assetsUrl) || '/wp-content/themes/seaworth/assets';

            // Check if multiple .flagship-grid elements were rendered by repeater in the template
            const renderedGrids = wrapper.querySelectorAll('.flagship-grid');
            let states = [];

            if (renderedGrids.length > 0) {
                renderedGrids.forEach((grid, idx) => {
                    const tag = grid.querySelector('.flagship-tag')?.textContent?.trim() || '';
                    const title = grid.querySelector('h3')?.textContent?.trim() || '';
                    const desc = grid.querySelector('.flagship-desc')?.textContent?.trim() || '';
                    const photoImg = grid.querySelector('.flagship-photo img');
                    const photo = photoImg?.getAttribute('src') || '';
                    const numText = grid.querySelector('.flagship-num')?.textContent?.trim() || '';
                    const label = grid.querySelector('.flagship-num-label')?.innerHTML?.trim() || '';

                    // Parse prefix, number, suffix from numText
                    let numPrefix = '';
                    let numSuffix = '';
                    let numTarget = 0;
                    const numMatch = numText.match(/^([^\d]*)(\d+)([^\d]*)$/);
                    if (numMatch) {
                        numPrefix = numMatch[1] || '';
                        numTarget = parseInt(numMatch[2], 10) || 0;
                        numSuffix = numMatch[3] ? (numMatch[3] === '+' ? '<span class="num-sym">+</span>' : numMatch[3]) : '';
                    }

                    states.push({
                        tag: tag,
                        title: title,
                        desc: desc,
                        photo: photo,
                        numPrefix: numPrefix,
                        numTarget: numTarget,
                        numSuffix: numSuffix,
                        label: label
                    });

                    // Hide duplicate rendered grids (keep first one visible as active display)
                    if (idx > 0) {
                        grid.style.display = 'none';
                    }
                });
            }

            if (states.length === 0) {
                states = [
                    {
                        tag: 'Beyond Limits',
                        title: '遠洋核心戰略',
                        desc: '作業海域橫跨太平洋與大西洋，精準捕撈正鰹、黃鰭鮪、大目鮪、長鰭鮪、魷魚及秋刀魚等全球核心經濟魚種。',
                        photo: assetsBase + '/img-1.png',
                        numPrefix: '',
                        numTarget: 40,
                        numSuffix: '<span class="num-sym">+</span>',
                        label: '年產業深耕經驗<br>源自 1983 年'
                    },
                    {
                        tag: 'Modern Fleet',
                        title: '頂尖合規船隊',
                        desc: '圍網、延繩釣、魷釣秋刀魚與超低溫運搬船，近 40 艘現代化船隊全面符合國際合規標準。',
                        photo: assetsBase + '/news-corporate.png',
                        numPrefix: '~',
                        numTarget: 40,
                        numSuffix: '',
                        label: '艘現代化<br>合規船隊'
                    },
                    {
                        tag: 'Ocean Reach',
                        title: '全球作業海域',
                        desc: '橫跨太平洋與大西洋戰略漁場，精準掌握全球核心經濟魚種漁汛與資源分布。',
                        photo: assetsBase + '/img-3.jpg',
                        numPrefix: '',
                        numTarget: 2,
                        numSuffix: '',
                        label: '大洋<br>戰略作業海域',
                        position: '70% center'
                    },
                    {
                        tag: 'Global Network',
                        title: '跨國營運樞紐',
                        desc: '台灣高雄、韓國釜山、中國舟山、泰國曼谷、巴紐，五大據點構建全球運籌網絡。',
                        photo: assetsBase + '/img-4.png',
                        numPrefix: '',
                        numTarget: 5,
                        numSuffix: '',
                        label: '大跨國<br>營運樞紐'
                    }
                ];
            }

            // 对应 CSS 的 @media (max-width: 1024px)：只有超过这个宽度，
            // .flagship-section 才是 position: sticky（画面真的会黏住），
            // 才需要跑卷动切换卡片的逻辑。
            const desktopStickyQuery = window.matchMedia('(min-width: 1025px)');
            function isDesktopStickyMode() {
                return desktopStickyQuery.matches;
            }

            // Dynamically calculate wrapper height based on number of states (100vh per state)
            if (isDesktopStickyMode() && states.length > 0) {
                wrapper.style.height = (states.length * 100) + 'vh';
            }

            // Sync dots dynamically based on states length
            const dotsContainer = wrapper.querySelector('.flagship-dots');
            if (dotsContainer && states.length > 0) {
                dotsContainer.innerHTML = '';
                for (let d = 0; d < states.length; d++) {
                    const dot = document.createElement('span');
                    dot.className = 'flagship-dot' + (d === 0 ? ' active' : '');
                    dot.setAttribute('data-index', d);
                    dotsContainer.appendChild(dot);
                }
            }

            // 預先載入每一組狀態的圖片，避免滾動切換時卡在讀取空白畫面
            states.forEach(s => {
                if (s.photo) {
                    const preloadImg = new Image();
                    preloadImg.src = s.photo;
                }
            });

            const tagEl = document.getElementById('flagshipTag') || wrapper.querySelector('.flagship-tag');
            const titleEl = document.getElementById('flagshipTitle') || wrapper.querySelector('.flagship-left h3');
            const descEl = document.getElementById('flagshipDesc') || wrapper.querySelector('.flagship-desc');
            const photoEl = document.getElementById('flagshipPhoto') || wrapper.querySelector('.flagship-photo img');
            const numEl = document.getElementById('flagshipNum') || wrapper.querySelector('.flagship-num');
            const labelEl = document.getElementById('flagshipLabel') || wrapper.querySelector('.flagship-num-label');
            const dots = wrapper.querySelectorAll('.flagship-dot');
            const animTargets = [
                wrapper.querySelector('.flagship-left'),
                wrapper.querySelector('.flagship-photo'),
                wrapper.querySelector('.flagship-right')
            ];

            let currentIndex = 0;
            let numRAF = null;

            function animateNum(state, duration) {
                duration = duration || 900;
                if (numRAF) cancelAnimationFrame(numRAF);
                const prefix = state.numPrefix || '';
                const suffix = state.numSuffix || '';
                const target = state.numTarget;
                const start = performance.now();

                function tick(now) {
                    const t = Math.min(1, (now - start) / duration);
                    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
                    const current = Math.round(target * eased);
                    if (numEl) numEl.innerHTML = prefix + current + suffix;
                    if (t < 1) {
                        numRAF = requestAnimationFrame(tick);
                    } else {
                        numRAF = null;
                    }
                }
                numRAF = requestAnimationFrame(tick);
            }

            function applyState(index) {
                if (index === currentIndex) return;
                currentIndex = index;
                const s = states[index];
                if (!s) return;

                if (tagEl) tagEl.textContent = s.tag;
                if (titleEl) titleEl.textContent = s.title;
                if (descEl) descEl.textContent = s.desc;
                if (photoEl) {
                    photoEl.src = s.photo;
                    photoEl.alt = s.title;
                    photoEl.style.objectFit = s.fit || 'cover';
                    photoEl.style.objectPosition = s.position || '';
                }
                animateNum(s);
                if (labelEl) labelEl.innerHTML = s.label;

                const currentDots = wrapper.querySelectorAll('.flagship-dot');
                currentDots.forEach((dot, i) => dot.classList.toggle('active', i === index));

                // 內容已即時更新，這裡只是疊加一個輕巧的進場動畫，不會卡住畫面
                animTargets.forEach(el => {
                    if (!el) return;
                    el.classList.remove('flagship-pop');
                    void el.offsetWidth; // 強制 reflow，讓動畫可以重新觸發
                    el.classList.add('flagship-pop');
                });
                updateArrowState(currentIndex);
            }

            function updateArrowState(idx) {
                const prevBtn = document.getElementById('flagshipArrowPrev') || wrapper.querySelector('#flagshipArrowPrev');
                if (prevBtn) {
                    if (idx === 0) {
                        prevBtn.style.opacity = '0.3';
                        prevBtn.style.pointerEvents = 'none';
                        prevBtn.style.cursor = 'default';
                    } else {
                        prevBtn.style.opacity = '1';
                        prevBtn.style.pointerEvents = 'auto';
                        prevBtn.style.cursor = 'pointer';
                    }
                }
            }

            function onScroll() {
                // 手機/平板（≤1024px）CSS 已把區塊改回一般排版（不黏住），
                // 這裡也要跟著關閉「捲動切換」，改由 dot 點擊切換，避免畫面沒黏住
                // 卻在背景照樣切內容，造成捲動時內容忽然跳動的問題。
                if (!isDesktopStickyMode()) return;
                // 點擊箭頭/圓點後的平滑捲動期間，不要讓中途位置把內容切回去
                if (performance.now() < scrollLockUntil) return;

                const rect = wrapper.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const scrollable = wrapper.offsetHeight - viewportHeight;
                if (scrollable <= 0) return;

                const scrolled = -rect.top;
                const progress = Math.min(1, Math.max(0, scrolled / scrollable));
                let index = Math.floor(progress * states.length);
                if (index >= states.length) index = states.length - 1;
                if (index < 0) index = 0;
                applyState(index);
            }

            let scrollLockUntil = 0;
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        onScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            function goToIndex(i) {
                if (!isDesktopStickyMode()) {
                    // 手機/平板：畫面沒有黏住，直接原地切換卡片內容即可
                    applyState(i);
                    return;
                }
                const viewportHeight = window.innerHeight;
                const scrollable = wrapper.offsetHeight - viewportHeight;
                if (scrollable <= 0) return;
                const targetScroll = wrapper.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) + (scrollable * (i / states.length)) + 10;
                // 立即切換內容（不依賴捲動事件/rAF），再平滑捲到對應位置；捲動期間暫停 onScroll 覆寫
                applyState(i);
                scrollLockUntil = performance.now() + 900;
                window.scrollTo({ top: targetScroll, behavior: 'smooth' });
                setTimeout(onScroll, 950);
            }

            const activeDots = wrapper.querySelectorAll('.flagship-dot');
            activeDots.forEach((dot, i) => {
                dot.addEventListener('click', () => goToIndex(i));
            });

            const prevBtn = document.getElementById('flagshipArrowPrev');
            const nextBtn = document.getElementById('flagshipArrowNext');
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    if (currentIndex > 0) goToIndex(currentIndex - 1);
                });
            }
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    if (currentIndex === states.length - 1) {
                        const scrollY = window.scrollY || window.pageYOffset;
                        window.scrollTo({ top: scrollY + wrapper.getBoundingClientRect().bottom, behavior: 'smooth' });
                    } else {
                        goToIndex(currentIndex + 1);
                    }
                });
            }

            onScroll();
            updateArrowState(currentIndex);

            // 首次滾動進入畫面時，讓初始數字也跑一次入場動畫
            const numEntranceObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateNum(states[0], 1400);
                        obs.disconnect();
                    }
                });
            }, { threshold: 0.4 });
            numEntranceObserver.observe(section);
        })();

// --- Module 11 ---
(function() {
            const certsSection = document.querySelector('.certs-section');
            if (!certsSection) return;

            const bgObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        certsSection.classList.add('bg-shift');
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });

            bgObserver.observe(certsSection);
        })();

// --- Module 12 ---
function initCustomCursor() {
    // 觸控裝置沒有滑鼠，不需要（也不會觸發 mousemove）自訂游標，
    // 建立了反而會停在畫面左上角不動，變成一個卡住的小色塊。
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (document.body && (document.body.classList.contains('wp-admin') || 
        document.body.classList.contains('block-editor-page') || 
        document.querySelector('.editor-styles-wrapper'))) {
        return;
    }

    const root = document.querySelector('body');
    if (!root) return;
    if (document.querySelector('.custom-cursor')) return;

    // Real cursor element
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    root.appendChild(cursor);

    // Following extra cursor element
    const follower = document.createElement('div');
    follower.classList.add('custom-cursor', 'custom-cursor__follower');
    root.appendChild(follower);

    window.addEventListener('mousemove', (e) => {
        setPosition(follower, e);
        setPosition(cursor, e);
    }, { passive: true });

    function setPosition(element, e) {
        element.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    }

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        follower.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        follower.style.opacity = '1';
    });

    root.classList.add('has-custom-cursor');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomCursor);
} else {
    initCustomCursor();
}

// --- Module 14 ---
function initSectorWave() {
    const canvas = document.getElementById('sectorWaveCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let simplex = new SimplexNoise();
    let time = 0;

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    
    window.addEventListener('resize', resize);
    resize();

    function draw() {
        ctx.clearRect(0, 0, width, height);
        
        const linesConfig = [
            { type: 'wave', yRel: 0.032 },
            { type: 'echo', yRel: 0.056 },
            { type: 'wave', yRel: 0.968 },
            { type: 'echo', yRel: 0.944 }
        ];

        const stepX = 5; 
        time += 0.0012; // 減緩波浪流動速度

        for (let i = 0; i < linesConfig.length; i++) {
            let config = linesConfig[i];
            ctx.beginPath();
            
            if (config.type === 'wave') {
                ctx.strokeStyle = 'rgba(14, 18, 23, 0.28)'; // 稍微加深主線
                ctx.lineWidth = 1.2;
                ctx.setLineDash([]);
            } else {
                ctx.strokeStyle = 'rgba(14, 18, 23, 0.2)'; // 顯著加深虛線 (原本 0.1)
                ctx.lineWidth = 1.2; // 稍微加粗虛線 (原本 1)
                ctx.setLineDash([2, 6]); // 調整虛線比例，使其更明顯
            }

            let baseY = height * config.yRel;
            
            for (let x = 0; x <= width; x += stepX) {
                // 增加頻率 (x * 0.002) 讓波浪起伏更密集
                let noiseValue = simplex.noise3D(x * 0.002, i * 0.5, time);
                // 增加振幅 (35) 讓起伏更大 (原本 15)
                let offsetY = noiseValue * 35;
                
                let y = baseY + offsetY;
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }
        
        // Draw independent floating dots
        const dots = [
            { xRel: 0.58, yRel: 0.08, seed: 10 }, 
            { xRel: 0.76, yRel: 0.985, seed: 20 }, // 右邊原點改回線條下方 (yRel 0.985)
            { xRel: 0.15, yRel: 0.92, seed: 30 }  // 左邊原點往下移一點，但仍保持在線條上方 (yRel 0.92)
        ];
        ctx.fillStyle = 'rgba(0, 73, 91, 0.35)'; // 降低不透明度，讓原點呈現半透明質感
        for (let dot of dots) {
            let baseX = width * dot.xRel;
            let baseY = height * dot.yRel;
            
            let floatX = simplex.noise3D(dot.seed, 0, time * 0.8) * 35;
            let floatY = simplex.noise3D(0, dot.seed, time * 0.8) * 35;
            
            let dotX = baseX + floatX;
            let dotY = baseY + floatY;
            
            // 防止原點飄出畫布邊界被裁切
            if (dotY > height - 5) dotY = height - 5;
            if (dotY < 5) dotY = 5;
            
            ctx.beginPath();
            ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        if (isAnimating) {
            rafId = requestAnimationFrame(draw);
        }
    }

    // 只在這個裝飾區塊實際進入畫面時才跑動畫，滾走就暫停，
    // 避免 requestAnimationFrame 在背景無限空轉、白白耗電。
    // 手機版這個 canvas 本身是 display:none（見 CSS），沒有版面盒，
    // IntersectionObserver 永遠回報「不在畫面內」，動畫自然不會啟動。
    let isAnimating = false;
    let rafId = null;
    const lineartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!isAnimating) {
                    isAnimating = true;
                    draw();
                }
            } else {
                isAnimating = false;
                if (rafId) cancelAnimationFrame(rafId);
            }
        });
    }, { threshold: 0 });
    lineartObserver.observe(canvas);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSectorWave);
} else {
    initSectorWave();
}

// --- Module 15 ---
// 導覽下拉選單：點擊觸發項只展開選單，不直接跳轉頁面；子選項維持正常導覽
        (function() {
            const dropdownItems = document.querySelectorAll('.nav-split-menu > li.has-dropdown');
            if (!dropdownItems.length) return;
            dropdownItems.forEach(function(li) {
                const trigger = li.querySelector(':scope > a');
                if (!trigger) return;
                trigger.addEventListener('click', function(e) {
                    e.preventDefault();
                    const isOpen = li.classList.contains('is-open');
                    dropdownItems.forEach(function(other) { other.classList.remove('is-open'); });
                    if (!isOpen) li.classList.add('is-open');
                });
            });
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.nav-split-menu > li.has-dropdown')) {
                    dropdownItems.forEach(function(li) { li.classList.remove('is-open'); });
                }
            });
        })();

        // --- Module 16: Accordion Toggle (Subpages & IR FAQ) ---
        (function() {
            document.querySelectorAll('.sp-accordion-item').forEach(function(item) {
                const head = item.querySelector('.sp-accordion-head');
                if (!head) return;
                head.addEventListener('click', function() {
                    const isOpen = item.classList.contains('is-open');
                    if (isOpen) {
                        item.classList.remove('is-open');
                        head.setAttribute('aria-expanded', 'false');
                    } else {
                        item.classList.add('is-open');
                        head.setAttribute('aria-expanded', 'true');
                    }
                });
            });
        })();

        // --- Module 17: Environment Stage Wave Canvas & Spheres ---
        (function() {
            const canvas = document.getElementById('envWaveCanvas');
            if (canvas && typeof SimplexNoise !== 'undefined') {
                const ctx = canvas.getContext('2d');
                let width, height;
                let simplex = new SimplexNoise();
                let time = 0;

                function resize() {
                    const rect = canvas.parentElement.getBoundingClientRect();
                    width = rect.width;
                    height = rect.height;
                    canvas.width = width * window.devicePixelRatio;
                    canvas.height = height * window.devicePixelRatio;
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                }

                window.addEventListener('resize', resize);
                resize();

                let isAnimating = false;
                let rafId = null;

                function draw() {
                    ctx.clearRect(0, 0, width, height);
                    const linesConfig = [
                        { type: 'wave', yRel: 0.09 },
                        { type: 'echo', yRel: 0.12 },
                        { type: 'wave', yRel: 0.91 },
                        { type: 'echo', yRel: 0.88 }
                    ];
                    const stepX = 5;
                    time += 0.0012;

                    for (let i = 0; i < linesConfig.length; i++) {
                        let config = linesConfig[i];
                        ctx.beginPath();
                        if (config.type === 'wave') {
                            ctx.strokeStyle = 'rgba(14, 18, 23, 0.42)';
                            ctx.lineWidth = 1.4;
                            ctx.setLineDash([]);
                        } else {
                            ctx.strokeStyle = 'rgba(14, 18, 23, 0.32)';
                            ctx.lineWidth = 1.4;
                            ctx.setLineDash([2, 6]);
                        }
                        let baseY = height * config.yRel;
                        for (let x = 0; x <= width; x += stepX) {
                            let noiseValue = simplex.noise3D(x * 0.002, i * 0.5, time);
                            let offsetY = noiseValue * 35;
                            let y = baseY + offsetY;
                            if (x === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        }
                        ctx.stroke();
                    }

                    if (isAnimating) rafId = requestAnimationFrame(draw);
                }

                const lineartObserver = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            if (!isAnimating) { isAnimating = true; draw(); }
                        } else {
                            isAnimating = false;
                            if (rafId) cancelAnimationFrame(rafId);
                        }
                    });
                }, { threshold: 0 });
                lineartObserver.observe(canvas);
            }

            // Sphere interactions
            const sphereCol = document.getElementById('spSpheres');
            const spheres = document.querySelectorAll('.sp-sphere');
            const idle = document.getElementById('spIdle');
            const stack = document.getElementById('spContentStack');

            function getElemIndex(el) {
                if (el.dataset.index !== undefined) return +el.dataset.index;
                if (el.dataset.i !== undefined) return +el.dataset.i;
                return 0;
            }

            function setActive(i) {
                document.querySelectorAll('.sp-sphere').forEach(function(el) { el.classList.toggle('active', getElemIndex(el) === i); });
                document.querySelectorAll('.sp-bg-photo, .sp-eyebrow, .sp-headline, .sp-brand').forEach(function(el) { el.classList.toggle('on', getElemIndex(el) === i); });
                if (idle) idle.classList.add('hide');
                if (stack) stack.classList.add('show');
            }

            function setIdle() {
                document.querySelectorAll('.sp-sphere').forEach(function(el) { el.classList.remove('active'); });
                document.querySelectorAll('.sp-bg-photo').forEach(function(el) { el.classList.remove('on'); });
                if (idle) idle.classList.remove('hide');
                if (stack) stack.classList.remove('show');
            }

            if (spheres.length && sphereCol) {
                spheres.forEach(function(sp) {
                    sp.addEventListener('click', function() { setActive(getElemIndex(sp)); });
                    sp.addEventListener('mouseenter', function() { setActive(getElemIndex(sp)); });
                });
                sphereCol.addEventListener('mouseleave', setIdle);
                document.addEventListener('click', function(e) {
                    if (!sphereCol.contains(e.target)) setIdle();
                });
            }
        })();

        // --- Module 18: Business Map Stats & Lightbox ---
        (function() {
            const row = document.querySelector('.sp-stat-row');
            if (row) {
                const items = Array.from(row.querySelectorAll('.sp-stat-num')).map(function(el) {
                    const suffixEl = el.querySelector('.num-sym');
                    const suffixHTML = suffixEl ? suffixEl.outerHTML : '';
                    const target = parseInt(el.textContent, 10) || 0;
                    el.innerHTML = '0' + suffixHTML;
                    return { el: el, target: target, suffixHTML: suffixHTML };
                });

                function animate(duration) {
                    duration = duration || 1500;
                    const start = performance.now();
                    let lastUpdate = 0;
                    function tick(now) {
                        const t = Math.min(1, (now - start) / duration);
                        if (now - lastUpdate > 50 || t === 1) {
                            items.forEach(function(item) {
                                if (t < 1) {
                                    const maxVal = Math.pow(10, item.target.toString().length);
                                    const randomNum = Math.floor(Math.random() * maxVal);
                                    item.el.innerHTML = randomNum + item.suffixHTML;
                                } else {
                                    item.el.innerHTML = item.target + item.suffixHTML;
                                }
                            });
                            lastUpdate = now;
                        }
                        if (t < 1) requestAnimationFrame(tick);
                    }
                    requestAnimationFrame(tick);
                }

                const obs = new IntersectionObserver(function(entries, observer) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            setTimeout(animate, 300);
                            observer.disconnect();
                        }
                    });
                }, { threshold: 0.1 });
                obs.observe(row);
            }

            // The static page ships the overlay in its markup; the block does not, so build it on demand.
            function ensureLightbox() {
                let overlay = document.getElementById('lightboxOverlay');
                if (overlay) return overlay;
                overlay = document.createElement('div');
                overlay.className = 'lightbox-overlay';
                overlay.id = 'lightboxOverlay';
                overlay.innerHTML = '<span class="lightbox-close">&times;</span><img class="lightbox-content" id="lightboxImg" src="" alt="">';
                overlay.addEventListener('click', function() { window.closeLightbox(); });
                document.body.appendChild(overlay);
                return overlay;
            }
            window.openLightbox = function(src) {
                const overlay = ensureLightbox();
                const img = document.getElementById('lightboxImg');
                if (img) img.src = src;
                overlay.classList.add('is-active');
                document.body.style.overflow = 'hidden';
            };
            window.closeLightbox = function() {
                const overlay = document.getElementById('lightboxOverlay');
                if (overlay) overlay.classList.remove('is-active');
                document.body.style.overflow = '';
            };
            document.addEventListener('click', function(e) {
                const img = e.target.closest && e.target.closest('.wp-block-theme-business-map img[style*="zoom-in"]');
                if (img) window.openLightbox(img.currentSrc || img.src);
            });
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') window.closeLightbox();
            });
        })();

        // --- Module 19: Internal Audit Stats Counter ---
        (function() {
            const row = document.querySelector('.audit-stats-row');
            if (!row) return;
            const items = Array.from(row.querySelectorAll('.audit-stat-value')).map(function(el) {
                const suffixEl = el.querySelector('.num-sym');
                const suffixHTML = suffixEl ? suffixEl.outerHTML : '';
                const target = parseInt(el.textContent, 10) || 0;
                el.innerHTML = '0' + suffixHTML;
                return { el: el, target: target, suffixHTML: suffixHTML };
            });

            function animate(duration) {
                duration = duration || 800;
                const start = performance.now();
                let lastUpdate = 0;
                function tick(now) {
                    const t = Math.min(1, (now - start) / duration);
                    if (now - lastUpdate > 50 || t === 1) {
                        items.forEach(function(item) {
                            if (t < 1) {
                                const maxVal = Math.pow(10, item.target.toString().length);
                                const randomNum = Math.floor(Math.random() * maxVal);
                                item.el.innerHTML = randomNum + item.suffixHTML;
                            } else {
                                item.el.innerHTML = item.target + item.suffixHTML;
                            }
                        });
                        lastUpdate = now;
                    }
                    if (t < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
            }

            const obs = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        setTimeout(animate, 300);
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.1 });
            obs.observe(row);
        })();

// --- About: manifesto photo parallax (from src/js/pages/about.js) ---
(function() {
            var wrap = document.querySelector('.parallax-wrap');
            if (!wrap || !wrap.parentElement) return;
            window.addEventListener('scroll', function() {
                if (window.innerWidth <= 768) return;
                var rect = wrap.parentElement.getBoundingClientRect();
                var windowHeight = window.innerHeight;
                if (rect.top <= windowHeight && rect.bottom >= 0) {
                    // Move the whole image wrapper opposite to the scroll direction
                    var offset = (rect.top + rect.height / 2) - (windowHeight / 2);
                    wrap.style.transform = 'translateY(' + (offset * -0.2) + 'px)';
                }
            }, { passive: true });
        })();

})();

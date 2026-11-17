/**
 * Seaworth Theme - Block Editor Interactive Canvas & Effects
 *
 * Draws the Three Pillars / Sector background wave lines and dots inside the Gutenberg
 * Block Editor (both iframed and non-iframed modes) as a single still frame. The
 * front end animates them; in the editor a continuous requestAnimationFrame loop only
 * distracts from editing and burns CPU, so it is redrawn only on resize.
 *
 * @package Seaworth
 */
(function() {
    'use strict';

    /**
     * Initialize undulating wave canvas animation on a canvas element.
     */
    function initWaveCanvas(canvas) {
        if (!canvas || canvas.__waveInitialized) return;
        canvas.__waveInitialized = true;

        var ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Obtain SimplexNoise from window or canvas iframe context
        var SimplexConstructor = window.SimplexNoise;
        if (!SimplexConstructor && canvas.ownerDocument && canvas.ownerDocument.defaultView) {
            SimplexConstructor = canvas.ownerDocument.defaultView.SimplexNoise;
        }
        var simplex = SimplexConstructor ? new SimplexConstructor() : null;
        var time = 0;
        var width = 0;
        var height = 0;
        var initialized = false;

        function resize() {
            var parent = canvas.parentElement || canvas;
            var rect = parent.getBoundingClientRect();
            width = rect.width || canvas.offsetWidth || 1200;
            height = rect.height || canvas.offsetHeight || 600;
            var win = canvas.ownerDocument.defaultView || window;
            var dpr = win.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            if (initialized) draw();
        }

        var win = canvas.ownerDocument.defaultView || window;
        win.addEventListener('resize', resize);
        if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
            var ro = new ResizeObserver(resize);
            ro.observe(canvas.parentElement);
        }
        resize();

        function draw() {
            if (!canvas.isConnected) {
                canvas.__waveInitialized = false;
                return;
            }

            if (width === 0 || height === 0) {
                resize();
            }

            ctx.clearRect(0, 0, width, height);

            var linesConfig = [
                { type: 'wave', yRel: 0.032 },
                { type: 'echo', yRel: 0.056 },
                { type: 'wave', yRel: 0.968 },
                { type: 'echo', yRel: 0.944 }
            ];

            var stepX = 5;

            for (var i = 0; i < linesConfig.length; i++) {
                var config = linesConfig[i];
                ctx.beginPath();

                if (config.type === 'wave') {
                    ctx.strokeStyle = 'rgba(14, 18, 23, 0.28)';
                    ctx.lineWidth = 1.2;
                    ctx.setLineDash([]);
                } else {
                    ctx.strokeStyle = 'rgba(14, 18, 23, 0.2)';
                    ctx.lineWidth = 1.2;
                    ctx.setLineDash([2, 6]);
                }

                var baseY = height * config.yRel;

                for (var x = 0; x <= width; x += stepX) {
                    var noiseValue = simplex ? simplex.noise3D(x * 0.002, i * 0.5, time) : Math.sin(x * 0.005 + time + i);
                    var offsetY = noiseValue * 35;
                    var y = baseY + offsetY;

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }

            // Draw independent floating dots
            var dots = [
                { xRel: 0.58, yRel: 0.08, seed: 10 },
                { xRel: 0.76, yRel: 0.985, seed: 20 },
                { xRel: 0.15, yRel: 0.92, seed: 30 }
            ];
            ctx.fillStyle = 'rgba(0, 73, 91, 0.35)';
            for (var d = 0; d < dots.length; d++) {
                var dot = dots[d];
                var baseX = width * dot.xRel;
                var baseY = height * dot.yRel;
                var floatX = (simplex ? simplex.noise3D(dot.seed, 0, time * 0.8) : Math.sin(time + dot.seed)) * 35;
                var floatY = (simplex ? simplex.noise3D(0, dot.seed, time * 0.8) : Math.cos(time + dot.seed)) * 35;
                var dotX = baseX + floatX;
                var dotY = baseY + floatY;

                if (dotY > height - 5) dotY = height - 5;
                if (dotY < 5) dotY = 5;

                ctx.beginPath();
                ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
                ctx.fill();
            }

        }

        // Still frame at a fixed phase (no animation loop in the editor).
        time = 0.35;
        initialized = true;
        draw();
    }

    /**
     * Scan a document for candidate canvas elements.
     */
    function scanDoc(doc) {
        if (!doc) return;
        var canvases = doc.querySelectorAll('.staggered-lineart canvas, #sectorWaveCanvas');
        for (var i = 0; i < canvases.length; i++) {
            initWaveCanvas(canvases[i]);
        }

        // Only run Lucide when there are still un-rendered icon placeholders.
        // Lucide keeps `data-lucide` on the generated <svg>, so calling createIcons()
        // unconditionally replaces every icon again and re-triggers the observer below.
        if (!doc.querySelector('[data-lucide]:not(svg)')) {
            return;
        }

        var lucideInst = (doc.defaultView && doc.defaultView.lucide) || window.lucide;
        if (lucideInst && typeof lucideInst.createIcons === 'function') {
            try {
                lucideInst.createIcons({
                    root: doc.body || doc
                });
            } catch(e) {}
        }
    }

    /**
     * Handle navigation dropdown toggle inside the editor.
     */
    function setupDropdowns(doc) {
        if (!doc || doc.__dropdownsInitialized) return;
        doc.__dropdownsInitialized = true;

        doc.addEventListener('click', function(e) {
            var trigger = e.target.closest('.nav-split-menu > li.has-dropdown > a');
            if (trigger) {
                var li = trigger.closest('li.has-dropdown');
                if (li) {
                    e.preventDefault();
                    var isOpen = li.classList.contains('is-open');
                    var allDropdowns = doc.querySelectorAll('.nav-split-menu > li.has-dropdown');
                    for (var i = 0; i < allDropdowns.length; i++) {
                        allDropdowns[i].classList.remove('is-open');
                    }
                    if (!isOpen) {
                        li.classList.add('is-open');
                    }
                    return;
                }
            }

            if (!e.target.closest('.nav-split-menu > li.has-dropdown')) {
                var openItems = doc.querySelectorAll('.nav-split-menu > li.has-dropdown.is-open');
                for (var j = 0; j < openItems.length; j++) {
                    openItems[j].classList.remove('is-open');
                }
            }
        });
    }

    /**
     * Handle custom select dropdown in contact form.
     */
    function setupCustomSelect(doc) {
        if (!doc || doc.__customSelectInitialized) return;
        doc.__customSelectInitialized = true;

        doc.addEventListener('click', function(e) {
            var trigger = e.target.closest('.custom-select-trigger');
            if (trigger) {
                var selectWrap = trigger.closest('.custom-select');
                if (selectWrap) {
                    selectWrap.classList.toggle('is-open');
                    return;
                }
            }

            var option = e.target.closest('.custom-select-list li');
            if (option) {
                var parentWrap = option.closest('.custom-select');
                if (parentWrap) {
                    var val = option.getAttribute('data-value') || '';
                    var text = option.textContent.trim();
                    var valDisplay = parentWrap.querySelector('.custom-select-value');
                    var hiddenInput = parentWrap.querySelector('input[type="hidden"]');
                    if (valDisplay) {
                        valDisplay.textContent = text;
                        valDisplay.classList.remove('is-placeholder');
                    }
                    if (hiddenInput) {
                        hiddenInput.value = val;
                    }
                    parentWrap.classList.remove('is-open');
                    return;
                }
            }

            var openSelects = doc.querySelectorAll('.custom-select.is-open');
            for (var i = 0; i < openSelects.length; i++) {
                openSelects[i].classList.remove('is-open');
            }
        });
    }

    /**
     * Observe a document and its subtree for dynamic block insertion.
     */
    function observeDoc(doc) {
        if (!doc || doc.__waveObserverSet) return;
        doc.__waveObserverSet = true;

        scanDoc(doc);
        setupDropdowns(doc);
        setupCustomSelect(doc);

        var target = doc.body || doc.documentElement;
        if (!target) return;

        var observeOpts = { childList: true, subtree: true };
        var scheduled = false;
        var observer = new MutationObserver(function() {
            // Batch bursts of mutations into one scan per frame.
            if (scheduled) return;
            scheduled = true;
            var raf = (doc.defaultView && doc.defaultView.requestAnimationFrame) || window.requestAnimationFrame;
            raf(function() {
                scheduled = false;
                // Ignore the DOM changes made by our own scan (canvas init, icon replacement).
                observer.disconnect();
                try {
                    scanDoc(doc);
                } finally {
                    observer.takeRecords();
                    observer.observe(target, observeOpts);
                }
            });
        });

        observer.observe(target, observeOpts);
    }

    /**
     * Check both root document and any editor iframes.
     */
    function checkAllContexts() {
        observeDoc(document);

        var iframes = document.querySelectorAll('iframe');
        for (var i = 0; i < iframes.length; i++) {
            var iframe = iframes[i];
            try {
                if (iframe.contentDocument && iframe.contentDocument.body) {
                    observeDoc(iframe.contentDocument);
                } else {
                    iframe.addEventListener('load', function() {
                        try {
                            if (this.contentDocument) {
                                observeDoc(this.contentDocument);
                            }
                        } catch(e) {}
                    });
                }
            } catch(e) {}
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAllContexts);
    } else {
        checkAllContexts();
    }

    var rootObserver = new MutationObserver(function() {
        checkAllContexts();
    });
    if (document.body) {
        rootObserver.observe(document.body, { childList: true, subtree: true });
    }
})();

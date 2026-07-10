/* ==========================================
   CapCut Pro Guide Javascript - script.js
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Keep mobile browsers pinned to the left edge if a wide child briefly appears.
    function resetHorizontalScroll() {
        if (window.scrollX !== 0) {
            window.scrollTo(0, window.scrollY);
        }
        document.documentElement.scrollLeft = 0;
        document.body.scrollLeft = 0;
    }

    resetHorizontalScroll();
    window.addEventListener('load', resetHorizontalScroll);
    window.addEventListener('resize', resetHorizontalScroll);
    window.addEventListener('orientationchange', () => {
        window.setTimeout(resetHorizontalScroll, 150);
    });

    // --- 1. Mobile Menu Navigation Toggle ---
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    function setMobileMenuOpen(isOpen) {
        document.body.classList.toggle('menu-open', isOpen);
        if (menuToggle) {
            menuToggle.classList.toggle('active', isOpen);
            menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
        if (mobileNav) {
            mobileNav.classList.toggle('active', isOpen);
        }
    }

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            setMobileMenuOpen(!mobileNav.classList.contains('active'));
        });

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                setMobileMenuOpen(false);
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                setMobileMenuOpen(false);
            }
        });
    }

    // --- 1b. Mobile Table Card Labels ---
    document.querySelectorAll('.styled-table').forEach(table => {
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
        table.querySelectorAll('tbody tr').forEach(row => {
            row.querySelectorAll('td').forEach((cell, index) => {
                if (!cell.hasAttribute('data-label') && headers[index]) {
                    cell.setAttribute('data-label', headers[index]);
                }
            });
        });
    });

    // --- 2. Scroll: Progress Bar, FAB Download, Back-to-Top & Scroll Spy ---
    const readingProgress = document.getElementById('readingProgress');
    const fabDownload = document.getElementById('fabDownload');
    const backToTop = document.getElementById('backToTop');
    const sections = document.querySelectorAll('.scroll-spy-target');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    function onScroll() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Reading progress bar
        if (readingProgress) {
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            readingProgress.style.width = `${progress}%`;
        }

        // Floating Download FAB — show after scrolling past hero (400px)
        if (fabDownload) {
            if (scrollTop > 400) {
                fabDownload.classList.add('visible');
            } else {
                fabDownload.classList.remove('visible');
            }
        }

        // Back-to-Top Button — show after 600px
        if (backToTop) {
            if (scrollTop > 600) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // Scroll Spy
        let currentSectionId = '';
        const scrollPosition = scrollTop + 120;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });
        if (currentSectionId) {
            sidebarLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Run initially

    // Back-to-top click
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // --- 3. Interactive Sandbox: Speed Curve & Optical Flow ---
    const btnSpeedCurve = document.getElementById('btnSpeedCurve');
    const btnOpticalFlow = document.getElementById('btnOpticalFlow');
    const demoSpeedCurve = document.getElementById('demoSpeedCurve');
    const demoOpticalFlow = document.getElementById('demoOpticalFlow');

    // Toggle sandbox view
    btnSpeedCurve.addEventListener('click', () => {
        btnSpeedCurve.classList.add('active');
        btnOpticalFlow.classList.remove('active');
        demoSpeedCurve.classList.remove('hidden');
        demoOpticalFlow.classList.add('hidden');
    });

    btnOpticalFlow.addEventListener('click', () => {
        btnOpticalFlow.classList.add('active');
        btnSpeedCurve.classList.remove('active');
        demoOpticalFlow.classList.remove('hidden');
        demoSpeedCurve.classList.add('hidden');
    });

    // Speed Curve Animation
    const triggerSpeedAnim = document.getElementById('triggerSpeedAnim');
    const ballSpeed = document.getElementById('ballSpeed');
    const svgPath = document.getElementById('curvePath');
    const playhead = document.getElementById('playhead');
    let speedAnimActive = false;

    triggerSpeedAnim.addEventListener('click', () => {
        if (speedAnimActive) return;
        speedAnimActive = true;
        triggerSpeedAnim.disabled = true;

        const pathLength = svgPath.getTotalLength();
        let startTime = null;
        const duration = 2500; // 2.5 seconds for custom curve simulation

        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Animate playhead dot along the path
            const currentLength = progress * pathLength;
            const point = svgPath.getPointAtLength(currentLength);
            playhead.setAttribute('cx', point.x);
            playhead.setAttribute('cy', point.y);

            // Animate runner ball: Calculate nonlinear position mapping curve
            // The curve path has a sharp dip (fast center acceleration, slow ends)
            // Let's map it based on the y-coordinate of the path point
            // Higher y (low on screen) = slower, Lower y (high on screen) = faster
            const normalizedY = (130 - point.y) / 110; // Range: 0 to 1
            const linearLeft = 20 + progress * (document.querySelector('.demo-animation-box').clientWidth - 60);
            
            // Apply speed curve shift to the visual rendering ball
            ballSpeed.style.left = `${linearLeft}px`;
            
            // Scale visual scale indicator based on curve height
            const sizeScale = 1 + normalizedY * 0.4;
            ballSpeed.style.transform = `scale(${sizeScale})`;
            ballSpeed.style.boxShadow = `0 0 ${10 + normalizedY * 20}px var(--primary)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Reset positions after delay
                setTimeout(() => {
                    playhead.setAttribute('cx', 10);
                    playhead.setAttribute('cy', 130);
                    ballSpeed.style.left = '20px';
                    ballSpeed.style.transform = 'scale(1)';
                    ballSpeed.style.boxShadow = '0 0 10px var(--primary)';
                    speedAnimActive = false;
                    triggerSpeedAnim.disabled = false;
                }, 1000);
            }
        }

        requestAnimationFrame(animate);
    });

    // Optical Flow Frame Interpolation Animation
    const triggerFlowAnim = document.getElementById('triggerFlowAnim');
    const computedObj = document.querySelector('.computed-obj');
    let flowAnimActive = false;

    triggerFlowAnim.addEventListener('click', () => {
        if (flowAnimActive) return;
        flowAnimActive = true;
        triggerFlowAnim.disabled = true;

        // Perform visual fade & translation vectors simulation
        computedObj.style.opacity = '0';
        computedObj.style.left = '10%';

        setTimeout(() => {
            // Animate to center representing the calculated frame
            computedObj.style.transition = 'left 1s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease';
            computedObj.style.left = '50%';
            computedObj.style.opacity = '1';
        }, 100);

        setTimeout(() => {
            // Completed state
            computedObj.style.transition = 'none';
            flowAnimActive = false;
            triggerFlowAnim.disabled = false;
        }, 1800);
    });


    // --- 4. Technical Specs Table Filter Search ---
    const specSearchInput = document.getElementById('specSearchInput');
    const specsTable = document.getElementById('specsTable');
    
    if (specSearchInput && specsTable) {
        const rows = specsTable.querySelectorAll('tbody tr');

        specSearchInput.addEventListener('input', () => {
            const query = specSearchInput.value.toLowerCase().trim();

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(query)) {
                    row.classList.remove('hidden');
                } else {
                    row.classList.add('hidden');
                }
            });
        });
    }


    // --- 5. Deployment Wizard Steps System ---
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const panes = document.querySelectorAll('.wizard-pane');
    const stepDots = document.querySelectorAll('.step-dot');
    const wizardProgress = document.getElementById('wizardProgress');
    let currentStep = 1;

    function updateWizard() {
        // Update Pane Visibility
        panes.forEach((pane, index) => {
            if (index === currentStep - 1) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });

        // Update step dots classes
        stepDots.forEach((dot, index) => {
            const stepNum = index + 1;
            dot.classList.remove('active', 'completed');
            if (stepNum === currentStep) {
                dot.classList.add('active');
            } else if (stepNum < currentStep) {
                dot.classList.add('completed');
            }
        });

        // Update progress bar percentage fill
        const progressPercentage = ((currentStep - 1) / (panes.length - 1)) * 100;
        wizardProgress.style.width = `${progressPercentage}%`;

        // Update Buttons states
        prevBtn.disabled = currentStep === 1;
        if (currentStep === panes.length) {
            nextBtn.textContent = 'Finish & Launch';
        } else {
            nextBtn.textContent = 'Continue';
        }
    }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentStep < panes.length) {
                currentStep++;
                updateWizard();
            } else {
                // Completed wizard actions
                alert('Official CapCut Pro manual installation wizard completed! Ensure you scan downloaded files with mobile security before final execution.');
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateWizard();
            }
        });
    }


    // --- 6. Troubleshoot Tab Switcher ---
    const tsTabs = document.querySelectorAll('.troubleshoot-tab');
    const tsPanes = document.querySelectorAll('.ts-pane');

    tsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active classes
            tsTabs.forEach(t => t.classList.remove('active'));
            tsPanes.forEach(p => p.classList.remove('active'));

            // Set active class
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });


    // --- 7. FAQ Search Filter & Accordion Toggle ---
    const faqSearchInput = document.getElementById('faqSearchInput');
    const faqItems = document.querySelectorAll('.faq-item');

    // FAQ Filter
    if (faqSearchInput) {
        faqSearchInput.addEventListener('input', () => {
            const query = faqSearchInput.value.toLowerCase().trim();

            faqItems.forEach(item => {
                const questionText = item.querySelector('.faq-question').textContent.toLowerCase();
                const answerText = item.querySelector('.faq-answer').textContent.toLowerCase();

                if (questionText.includes(query) || answerText.includes(query)) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    }

    // FAQ Accordion Click Handler
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close other active FAQ items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            // Toggle selected item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

});

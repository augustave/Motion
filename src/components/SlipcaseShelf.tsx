import React, { useEffect, useRef, useState } from 'react';
import { shelfData } from '../data/shelfData';

// Constants
const MAX_OPEN = -220;

export default function SlipcaseShelf({ isActive = true }: { isActive?: boolean }) {
    const worldCameraRef = useRef<HTMLDivElement>(null);
    const [activeBookId, setActiveBookId] = useState<string | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    
    // Refs for state that updates frequently during drag/scroll to avoid re-renders
    const activeBookRef = useRef<HTMLElement | null>(null);
    const dragState = useRef({
        startX: 0,
        startY: 0,
        initialX: 0,
        lastDragX: 0,
        lastDragTime: 0,
        dragVelocity: 0,
        isPaginating: false
    });

    const audioCtxRef = useRef<AudioContext | null>(null);

    // --- Audio Logic ---
    const initAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    };

    const playMechanicalClick = () => {
        const audioCtx = audioCtxRef.current;
        if (!audioCtx) return;
        const t = audioCtx.currentTime;

        // 1. Heavy Thud
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.exponentialRampToValueAtTime(20, t + 0.08);
        oscGain.gain.setValueAtTime(0.4, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        osc.connect(oscGain);
        oscGain.connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.08);

        // 2. Paper Friction
        const bufferSize = audioCtx.sampleRate * 0.04;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 3000;
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.15, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        noise.start(t);
    };

    // --- Camera Logic ---
    const focusBook = (bookId: string, bookEl: HTMLElement) => {
        initAudio();
        if (activeBookId === bookId) return;

        setActiveBookId(bookId);
        activeBookRef.current = bookEl;
        setCurrentSlide(0);

        // Math for Camera Pan
        const slot = bookEl.parentElement;
        if (!slot || !worldCameraRef.current) return;

        const rect = slot.getBoundingClientRect();
        const scale = 1.3333; // 1 / 0.75 to bring the 0.75 scale to 1.0
        const px = rect.left + rect.width / 2;
        const py = rect.top + rect.height / 2;
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        const tx = cx - px * scale;
        const ty = cy - py * scale;

        worldCameraRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
        document.body.classList.add('has-active-book');
        bookEl.classList.add('is-focused');
    };

    const returnToShelf = () => {
        if (!activeBookRef.current || !worldCameraRef.current) return;

        const bookEl = activeBookRef.current;
        bookEl.classList.remove('is-focused', 'is-active', 'is-hovered');
        bookEl.style.removeProperty('--paper-x');

        worldCameraRef.current.style.transform = `translate(0px, 0px) scale(1)`;
        document.body.classList.remove('has-active-book');
        
        setActiveBookId(null);
        activeBookRef.current = null;
    };

    // --- Pagination Logic ---
    const triggerPagination = (newSlideIndex: number) => {
        dragState.current.isPaginating = true;
        setCurrentSlide(newSlideIndex);
        
        playMechanicalClick();
        setTimeout(() => { dragState.current.isPaginating = false; }, 500);
    };

    // --- Event Handlers ---
    const handleWheel = (e: WheelEvent) => {
        if (!isActive) return;
        if (!activeBookRef.current || !activeBookRef.current.classList.contains('is-active')) return;
        e.preventDefault();

        if (dragState.current.isPaginating) return;
        
        const bookData = shelfData.find(b => b.id === activeBookId);
        if (!bookData) return;
        
        const totalSlides = bookData.slides.length;

        if (e.deltaY > 30) {
            const nextSlide = Math.min(totalSlides - 1, currentSlide + 1);
            if (nextSlide !== currentSlide) {
                triggerPagination(nextSlide);
            }
        } else if (e.deltaY < -30) {
            const prevSlide = Math.max(0, currentSlide - 1);
            if (prevSlide !== currentSlide) {
                triggerPagination(prevSlide);
            }
        }
    };

    const getEventX = (e: MouseEvent | TouchEvent) => {
        return (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    };
    const getEventY = (e: MouseEvent | TouchEvent) => {
        return (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
    };

    const handleDragStart = (e: MouseEvent | TouchEvent) => {
        if (!isActive) return;
        // Only allow left click or touch
        if (e.type === 'mousedown' && (e as MouseEvent).button !== 0) return;
        if (!activeBookRef.current) return;

        setIsDragging(true);
        activeBookRef.current.classList.add('is-dragging');
        activeBookRef.current.classList.remove('is-hovered');

        dragState.current.startX = getEventX(e);
        dragState.current.startY = getEventY(e);
        dragState.current.initialX = activeBookRef.current.classList.contains('is-active') ? MAX_OPEN : 0;
        
        dragState.current.lastDragX = dragState.current.startX;
        dragState.current.lastDragTime = performance.now();
        dragState.current.dragVelocity = 0;
    };

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
        if (!isActive || !isDragging || !activeBookRef.current) return;
        // Prevent default to stop scrolling on mobile
        if (e.cancelable) e.preventDefault();

        const currentX = getEventX(e);
        const currentY = getEventY(e);
        const screenDeltaX = currentX - dragState.current.startX;
        const screenDeltaY = currentY - dragState.current.startY;
        
        const bookData = shelfData.find(b => b.id === activeBookId);
        const totalSlides = bookData ? bookData.slides.length : 1;

        // Inertia
        const now = performance.now();
        const deltaTime = now - dragState.current.lastDragTime;
        if (deltaTime > 0) {
            dragState.current.dragVelocity = (currentX - dragState.current.lastDragX) / deltaTime;
        }
        dragState.current.lastDragX = currentX;
        dragState.current.lastDragTime = now;

        // Swipe Logic (Vertical)
        if (activeBookRef.current.classList.contains('is-active') && Math.abs(screenDeltaY) > 40 && Math.abs(screenDeltaY) > Math.abs(screenDeltaX)) {
            if (!dragState.current.isPaginating) {
                let nextSlide = currentSlide;
                if (screenDeltaY < 0) nextSlide = Math.min(totalSlides - 1, currentSlide + 1);
                else nextSlide = Math.max(0, currentSlide - 1);

                if (nextSlide !== currentSlide) {
                    triggerPagination(nextSlide);
                    dragState.current.startY = currentY;
                    dragState.current.startX = currentX;
                    dragState.current.initialX = MAX_OPEN;
                }
            }
            return;
        }

        // Drag Logic (Horizontal)
        const rect = activeBookRef.current.getBoundingClientRect();
        const scaleRatio = 800 / rect.width;
        let newX = dragState.current.initialX + (screenDeltaX * scaleRatio);

        if (newX > 0) newX = 0;
        if (newX < MAX_OPEN) newX = MAX_OPEN;

        activeBookRef.current.style.setProperty('--paper-x', `${newX}px`);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isActive) return;
        if (activeBookRef.current && activeBookRef.current.classList.contains('is-active') && !isDragging) {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const px = e.clientX - cx;
            const py = e.clientY - cy;
            activeBookRef.current.style.setProperty('--parallax-x', `${px}`);
            activeBookRef.current.style.setProperty('--parallax-y', `${py}`);
        }
    };

    const handleDragEnd = () => {
        if (!isActive || !isDragging || !activeBookRef.current) return;
        
        setIsDragging(false);
        activeBookRef.current.classList.remove('is-dragging');

        const currentXStr = activeBookRef.current.style.getPropertyValue('--paper-x');
        const currentX = currentXStr ? parseFloat(currentXStr) : dragState.current.initialX;

        activeBookRef.current.style.removeProperty('--paper-x');

        if (Math.abs(currentX - dragState.current.initialX) < 5) {
            // Click/Tap behavior
            activeBookRef.current.classList.toggle('is-active');
        } else {
            // Fling behavior
            const VELOCITY_THRESHOLD = 0.25;
            if (dragState.current.dragVelocity < -VELOCITY_THRESHOLD) {
                activeBookRef.current.classList.add('is-active');
            } else if (dragState.current.dragVelocity > VELOCITY_THRESHOLD) {
                activeBookRef.current.classList.remove('is-active');
            } else {
                if (currentX < MAX_OPEN / 2) activeBookRef.current.classList.add('is-active');
                else activeBookRef.current.classList.remove('is-active');
            }
        }
    };

    // Attach global event listeners
    useEffect(() => {
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchmove', handleDragMove, { passive: false });
        window.addEventListener('touchend', handleDragEnd);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [activeBookId, currentSlide, isDragging]); // Re-bind when state changes to capture correct closures if needed, though refs handle most

    return (
        <>
            {/* Global Definitions */}
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <filter id="vintage-noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
                        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" in="noise" result="coloredNoise" />
                        <feBlend in="SourceGraphic" in2="coloredNoise" mode="multiply" />
                    </filter>
                    <filter id="filter-grain">
                        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
                        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.12 0" in="noise" result="coloredNoise" />
                        <feBlend in="SourceGraphic" in2="coloredNoise" mode="multiply" />
                    </filter>
                    <filter id="filter-ribbing">
                        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.4" numOctaves="2" result="noise" />
                        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" in="noise" result="coloredNoise" />
                        <feBlend in="SourceGraphic" in2="coloredNoise" mode="multiply" />
                    </filter>
                    <filter id="filter-stipple">
                        <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="4" result="noise" />
                        <feComponentTransfer in="noise" result="stipple">
                            <feFuncA type="discrete" tableValues="0 1" />
                        </feComponentTransfer>
                        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.1 0" in="stipple" result="coloredStipple" />
                        <feBlend in="SourceGraphic" in2="coloredStipple" mode="multiply" />
                    </filter>
                    <clipPath id="photo-mask">
                        <rect x="5" y="5" width="170" height="380" />
                    </clipPath>
                </defs>
            </svg>

            {/* UI Layer */}
            <div id="ui-layer">
                <button id="back-button" onClick={returnToShelf}>← Return to Shelf</button>
            </div>

            {/* World Camera */}
            <div id="world-camera" ref={worldCameraRef}>
                <div className="shelf" id="shelf-root">
                    {shelfData.map((book) => (
                        <div className="shelf-slot" key={book.id}>
                            <div 
                                className={`scene-container ${activeBookId === book.id ? 'is-focused' : ''}`}
                                id={book.id}
                                data-total-slides={book.slides.length}
                                style={{
                                    '--cerulean-sleeve': book.colors.sleeve,
                                    '--archival-cream': book.colors.paper,
                                    '--ink-black': book.colors.ink,
                                } as React.CSSProperties}
                                onMouseEnter={(e) => {
                                    if (!isDragging) e.currentTarget.classList.add('is-hovered');
                                }}
                                onMouseLeave={(e) => {
                                    if (!isDragging) e.currentTarget.classList.remove('is-hovered');
                                }}
                                onMouseDown={(e) => {
                                    if (activeBookId !== book.id) {
                                        focusBook(book.id, e.currentTarget);
                                    } else {
                                        handleDragStart(e as unknown as MouseEvent);
                                    }
                                }}
                                onTouchStart={(e) => {
                                    if (activeBookId !== book.id) {
                                        focusBook(book.id, e.currentTarget);
                                    } else {
                                        handleDragStart(e as unknown as TouchEvent);
                                    }
                                }}
                            >
                                <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
                                    {/* CREAM PAPER (Z:5) */}
                                    <g className="cream-paper">
                                        <rect x="360" y="85" width="240" height="430" fill="var(--archival-cream)" filter={book.textures.paper} />
                                        
                                        <text x="-310" y="375" transform="rotate(-90)" fill="var(--ink-black)" fontSize="10" letterSpacing="0.5">{book.paper.title1}</text>
                                        <text x="-500" y="375" transform="rotate(-90)" fill="var(--ink-black)" fontSize="10" letterSpacing="0.5">{book.paper.title2}</text>
                                        <text x="-480" y="405" transform="rotate(-90)" fill="var(--ink-black)" fontSize="7" opacity="0.6">{book.paper.date}</text>

                                        <g className="photo-content" transform="translate(390, 105)">
                                            <rect x="0" y="0" width="180" height="390" fill="#2a2a2a" />
                                            <g clipPath="url(#photo-mask)" filter="url(#vintage-noise)">
                                                <g className="filmstrip-track">
                                                    {book.slides.map((slideContent, idx) => {
                                                        const isThisBookActive = activeBookId === book.id;
                                                        const slideIndex = isThisBookActive ? currentSlide : 0;
                                                        const isActive = idx === slideIndex;
                                                        const isPast = idx < slideIndex;
                                                        
                                                        return (
                                                            <g 
                                                                key={idx} 
                                                                className={`slide ${isActive ? 'active' : isPast ? 'past' : 'future'}`} 
                                                                dangerouslySetInnerHTML={{ __html: slideContent }} 
                                                            />
                                                        );
                                                    })}
                                                </g>
                                            </g>
                                            <g className="dynamic-progress-tally">
                                                <line x1="180" y1="392" x2="180" y2="397" stroke="var(--ink-black)" strokeWidth="1" opacity="0.5" />
                                                <text className="progress-text" x="180" y="410" textAnchor="end" fill="var(--ink-black)" fontSize="8" letterSpacing="2" fontFamily="monospace">
                                                    {activeBookId === book.id ? `${currentSlide + 1} / ${book.slides.length}` : `1 / ${book.slides.length}`}
                                                </text>
                                            </g>
                                        </g>
                                    </g>

                                    {/* BLUE SLEEVE (Z:10) */}
                                    <g className="blue-sleeve">
                                        <rect x="395" y="80" width="220" height="440" fill="#000" opacity="0.3" filter="blur(4px)" />
                                        <rect x="400" y="80" width="220" height="440" fill="var(--cerulean-sleeve)" filter={book.textures.sleeve} />
                                        
                                        <text x="-310" y="415" transform="rotate(-90)" fill="var(--ink-black)" fontSize="10" letterSpacing="0.5">{book.sleeve.title1}</text>
                                        <text x="-500" y="415" transform="rotate(-90)" fill="var(--ink-black)" fontSize="10" letterSpacing="0.5">{book.sleeve.title2}</text>
                                        <text x="-500" y="605" transform="rotate(-90)" fill="var(--ink-black)" fontSize="10" letterSpacing="0.5">{book.sleeve.authors}</text>
                                    </g>
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

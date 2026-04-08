document.addEventListener("DOMContentLoaded", () => {
    const videoFeed = document.querySelector("#video-feed");
    const videos = document.querySelectorAll(".reel-video");
    const scrollHint = document.querySelector("#scroll-hint");
    const bgMusic = document.querySelector("#bg-music");
    const playOverlay = document.querySelector("#play-overlay");

    let isAppPaused = false;
    let hasStartedOnce = false;

    console.log("App Initialized. Music Element:", bgMusic ? "Found" : "Not Found");

    // Helper: Find current visible video
    const getVisibleVideo = () => {
        return Array.from(videos).find(v => {
            const rect = v.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            return center >= 0 && center <= window.innerHeight;
        });
    };

    // Unified play/pause logic
    const syncPlayback = (shouldPlay) => {
        if (shouldPlay) {
            bgMusic.play().then(() => {
                isAppPaused = false;
                hasStartedOnce = true;
                const activeVideo = getVisibleVideo();
                if (activeVideo) activeVideo.play();
                console.log("Playback Synced: Playing");
            }).catch(e => {
                console.error("Playback failed:", e);
                // If it fails, we keep the overlay or show it again? 
                // Usually it only fails if there's no user gesture.
            });
        } else {
            bgMusic.pause();
            isAppPaused = true;
            videos.forEach(v => v.pause());
            console.log("Playback Synced: Paused");
        }
    };

    // Global Interaction Handler
    const handleGlobalInteraction = (e) => {
        // Prevent double-firing on mobile
        if (e.type === 'click' && 'ontouchstart' in window) return;

        console.log(`Interaction detected: ${e.type}`);

        if (!hasStartedOnce) {
            // First interaction: Dismiss overlay and start everything
            if (playOverlay) {
                playOverlay.classList.add("hidden");
                setTimeout(() => playOverlay.remove(), 1000);
            }
            syncPlayback(true);
        } else {
            // Subsequent interactions: Toggle
            if (bgMusic.paused) {
                syncPlayback(true);
            } else {
                syncPlayback(false);
            }
        }
    };

    // Try autoplay (hidden fallback, likely to fail but good to have)
    bgMusic.play().then(() => {
        hasStartedOnce = true;
        if (playOverlay) playOverlay.remove();
        console.log("Autoplay success");
    }).catch(() => {
        console.log("Autoplay blocked - awaiting user interaction via overlay");
    });

    // Event Listeners for activation and toggling
    window.addEventListener("click", handleGlobalInteraction);
    window.addEventListener("touchstart", handleGlobalInteraction, { passive: true });
    
    // Scroll Hint & Position Management
    videoFeed.addEventListener("scroll", () => {
        if (videoFeed.scrollTop > 50) {
            scrollHint.style.opacity = "0";
            scrollHint.style.transition = "opacity 0.5s ease";
        } else {
            scrollHint.style.opacity = "1";
        }
    });

    // Intersection Observer for scrolling through videos
    const observerOptions = {
        root: videoFeed,
        rootMargin: "0px",
        threshold: 0.6,
    };

    const handleIntersection = (entries) => {
        entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.muted = true; // bgMusic is primary
                video.currentTime = 0;
                
                if (hasStartedOnce && !isAppPaused) {
                    video.play().catch(e => console.warn("Video play failed", e));
                }
            } else {
                video.pause();
            }
        });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    videos.forEach((video) => observer.observe(video));
});

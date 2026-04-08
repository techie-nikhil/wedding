document.addEventListener("DOMContentLoaded", () => {
    const videoFeed = document.querySelector("#video-feed");
    const videos = document.querySelectorAll(".reel-video");
    const scrollHint = document.querySelector("#scroll-hint");
    const bgMusic = document.querySelector("#bg-music");

    let isAppPaused = false;

    // Attempt to play music immediately
    const startMusic = () => {
        bgMusic.play().then(() => {
            console.log("Music started");
        }).catch(e => {
            console.log("Autoplay blocked, waiting for interaction", e);
        });
    };

    startMusic();

    // Scroll Observer for auto-playing/pausing videos
    const observerOptions = {
        root: videoFeed,
        rootMargin: "0px",
        threshold: 0.7, // Play when 70% of the video is in view
    };

    const handleIntersection = (entries) => {
        entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.muted = true; // Stay muted as bgMusic is primary
                video.currentTime = 0;
                
                // Only play if the app isn't explicitly paused
                if (!isAppPaused) {
                    video.play().catch(e => console.log("Video autoplay blocked", e));
                } else {
                    video.pause();
                }
            } else {
                video.pause();
            }
        });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    videos.forEach((video) => observer.observe(video));

    // Initial interaction handler to start music if blocked
    const startAppOnInteraction = () => {
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                isAppPaused = false;
                console.log("Music started via interaction");
            }).catch(e => console.log("Still blocked", e));
        }
        // Remove listeners once interaction occurs
        window.removeEventListener("click", startAppOnInteraction);
        window.removeEventListener("touchstart", startAppOnInteraction);
        videoFeed.removeEventListener("scroll", startAppOnInteraction);
    };

    // Global Toggle Functionality (only after initial start)
    const toggleAppPlayback = (e) => {
        // If music hasn't started yet, this click will be handled by the interaction listener
        // But we want toggling to work after the first start.
        if (bgMusic.paused && !isAppPaused) return; // Wait for initial start handled below

        if (bgMusic.paused) {
            bgMusic.play().catch(e => console.log("Music play blocked", e));
            isAppPaused = false;
            const visibleVideo = Array.from(videos).find(v => {
                const rect = v.getBoundingClientRect();
                return rect.top >= 0 && rect.bottom <= window.innerHeight;
            });
            if (visibleVideo) visibleVideo.play();
        } else {
            bgMusic.pause();
            isAppPaused = true;
            videos.forEach(v => v.pause());
        }
    };

    // Interaction fallbacks
    window.addEventListener("click", startAppOnInteraction);
    window.addEventListener("touchstart", startAppOnInteraction);
    videoFeed.addEventListener("scroll", startAppOnInteraction);

    // Regular toggle logic for clicks after start
    // We add this with a slight delay or handle it within the toggle function
    window.addEventListener("click", toggleAppPlayback);

    // Hide scroll hint and manage hint visibility
    videoFeed.addEventListener("scroll", () => {
        if (videoFeed.scrollTop > 50) {
            scrollHint.style.opacity = "0";
            scrollHint.style.transition = "opacity 0.5s ease";
        } else {
            scrollHint.style.opacity = "1";
        }
    }, { once: false });
});

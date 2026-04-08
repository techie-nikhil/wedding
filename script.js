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

    // Global Toggle Functionality
    const toggleAppPlayback = () => {
        if (bgMusic.paused) {
            // Play everything
            bgMusic.play().catch(e => console.log("Music play blocked", e));
            isAppPaused = false;
            
            // Play the currently visible video
            const visibleVideo = Array.from(videos).find(v => {
                const rect = v.getBoundingClientRect();
                return rect.top >= 0 && rect.bottom <= window.innerHeight;
            });
            if (visibleVideo) visibleVideo.play();
        } else {
            // Pause everything
            bgMusic.pause();
            isAppPaused = true;
            
            // Pause all videos
            videos.forEach(v => v.pause());
        }
    };

    // Tap anywhere to toggle (excluding potential interactive elements like buttons if added later)
    window.addEventListener("click", (e) => {
        toggleAppPlayback();
    });

    // Hide scroll hint after user starts scrolling
    videoFeed.addEventListener("scroll", () => {
        if (videoFeed.scrollTop > 50) {
            scrollHint.style.opacity = "0";
            scrollHint.style.transition = "opacity 0.5s ease";
        } else {
            scrollHint.style.opacity = "1";
        }
    }, { once: false });
});

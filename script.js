document.addEventListener("DOMContentLoaded", () => {
    const videoFeed = document.querySelector("#video-feed");
    const videos = document.querySelectorAll(".reel-video");
    const scrollHint = document.querySelector("#scroll-hint");

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
                // Ensure video restarts for a fresh feel
                video.muted = true; // Still muted for autoplay compliance
                video.currentTime = 0;
                video.play().catch(e => console.log("Autoplay blocked", e));
            } else {
                video.pause();
            }
        });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    videos.forEach((video) => {
        observer.observe(video);

        // Tap to play/pause functionality (YouTube Shorts style)
        video.addEventListener("click", () => {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });
    });

    // Unmute logic on first interaction
    const unmuteApp = () => {
        videos.forEach(v => v.muted = false);
        window.removeEventListener("click", unmuteApp);
        window.removeEventListener("touchstart", unmuteApp);
    };

    window.addEventListener("click", unmuteApp);
    window.addEventListener("touchstart", unmuteApp);

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

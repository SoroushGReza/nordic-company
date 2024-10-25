import { useState, useEffect } from "react";

// Handle visibility of sticky button based on reference
const useStickyButton = (ref) => {
    const [isStickyVisible, setIsStickyVisible] = useState(false);

    useEffect(() => {
        // Check if element is visible in viewport
        const handleScroll = () => {
            if (ref.current) {
                const rect = ref.current.getBoundingClientRect();
                const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0;
                setIsStickyVisible(isVisible);
            }
        };

        // Add scroll-event when component mounts
        window.addEventListener("scroll", handleScroll);

        // Remove event-listener when component mounts
        return () => window.removeEventListener("scroll", handleScroll);
    }, [ref]);

    return isStickyVisible;
};

export default useStickyButton;

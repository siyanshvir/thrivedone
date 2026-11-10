
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const words = ["SIMPLE", "EASY", "SMOOTH", "CLEAR"];

export function FlippingText() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <span className="inline-block relative h-[1.1em] w-[4ch] align-top [perspective:1000px]">
            <AnimatePresence mode="wait">
                <motion.span
                    key={words[index]}
                    initial={{ opacity: 0, rotateX: -90, y: 10 }}
                    animate={{ opacity: 1, rotateX: 0, y: 0 }}
                    exit={{ opacity: 0, rotateX: 90, y: -10 }}
                    transition={{ duration: 0.1, ease: "backOut" }}
                    className="absolute left-0 text-glacier block origin-center backface-hidden"
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {words[index]}.
                </motion.span>
            </AnimatePresence>
        </span>
    );
}

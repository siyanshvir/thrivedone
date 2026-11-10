"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState, useRef, useCallback } from "react";

interface ShootingStar {
    id: number;
    x: number;
    y: number;
    angle: number;
    scale: number;
    speed: number;
    distance: number;
}

interface ShootingStarsProps {
    minSpeed?: number;
    maxSpeed?: number;
    minDelay?: number;
    maxDelay?: number;
    starColor?: string;
    trailColor?: string;
    starWidth?: number;
    starHeight?: number;
    className?: string;
}

export const ShootingStars: React.FC<ShootingStarsProps> = ({
    minSpeed = 10,
    maxSpeed = 30,
    minDelay = 3000, // Increased delay for more spread out stars
    maxDelay = 8000, // Increased delay for more spread out stars
    starColor = "#9e9e9e",
    trailColor = "#2eb9df59",
    starWidth = 10,
    starHeight = 1,
    className,
}) => {
    const [star, setStar] = useState<ShootingStar | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const createStar = useCallback(() => {
        const side = Math.floor(Math.random() * 4);
        const offset = Math.random() * 100;

        let x = 0,
            y = 0,
            angle = 0;

        if (side === 0) {
            x = offset;
            y = 0;
            angle = 45;
        } else if (side === 1) {
            x = 100;
            y = offset;
            angle = 135;
        } else if (side === 2) {
            x = offset;
            y = 100;
            angle = 225;
        } else {
            x = 0;
            y = offset;
            angle = 315;
        }

        return {
            id: Date.now(),
            x,
            y,
            angle,
            scale: 1,
            speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
            distance: 0,
        };
    }, [minSpeed, maxSpeed]);

    useEffect(() => {
        const moveStar = () => {
            if (star) {
                setStar((prevStar) => {
                    if (!prevStar) return null;
                    const newDistance = prevStar.distance + prevStar.speed;
                    const newX =
                        prevStar.x +
                        newDistance * Math.cos((prevStar.angle * Math.PI) / 180);
                    const newY =
                        prevStar.y +
                        newDistance * Math.sin((prevStar.angle * Math.PI) / 180);

                    if (newX < -20 || newX > 120 || newY < -20 || newY > 120) {
                        return null;
                    }
                    return { ...prevStar, distance: newDistance };
                });
            } else {
                const delay = Math.random() * (maxDelay - minDelay) + minDelay;
                const timeout = setTimeout(() => {
                    setStar(createStar());
                }, delay);
                return () => clearTimeout(timeout);
            }
        };

        const animationFrame = requestAnimationFrame(moveStar);
        return () => cancelAnimationFrame(animationFrame);
    }, [star, createStar, maxDelay, minDelay]);

    return (
        <svg
            ref={svgRef}
            className={cn("absolute inset-0 h-full w-full pointer-events-none opacity-40", className)} // Added opacity here to dim stars
        >
            {star && (
                <rect
                    key={star.id}
                    x={star.x}
                    y={star.y}
                    width={starWidth}
                    height={starHeight}
                    fill="url(#gradient)"
                    transform={`rotate(${star.angle}, ${star.x}, ${star.y})`}
                />
            )}
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: trailColor, stopOpacity: 0 }} />
                    <stop offset="100%" style={{ stopColor: starColor, stopOpacity: 1 }} />
                </linearGradient>
            </defs>
        </svg>
    );
};

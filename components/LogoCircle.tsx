"use client";

import { useEffect, useRef } from "react";

interface LogoCircleProps {
  size: number;
  className?: string;
}

export default function LogoCircle({ size, className }: LogoCircleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const dim = Math.min(img.width, img.height);

      const tmp = document.createElement("canvas");
      tmp.width = img.width;
      tmp.height = img.height;
      const tctx = tmp.getContext("2d")!;
      tctx.drawImage(img, 0, 0);

      const imageData = tctx.getImageData(0, 0, img.width, img.height);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] >= 230 && d[i + 1] >= 230 && d[i + 2] >= 230) {
          d[i + 3] = 0;
        }
      }
      tctx.putImageData(imageData, 0, 0);

      ctx.clearRect(0, 0, size, size);
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      const offsetX = (img.width - dim) / 2;
      const offsetY = (img.height - dim) / 2;
      ctx.drawImage(tmp, -offsetX * (size / dim), -offsetY * (size / dim), img.width * (size / dim), img.height * (size / dim));
    };
    img.src = "/api/logo";
  }, [size]);

  return <canvas ref={canvasRef} width={size} height={size} className={className} />;
}

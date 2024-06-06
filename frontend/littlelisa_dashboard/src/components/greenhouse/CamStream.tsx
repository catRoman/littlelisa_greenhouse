import React, { useRef, useEffect } from "react";

interface MJPEGStreamCanvasProps {
  src: string;
}

const MJPEGStreamCanvas: React.FC<MJPEGStreamCanvasProps> = ({ src }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let active = true;
    const canvas = canvasRef.current;
    if (!canvas) return; // Additional null check for TypeScript
    const ctx = canvas.getContext("2d");
    if (!ctx) return; // Check if context is successfully obtained

    const img = new Image();
    img.crossOrigin = "Anonymous"; // Important for handling cross-origin images if needed

    const updateCanvas = () => {
      if (!active || !canvas) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = `${src}?t=${performance.now()}`; // Append a timestamp to prevent caching
    };

    img.onload = updateCanvas;
    img.onerror = () => {
      console.error("Error loading MJPEG stream");
      setTimeout(updateCanvas, 1000); // Retry after 1 second on error
    };

    img.src = src;

    return () => {
      active = false; // Cleanup on component unmount
    };
  }, [src]);

  return <canvas ref={canvasRef} className="aspect-w-16 aspect-h-9" />;
};

export default function CamStream() {
  const cameraStreamUrl = "/api/users/1/greenhouses/1/cam/mainStream";

  return (
    <div>
      <MJPEGStreamCanvas src={cameraStreamUrl} />
    </div>
  );
}

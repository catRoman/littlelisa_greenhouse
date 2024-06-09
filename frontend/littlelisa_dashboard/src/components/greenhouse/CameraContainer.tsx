import { useEffect, useRef } from "react";

type CameraContainerProps = {
  src: string;
};

export default function CameraContainer({ src }: CameraContainerProps) {
  const streamRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = streamRef.current;
    if (!img) return;

    // Function to start the stream
    const startStream = () => {
      img.src = `${src}?t=${Date.now()}`; // Add timestamp to avoid caching
    };

    // Function to stop the stream
    const stopStream = () => {
      img.src = ""; // Stops the current streaming
    };

    img.onerror = () => {
      console.error("Failed to load the stream, attempting to reconnect...");
      setTimeout(startStream, 100); // Attempt to restart the stream after a delay
    };
    // Start the stream
    startStream();

    // Stop the stream when the component unmounts
    return () => {
      stopStream();
    };
  }, [src]); // Re-run effect if the src changes
  return (
    <div className="aspect-w-16 aspect-h-9 relative overflow-hidden rounded-lg border-4 border-solid border-stone-500">
      <img
        className="h-full w-full object-cover"
        ref={streamRef}
        alt="Main Camera Stream"
      />
    </div>
  );
}

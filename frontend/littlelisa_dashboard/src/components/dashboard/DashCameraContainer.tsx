export default function DashCameraContainer() {
  return (
    <div className="aspect-w-16 aspect-h-9 relative overflow-hidden rounded-lg border-4 border-solid border-stone-500">
      <img
        className="h-full w-full object-cover"
        src="http://localhost:3000/camStream"
        width="400"
      />
    </div>
  );
}

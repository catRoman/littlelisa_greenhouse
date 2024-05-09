export default function ErrorPage() {
  return (
    <div className="flex h-screen flex-col">
      <div className="m-auto flex flex-col items-center gap-4">
        <h2 className="text-3xl">Uh oh....</h2>
        <p>There seems to have been an error finding the page</p>
      </div>
    </div>
  );
}

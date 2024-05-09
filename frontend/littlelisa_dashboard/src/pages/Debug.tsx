import GreenHouseRender from "../components/greenhouse/greenhouse_render/fooling_around/GreenHouseRenderjs";

export default function Debug() {
  return (
    <div className="pr-6">
      <h1>Debug page</h1>
      <div>
        <GreenHouseRender cssClass="h-80" />
      </div>
    </div>
  );
}

import UpdateSection from "./UpdateSection";

export default function OverviewSection() {
  return (
    <div className="flex flex-col justify-between">
      <div>Overview</div>
      <div className="justify-self-end">
        <UpdateSection />
      </div>
    </div>
  );
}

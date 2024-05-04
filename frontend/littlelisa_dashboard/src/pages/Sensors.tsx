import SensorDataGrid from "../components/sensorDataGrid/SensorDataGrid";

export default function Sensors() {
  return (
    <main className="p-4">
      <div className="pb-6">
        <h1 className="mb-4  pb-4 text-2xl">Raw Sensor Data</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus fugiat
          saepe id aspernatur officia recusandae cumque in quia officiis?
          Laboriosam eum debitis incidunt voluptates temporibus distinctio
          velit, voluptatum accusamus? Doloribus.
        </p>
      </div>
      <div>
        <SensorDataGrid />
      </div>
    </main>
  );
}

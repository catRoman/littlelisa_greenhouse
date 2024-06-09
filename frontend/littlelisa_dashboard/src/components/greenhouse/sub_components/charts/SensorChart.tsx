import { PureComponent } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartData } from "../../../../../types/common";

interface SensorChartProps {
  sensorType: string;
  sensorId: number;
}
interface SensorChartState {
  chartData: ChartData[] | null;
  isLoading: boolean;
}

export default class SensorChart extends PureComponent<SensorChartProps> {
  state: SensorChartState = {
    chartData: null,
    isLoading: true,
  };
  constructor(props: SensorChartProps) {
    super(props);
  }

  async componentDidMount() {
    // Equivalent to useEffect with empty dependency array
    const { sensorId } = this.props;
    try {
      const response = await fetch(
        `/api/users/1/greenhouses/1/sensors/${sensorId}/chart?last=7&units=days&grouped=hour`,
      );
      if (!response.ok) throw new Error("Error fetching data");
      const data = await response.json();
      this.setState({ chartData: data, isLoading: false });
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    const { isLoading, chartData } = this.state;
    const { sensorType } = this.props;
    if (isLoading)
      return (
        <div className="m-auto flex font-bold">
          <p>Loading...</p>
        </div>
      );
    if (!chartData || chartData.length === 0)
      return <div>No Chart Data fetched</div>;
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={50}
          height={20}
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="2 10" />
          <XAxis dataKey="period" tick={false} />
          <YAxis yAxisId="left" domain={["auto", "auto"]} />
          <YAxis
            yAxisId="right"
            domain={["auto", "auto"]}
            orientation="right"
          />

          {/* <Tooltip content={<CustomToolTip />} /> */}
          <Tooltip
            contentStyle={{ backgroundColor: "rgba(24,24,27, 0.8)" }} // Example: white with 80% opacity
            wrapperStyle={{ backgroundColor: "rgba(68,64,60, 0.6)" }} // Example: black with 60% opacity
            labelStyle={{ color: "rgba(161,161,170)" }} // Optionally adjust label text color
          />
          <Legend verticalAlign="bottom" />
          {sensorType === "DHT22" && (
            <>
              <Line
                yAxisId="right"
                dot={false}
                type="monotone"
                dataKey="avgTemp"
                name="Temperature"
                stroke="#c75e18"
              />
              <Line
                yAxisId="left"
                dot={false}
                type="monotone"
                name="Humidity"
                dataKey="avgHumidity"
                stroke="#19bd27"
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  }
}

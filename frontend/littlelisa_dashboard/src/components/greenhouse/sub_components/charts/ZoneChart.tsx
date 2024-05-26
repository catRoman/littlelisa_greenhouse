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

interface ZoneChartProps {
  zoneId: number;
}
interface ZoneChartState {
  chartData:
    | {
        types: string[];
        data: { [key: string]: number | string }[];
      }
    | undefined;
  isLoading: boolean;
}

export default class ZoneChart extends PureComponent<ZoneChartProps> {
  state: ZoneChartState = {
    chartData: undefined,
    isLoading: true,
  };
  constructor(props: ZoneChartProps) {
    super(props);
  }

  async componentDidMount() {
    // Equivalent to useEffect with empty dependency array
    const { zoneId } = this.props;
    try {
      const response = await fetch(
        `/api/users/1/greenhouses/1/zones/${zoneId}/sensors/chart?last=7&units=days&grouped=hour`,
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

    if (isLoading)
      return (
        <div className="m-auto flex font-bold">
          <p>Loading...</p>
        </div>
      );

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={50}
          height={20}
          data={chartData?.data}
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
          {chartData &&
            chartData.types.map((sensorType) => {
              if (sensorType === "DHT22") {
                return (
                  <>
                    <Line
                      yAxisId="right"
                      dot={false}
                      type="monotone"
                      dataKey="dht22_avgTemp"
                      name="Temperature"
                      stroke="#2a18c7"
                    />
                    <Line
                      yAxisId="left"
                      dot={false}
                      type="monotone"
                      name="Humidity"
                      dataKey="dht22_avgHumidity"
                      stroke="#bd19b5"
                    />
                  </>
                );
              }
              // add more sensors as i install them
            })}
        </LineChart>
      </ResponsiveContainer>
    );
  }
}

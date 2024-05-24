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
  sensorId: number;
}
interface SensorChartState {
  chartData: ChartData[] | null;
  isLoading: boolean;
}

// const CustomToolTip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="custom-tooltip">
//         <p className="label">{`${label} : ${payload[0].value}`}</p>
//       </div>
//     );
//   }

//   return null;
// };

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

    if (isLoading) return <div>Loading...</div>;
    if (!chartData || chartData.length === 0)
      return <div>No Chart Data fetched</div>;
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={50}
          height={30}
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          {/* <Tooltip content={<CustomToolTip />} /> */}
          <Tooltip />
          <Legend verticalAlign="bottom" />
          <Line
            dot={false}
            type="monotone"
            dataKey="avgTemp"
            stroke="#8884d8"
          />
          <Line
            dot={false}
            type="monotone"
            dataKey="avgHumidity"
            stroke="#2139c4"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }
}

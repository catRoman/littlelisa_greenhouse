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

interface SensorChartProps {
  sensorId: number;
}

export default class SensorChart extends PureComponent<SensorChartProps> {
  constructor(props: SensorChartProps) {
    super(props);
    this.state = {
      chartData: null, // Initialize chartData as null while fetching
      isLoading: true,
    };
  }

  async componentDidMount() {
    // Equivalent to useEffect with empty dependency array
    const { sensorId } = this.props;
    try {
      const response = await fetch(
        `/api/users1/greenhouses/1/sensors/${sensorId}/chart?last=7&units=days&grouped=hour`,
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
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="bottom" />
          <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
          <Line type="monotone" dataKey="humidity" stroke="#2139c4" />
          <Line type="monotone" dataKey="soil_moisture" stroke="#dd6d11" />
        </LineChart>
      </ResponsiveContainer>
    );
  }
}

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
import { phoney_sensor_avgd as data } from "../../data/static_info";

export default class DashAvgChart extends PureComponent {
  render() {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={50}
          height={30}
          data={data}
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

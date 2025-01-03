/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  CircularProgress,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import {
  BarChart,
  PieChart,
  Bar,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  LabelList,
  Treemap,
} from "recharts";

// Total Expenses: 64800

// Expenses by Employee:
// (4) [{…}, {…}, {…}, {…}, {…}]
// 0: {employee: 'Иванов Иван Иванович', total_expenses: 20700}
// 1: {employee: 'Петров Петр Петрович', total_expenses: 14100}
// 2: {employee: 'Сидоров Сидор Сидорович', total_expenses: 16600}
// 3: {employee: 'Смирнова Анна Ивановна', total_expenses: 13400}

// Expenses by Expense Type:
// (5) [{…}, {…}, {…}, {…}, {…}]
// 0: {expense_type: 'Ega', total_expenses: 27500}
// 1: {expense_type: 'Питание', total_expenses: 10500}
// 2: {expense_type: 'npoesA', total_expenses: 8800}
// 3: {expense_type: 'Проживание', total_expenses: 17500}
// 4: {expense_type: 'Суточны', total_expenses: 500}

// Employees with Most Trips:
// (4) [{…}, {…}, {…}, {…}, {…}]
// 0: {employee: 'Иванов Иван Иванович', trip_count: 2}
// 1: {employee: 'Смирнова Анна Ивановна', trip_count: 1}
// 2: {employee: 'Сидоров Сидор Сидорович', trip_count: 1}
// З: {employee: 'Петров Петр Петрович', trip_count: 1}

// Most Popular Destinations:
// (5) [{…}, {…}, {…}, {…}, {…}]
// 0: {destination: 'Санкт-Петербург', trip_count: 1}
// 1: {destination: 'Новосибирск', trip_count: 1}
// 2: {destination: 'MockBa', trip_count: 1}
// 3: {destination: 'Ka3aHb', trip_count: 1}
// 4: {destination: 'Екатеринбург', trip_count: 1}

// Average Expense per Trip: 12960

const AnalyticsPage = () => {
  const [totalExpenses, setTotalExpenses] = useState(null);
  const [expensesByEmployee, setExpensesByEmployee] = useState(null);
  const [expensesByExpenseType, setExpensesByExpenseType] = useState(null);
  const [employeesWithMostTrips, setEmployeesWithMostTrips] = useState(null);
  const [mostPopularDestinations, setMostPopularDestinations] = useState(null);
  const [averageExpensePerTrip, setAverageExpensePerTrip] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    setLoading(true);

    const cachedAnalyticsData = sessionStorage.getItem("analyticsData");

    if (cachedAnalyticsData) {
      console.log("Данные аналитики взяты из кэша");
      const data = JSON.parse(cachedAnalyticsData);
      setTotalExpenses(data.total_expenses);
      setExpensesByEmployee(data.expenses_by_employee);
      setExpensesByExpenseType(data.expenses_by_expense_type);
      setEmployeesWithMostTrips(data.employees_with_most_trips);
      setMostPopularDestinations(data.most_popular_destinations);
      setAverageExpensePerTrip(data.average_expense_per_trip);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:8000/analytics/all_analytics"
      );
      const data = response.data;
      setTotalExpenses(data.total_expenses);
      setExpensesByEmployee(data.expenses_by_employee);
      setExpensesByExpenseType(data.expenses_by_expense_type);
      setEmployeesWithMostTrips(data.employees_with_most_trips);
      setMostPopularDestinations(data.most_popular_destinations);
      setAverageExpensePerTrip(data.average_expense_per_trip);
      sessionStorage.setItem("analyticsData", JSON.stringify(data));
      console.log("Данные аналитики загружены с сервера и закэшированы");
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Преобразование данных для Recharts
  const expensesByEmployeeChartData = expensesByEmployee?.map((e) => ({
    name: e.employee,
    Расходы: e.total_expenses,
  }));

  const expensesByExpenseTypeChartData = expensesByExpenseType?.map((e) => ({
    name: e.expense_type,
    value: e.total_expenses,
  }));

  const mostPopularDestinationsChartData = mostPopularDestinations?.map(
    (d) => ({
      name: d.destination,
      Поездки: d.trip_count,
    })
  );

  const employeesWithMostTripsChartData = employeesWithMostTrips?.map((e) => ({
    name: e.employee,
    value: e.trip_count,
  }));

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#AF19FF",
    "#FF19A3",
  ];

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Аналитика расходов
      </Typography>

      <Grid container spacing={4}>
        {/* Общие расходы и Средний расход на поездку - без изменений */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Общие расходы" />
            <CardContent>
              <Typography variant="h5">
                {totalExpenses ? `${totalExpenses} ₽` : "Нет данных"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Средний расход на поездку" />
            <CardContent>
              <Typography variant="h5">
                {averageExpensePerTrip
                  ? `${averageExpensePerTrip} ₽`
                  : "Нет данных"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* График: Расходы сотрудников (Treemap) */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Расходы сотрудников" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <Treemap
                  data={expensesByEmployeeChartData}
                  dataKey="Расходы"
                  nameKey="name"
                  ratio={4 / 3}
                  stroke="#fff"
                  fill="#8884d8"
                  content={<CustomizedContent colors={COLORS} />}
                >
                  <Tooltip />
                </Treemap>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* График: Расходы по категориям - без изменений */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Расходы по категориям" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByExpenseTypeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {expensesByExpenseTypeChartData?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* График: Популярные направления (Bar Chart с целыми числами) */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Популярные направления" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mostPopularDestinationsChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    allowDecimals={false} // Убираем дробные значения на оси Y
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Поездки" fill="#82ca9d">
                    <LabelList
                      dataKey="Поездки"
                      position="top"
                      style={{ fill: "#000" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* График: Сотрудники с наибольшим количеством поездок */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Сотрудники с наибольшим количеством поездок" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={employeesWithMostTripsChartData}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Поездки">
                    <LabelList
                      dataKey="value"
                      position="right"
                      style={{ fill: "#000" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Кастомный компонент для отображения лейблов в Treemap
const CustomizedContent = (props) => {
  const { root, depth, x, y, width, height, index, colors, name, value } =
    props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill:
            depth < 2
              ? colors[Math.floor((index / root.children.length) * 6)]
              : "none",
          stroke: "#fff",
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 1 ? (
        <text
          x={x + width / 2}
          y={y + height / 2 + 7}
          textAnchor="middle"
          fill="#fff"
          fontSize={14}
        >
          {name}
        </text>
      ) : null}
      {depth === 1 ? (
        <text x={x + 4} y={y + 18} fill="#fff" fontSize={16} fillOpacity={0.9}>
          {value}
        </text>
      ) : null}
    </g>
  );
};

export default AnalyticsPage;

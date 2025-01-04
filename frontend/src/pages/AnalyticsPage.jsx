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
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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

const AnalyticsPage = () => {
  const [totalExpenses, setTotalExpenses] = useState(null);
  const [expensesByEmployee, setExpensesByEmployee] = useState(null);
  const [expensesByExpenseType, setExpensesByExpenseType] = useState(null);
  const [employeesWithMostTrips, setEmployeesWithMostTrips] = useState(null);
  const [mostPopularDestinations, setMostPopularDestinations] = useState(null);
  const [averageExpensePerTrip, setAverageExpensePerTrip] = useState(null);

  const [loading, setLoading] = useState(true);
  const [selectedReportType, setSelectedReportType] = useState("text");
  const [selectedDataType, setSelectedDataType] = useState("all");

  const fetchAnalyticsData = async () => {
    setLoading(true);

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

      console.log("Данные аналитики загружены с сервера");
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleDownloadReport = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/analytics/report/${selectedReportType}/${selectedDataType}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      if (selectedReportType === "text") {
        link.setAttribute("download", "report.txt");
      } else if (selectedReportType === "json") {
        link.setAttribute("download", "report.json");
      }
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
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

  const downloadReportSection = (
    <Card>
      <CardHeader title="Скачать отчеты" />
      <CardContent>
        <FormControl style={{ marginRight: 20, minWidth: 120 }}>
          <InputLabel id="report-type-label">Тип отчета</InputLabel>
          <Select
            labelId="report-type-label"
            value={selectedReportType}
            label="Тип отчета"
            onChange={(e) => setSelectedReportType(e.target.value)}
          >
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="json">JSON</MenuItem>
          </Select>
        </FormControl>

        <FormControl style={{ marginRight: 20, minWidth: 200 }}>
          <InputLabel id="data-type-label">Данные</InputLabel>
          <Select
            labelId="data-type-label"
            value={selectedDataType}
            label="Данные"
            onChange={(e) => setSelectedDataType(e.target.value)}
          >
            <MenuItem value="all">Все данные</MenuItem>
            <MenuItem value="total_expenses">Общие расходы</MenuItem>
            <MenuItem value="expenses_by_employee">
              Расходы по сотрудникам
            </MenuItem>
            <MenuItem value="expenses_by_expense_type">
              Расходы по типам
            </MenuItem>
            <MenuItem value="employees_with_most_trips">
              Сотрудники с большим количеством поездок
            </MenuItem>
            <MenuItem value="most_popular_destinations">
              Самые частые направления
            </MenuItem>
            <MenuItem value="average_expense_per_trip">
              Средние расходы на поездку
            </MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={handleDownloadReport}
        >
          Скачать
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Аналитика расходов
      </Typography>

      <Grid container spacing={4}>
        {/* Общие расходы и Средний расход на поездку */}
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
                >
                  <Tooltip />
                </Treemap>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* График: Расходы по категориям */}
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

        {/* Секция для скачивания отчетов */}
        <Grid item xs={12}>
          {downloadReportSection}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;

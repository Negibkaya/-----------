import { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { Box, Typography, Grid, Paper, CircularProgress } from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsPage = () => {
  const [totalExpenses, setTotalExpenses] = useState(null);
  const [expensesByEmployee, setExpensesByEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const totalExpensesResponse = await axios.get(
        "http://localhost:8000/analytics/total-expenses"
      );
      setTotalExpenses(totalExpensesResponse.data);
      console.log("Total Expenses:", totalExpensesResponse.data);

      const expensesByEmployeeResponse = await axios.get(
        "http://localhost:8000/analytics/expenses-by-employee"
      );
      setExpensesByEmployee(expensesByEmployeeResponse.data);
      console.log("Expenses by Employee:", expensesByEmployeeResponse.data);
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

  return (
    <div>
      {totalExpenses && (
        <Typography variant="h6">
          Total Expenses: {JSON.stringify(totalExpenses)}
        </Typography>
      )}
      {expensesByEmployee && (
        <Typography variant="h6">
          Expenses by Employee: {JSON.stringify(expensesByEmployee)}
        </Typography>
      )}
    </div>
  );
};

export default AnalyticsPage;

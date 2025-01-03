import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import EmployeesPage from "./pages/EmployeesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ExpenseTypesPage from "./pages/ExpenseTypePage";
import BusinessTripsPage from "./pages/BusinessTripsPage";
import ExpensesPage from "./pages/ExpensesPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<AnalyticsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="expense-types" element={<ExpenseTypesPage />} />
          <Route path="business-trips" element={<BusinessTripsPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

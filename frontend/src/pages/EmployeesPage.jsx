import axios from "axios";
import { useState, useEffect } from "react";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:8000/employees/");
      setEmployees(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div>
      {employees.map((employee) => (
        <div key={employee.id}>
          <h2>{employee.fio}</h2>
          <p>Business Trips:</p>
          <ul>
            {employee.business_trips.map((trip) => (
              <li key={trip.id}>
                <p>Destination: {trip.destination}</p>
                <p>Start Date: {formatDate(trip.start_trip)}</p>
                <p>End Date: {formatDate(trip.end_trip)}</p>
                <p>Expenses:</p>
                <ul>
                  {trip.expenses.map((expense) => (
                    <li key={expense.id}>
                      <p>Expense Type: {expense.expense_type.name}</p>
                      <p>Amount: {expense.amount}</p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default EmployeesPage;

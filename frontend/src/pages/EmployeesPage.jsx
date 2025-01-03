import axios from "axios";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [editEmployeeName, setEditEmployeeName] = useState("");

  const fetchEmployees = async () => {
    const cachedEmployees = sessionStorage.getItem("employeesData");

    if (cachedEmployees) {
      console.log("Данные сотрудников взяты из кэша");
      setEmployees(JSON.parse(cachedEmployees));
      return;
    }

    try {
      const response = await axios.get("http://localhost:8000/employees/");
      setEmployees(response.data);
      sessionStorage.setItem("employeesData", JSON.stringify(response.data));
      console.log("Данные сотрудников загружены с сервера и закэшированы");
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Функции для открытия/закрытия диалоговых окон
  const handleCreateDialogOpen = () => setOpenCreateDialog(true);
  const handleCreateDialogClose = () => {
    setOpenCreateDialog(false);
    setNewEmployeeName("");
  };
  const handleEditDialogOpen = (employee) => {
    setSelectedEmployee(employee);
    setEditEmployeeName(employee.fio);
    setOpenEditDialog(true);
  };
  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setSelectedEmployee(null);
    setEditEmployeeName("");
  };
  const handleDeleteDialogOpen = (employee) => {
    setSelectedEmployee(employee);
    setOpenDeleteDialog(true);
  };
  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setSelectedEmployee(null);
  };

  // CRUD операции
  const handleCreateEmployee = async () => {
    try {
      const response = await axios.post("http://localhost:8000/employees/", {
        fio: newEmployeeName,
      });
      setEmployees([...employees, response.data]);
      // Очищаем кэш после добавления нового сотрудника
      sessionStorage.removeItem("employeesData");
      handleCreateDialogClose();
    } catch (error) {
      console.error("Error creating employee:", error);
    }
  };

  const handleUpdateEmployee = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8000/employees/${selectedEmployee.id}`,
        {
          fio: editEmployeeName,
        }
      );
      setEmployees(
        employees.map((e) => (e.id === selectedEmployee.id ? response.data : e))
      );
      // Очищаем кэш после обновления сотрудника
      sessionStorage.removeItem("employeesData");
      handleEditDialogClose();
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      await axios.delete(
        `http://localhost:8000/employees/${selectedEmployee.id}`
      );
      setEmployees(employees.filter((e) => e.id !== selectedEmployee.id));
      // Очищаем кэш после удаления сотрудника
      sessionStorage.removeItem("employeesData");
      handleDeleteDialogClose();
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Сотрудники
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
        >
          Добавить сотрудника
        </Button>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>ФИО</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.id}</TableCell>
                  <TableCell>{employee.fio}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleEditDialogOpen(employee)}
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteDialogOpen(employee)}
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Диалог создания сотрудника */}
        <Dialog open={openCreateDialog} onClose={handleCreateDialogClose}>
          <DialogTitle>Добавить сотрудника</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Введите ФИО нового сотрудника:
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="ФИО"
              type="text"
              fullWidth
              value={newEmployeeName}
              onChange={(e) => setNewEmployeeName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateDialogClose}>Отмена</Button>
            <Button onClick={handleCreateEmployee} disabled={!newEmployeeName}>
              Добавить
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалог редактирования сотрудника */}
        <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
          <DialogTitle>Редактировать сотрудника</DialogTitle>
          <DialogContent>
            <DialogContentText>Измените ФИО сотрудника:</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="ФИО"
              type="text"
              fullWidth
              value={editEmployeeName}
              onChange={(e) => setEditEmployeeName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditDialogClose}>Отмена</Button>
            <Button onClick={handleUpdateEmployee} disabled={!editEmployeeName}>
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалог удаления сотрудника */}
        <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
          <DialogTitle>Удалить сотрудника</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Вы уверены, что хотите удалить сотрудника {selectedEmployee?.fio}?
              Это действие нельзя отменить.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteDialogClose}>Отмена</Button>
            <Button onClick={handleDeleteEmployee} color="error">
              Удалить
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default EmployeesPage;

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
  FormControl,
  InputLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
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

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [businessTrips, setBusinessTrips] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Поля для создания
  const [newBusinessTripId, setNewBusinessTripId] = useState("");
  const [newExpenseTypeId, setNewExpenseTypeId] = useState("");
  const [newAmount, setNewAmount] = useState("");

  // Поля для редактирования
  const [editBusinessTripId, setEditBusinessTripId] = useState("");
  const [editExpenseTypeId, setEditExpenseTypeId] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const fetchExpenses = async () => {
    try {
      const response = await axios.get("http://localhost:8000/expenses/");
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const fetchBusinessTrips = async () => {
    try {
      const response = await axios.get("http://localhost:8000/business_trips/");
      setBusinessTrips(response.data);
    } catch (error) {
      console.error("Error fetching business trips:", error);
    }
  };

  const fetchExpenseTypes = async () => {
    try {
      const response = await axios.get("http://localhost:8000/expense_types/");
      setExpenseTypes(response.data);
    } catch (error) {
      console.error("Error fetching expense types:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchBusinessTrips();
    fetchExpenseTypes();
  }, []);

  // Функции для открытия/закрытия диалоговых окон
  const handleCreateDialogOpen = () => setOpenCreateDialog(true);
  const handleCreateDialogClose = () => {
    setOpenCreateDialog(false);
    resetCreateForm();
  };
  const handleEditDialogOpen = (expense) => {
    setSelectedExpense(expense);
    setEditBusinessTripId(expense.business_trip_id);
    setEditExpenseTypeId(expense.expense_type_id);
    setEditAmount(expense.amount);
    setOpenEditDialog(true);
  };
  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setSelectedExpense(null);
    resetEditForm();
  };
  const handleDeleteDialogOpen = (expense) => {
    setSelectedExpense(expense);
    setOpenDeleteDialog(true);
  };
  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setSelectedExpense(null);
  };

  // CRUD операции
  const handleCreateExpense = async () => {
    try {
      const response = await axios.post("http://localhost:8000/expenses/", {
        business_trip_id: newBusinessTripId,
        expense_type_id: newExpenseTypeId,
        amount: parseFloat(newAmount),
      });
      setExpenses([...expenses, response.data]);
      handleCreateDialogClose();
    } catch (error) {
      console.error("Error creating expense:", error);
      if (error.response && error.response.data.detail) {
        alert(error.response.data.detail);
      }
    }
  };

  const handleUpdateExpense = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8000/expenses/${selectedExpense.id}`,
        {
          business_trip_id: editBusinessTripId,
          expense_type_id: editExpenseTypeId,
          amount: parseFloat(editAmount),
        }
      );
      setExpenses(
        expenses.map((e) => (e.id === selectedExpense.id ? response.data : e))
      );
      handleEditDialogClose();
    } catch (error) {
      console.error("Error updating expense:", error);
      if (error.response && error.response.data.detail) {
        alert(error.response.data.detail);
      }
    }
  };

  const handleDeleteExpense = async () => {
    try {
      await axios.delete(
        `http://localhost:8000/expenses/${selectedExpense.id}`
      );
      setExpenses(expenses.filter((e) => e.id !== selectedExpense.id));
      handleDeleteDialogClose();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  // Функции для сброса форм
  const resetCreateForm = () => {
    setNewBusinessTripId("");
    setNewExpenseTypeId("");
    setNewAmount("");
  };

  const resetEditForm = () => {
    setEditBusinessTripId("");
    setEditExpenseTypeId("");
    setEditAmount("");
  };

  const getBusinessTripDestinationById = (businessTripId) => {
    const businessTrip = businessTrips.find((bt) => bt.id === businessTripId);
    return businessTrip ? businessTrip.destination : "Неизвестная поездка";
  };

  const getExpenseTypeNameById = (expenseTypeId) => {
    const expenseType = expenseTypes.find((et) => et.id === expenseTypeId);
    return expenseType ? expenseType.name : "Неизвестный тип";
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Расходы
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
        >
          Добавить расход
        </Button>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Командировка</TableCell>
                <TableCell>Тип расхода</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.id}</TableCell>
                  <TableCell>
                    {getBusinessTripDestinationById(expense.business_trip_id)}
                  </TableCell>
                  <TableCell>
                    {getExpenseTypeNameById(expense.expense_type_id)}
                  </TableCell>
                  <TableCell>{expense.amount}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleEditDialogOpen(expense)}
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteDialogOpen(expense)}
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

        {/* Диалог создания расхода */}
        <Dialog open={openCreateDialog} onClose={handleCreateDialogClose}>
          <DialogTitle>Добавить расход</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Заполните информацию о новом расходе:
            </DialogContentText>
            <FormControl fullWidth margin="dense">
              <InputLabel>Командировка</InputLabel>
              <Select
                value={newBusinessTripId}
                onChange={(e) => setNewBusinessTripId(e.target.value)}
                label="Командировка"
              >
                {businessTrips.map((businessTrip) => (
                  <MenuItem key={businessTrip.id} value={businessTrip.id}>
                    {businessTrip.destination}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Тип расхода</InputLabel>
              <Select
                value={newExpenseTypeId}
                onChange={(e) => setNewExpenseTypeId(e.target.value)}
                label="Тип расхода"
              >
                {expenseTypes.map((expenseType) => (
                  <MenuItem key={expenseType.id} value={expenseType.id}>
                    {expenseType.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              autoFocus
              margin="dense"
              label="Сумма"
              type="number"
              fullWidth
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateDialogClose}>Отмена</Button>
            <Button
              onClick={handleCreateExpense}
              disabled={!newBusinessTripId || !newExpenseTypeId || !newAmount}
            >
              Добавить
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалог редактирования расхода */}
        <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
          <DialogTitle>Редактировать расход</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Измените информацию о расходе:
            </DialogContentText>
            <FormControl fullWidth margin="dense">
              <InputLabel>Командировка</InputLabel>
              <Select
                value={editBusinessTripId}
                onChange={(e) => setEditBusinessTripId(e.target.value)}
                label="Командировка"
              >
                {businessTrips.map((businessTrip) => (
                  <MenuItem key={businessTrip.id} value={businessTrip.id}>
                    {businessTrip.destination}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Тип расхода</InputLabel>
              <Select
                value={editExpenseTypeId}
                onChange={(e) => setEditExpenseTypeId(e.target.value)}
                label="Тип расхода"
              >
                {expenseTypes.map((expenseType) => (
                  <MenuItem key={expenseType.id} value={expenseType.id}>
                    {expenseType.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              autoFocus
              margin="dense"
              label="Сумма"
              type="number"
              fullWidth
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditDialogClose}>Отмена</Button>
            <Button
              onClick={handleUpdateExpense}
              disabled={
                !editBusinessTripId || !editExpenseTypeId || !editAmount
              }
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалог удаления расхода */}
        <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
          <DialogTitle>Удалить расход</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Вы уверены, что хотите удалить расход? Это действие нельзя
              отменить.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteDialogClose}>Отмена</Button>
            <Button onClick={handleDeleteExpense} color="error">
              Удалить
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ExpensesPage;

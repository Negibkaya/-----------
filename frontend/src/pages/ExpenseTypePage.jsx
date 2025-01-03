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

const ExpenseTypesPage = () => {
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedExpenseType, setSelectedExpenseType] = useState(null);
  const [newExpenseTypeName, setNewExpenseTypeName] = useState("");
  const [editExpenseTypeName, setEditExpenseTypeName] = useState("");

  const fetchExpenseTypes = async () => {
    const cacheExpenseTypes = sessionStorage.getItem("expenseTypesData");

    if (cacheExpenseTypes) {
      console.log("Данные типов расходов взяты из кэша");
      setExpenseTypes(JSON.parse(cacheExpenseTypes));
      return;
    }

    try {
      const response = await axios.get("http://localhost:8000/expense_types/");
      setExpenseTypes(response.data);
      sessionStorage.setItem("expenseTypesData", JSON.stringify(response.data));
      console.log("Данные типов расходов загружены с сервера и закэшированы");
    } catch (error) {
      console.error("Error fetching expense types:", error);
    }
  };

  useEffect(() => {
    fetchExpenseTypes();
  }, []);

  // Функции для открытия/закрытия диалоговых окон
  const handleCreateDialogOpen = () => setOpenCreateDialog(true);
  const handleCreateDialogClose = () => {
    setOpenCreateDialog(false);
    setNewExpenseTypeName("");
  };
  const handleEditDialogOpen = (expenseType) => {
    setSelectedExpenseType(expenseType);
    setEditExpenseTypeName(expenseType.name);
    setOpenEditDialog(true);
  };
  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setSelectedExpenseType(null);
    setEditExpenseTypeName("");
  };
  const handleDeleteDialogOpen = (expenseType) => {
    setSelectedExpenseType(expenseType);
    setOpenDeleteDialog(true);
  };
  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setSelectedExpenseType(null);
  };

  // CRUD операции
  const handleCreateExpenseType = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/expense_types/",
        {
          name: newExpenseTypeName,
        }
      );
      setExpenseTypes([...expenseTypes, response.data]);
      handleCreateDialogClose();
    } catch (error) {
      console.error("Error creating expense type:", error);
      if (error.response && error.response.data.detail) {
        alert(error.response.data.detail);
      }
    }
  };

  const handleUpdateExpenseType = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8000/expense_types/${selectedExpenseType.id}`,
        {
          name: editExpenseTypeName,
        }
      );
      setExpenseTypes(
        expenseTypes.map((et) =>
          et.id === selectedExpenseType.id ? response.data : et
        )
      );
      handleEditDialogClose();
    } catch (error) {
      console.error("Error updating expense type:", error);
      if (error.response && error.response.data.detail) {
        alert(error.response.data.detail);
      }
    }
  };

  const handleDeleteExpenseType = async () => {
    try {
      await axios.delete(
        `http://localhost:8000/expense_types/${selectedExpenseType.id}`
      );
      setExpenseTypes(
        expenseTypes.filter((et) => et.id !== selectedExpenseType.id)
      );
      handleDeleteDialogClose();
    } catch (error) {
      console.error("Error deleting expense type:", error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Типы расходов
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
        >
          Добавить тип расхода
        </Button>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Название</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenseTypes.map((expenseType) => (
                <TableRow key={expenseType.id}>
                  <TableCell>{expenseType.id}</TableCell>
                  <TableCell>{expenseType.name}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleEditDialogOpen(expenseType)}
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteDialogOpen(expenseType)}
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

        {/* Диалог создания типа расхода */}
        <Dialog open={openCreateDialog} onClose={handleCreateDialogClose}>
          <DialogTitle>Добавить тип расхода</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Введите название нового типа расхода:
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Название"
              type="text"
              fullWidth
              value={newExpenseTypeName}
              onChange={(e) => setNewExpenseTypeName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateDialogClose}>Отмена</Button>
            <Button
              onClick={handleCreateExpenseType}
              disabled={!newExpenseTypeName}
            >
              Добавить
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалог редактирования типа расхода */}
        <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
          <DialogTitle>Редактировать тип расхода</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Измените название типа расхода:
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Название"
              type="text"
              fullWidth
              value={editExpenseTypeName}
              onChange={(e) => setEditExpenseTypeName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditDialogClose}>Отмена</Button>
            <Button
              onClick={handleUpdateExpenseType}
              disabled={!editExpenseTypeName}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалог удаления типа расхода */}
        <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
          <DialogTitle>Удалить тип расхода</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Вы уверены, что хотите удалить тип расхода{" "}
              {selectedExpenseType?.name}? Это действие нельзя отменить.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteDialogClose}>Отмена</Button>
            <Button onClick={handleDeleteExpenseType} color="error">
              Удалить
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ExpenseTypesPage;

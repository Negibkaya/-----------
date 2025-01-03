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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

const BusinessTripsPage = () => {
  const [businessTrips, setBusinessTrips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedBusinessTrip, setSelectedBusinessTrip] = useState(null);

  // Поля для создания
  const [newEmployeeId, setNewEmployeeId] = useState("");
  const [newDestination, setNewDestination] = useState("");
  const [newStartDate, setNewStartDate] = useState(null);
  const [newEndDate, setNewEndDate] = useState(null);

  // Поля для редактирования
  const [editEmployeeId, setEditEmployeeId] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [editStartDate, setEditStartDate] = useState(null);
  const [editEndDate, setEditEndDate] = useState(null);

  const fetchBusinessTrips = async () => {
    const cachedBusinessTrips = sessionStorage.getItem("businessTripsData");

    if (cachedBusinessTrips) {
      console.log("Данные поездок взяты из кэша");
      setBusinessTrips(JSON.parse(cachedBusinessTrips));
      return;
    }

    try {
      const response = await axios.get("http://localhost:8000/business_trips/");
      setBusinessTrips(response.data);
      sessionStorage.setItem(
        "businessTripsData",
        JSON.stringify(response.data)
      );
      console.log("Данные поездок загружены с сервера и закэшированы");
    } catch (error) {
      console.error("Error fetching business trips:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:8000/employees/");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchBusinessTrips();
    fetchEmployees();
  }, []);

  // Функции для открытия/закрытия диалоговых окон
  const handleCreateDialogOpen = () => setOpenCreateDialog(true);
  const handleCreateDialogClose = () => {
    setOpenCreateDialog(false);
    resetCreateForm();
  };
  const handleEditDialogOpen = (businessTrip) => {
    setSelectedBusinessTrip(businessTrip);
    setEditEmployeeId(businessTrip.employee_id);
    setEditDestination(businessTrip.destination);
    setEditStartDate(dayjs(businessTrip.start_trip));
    setEditEndDate(dayjs(businessTrip.end_trip));
    setOpenEditDialog(true);
  };
  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setSelectedBusinessTrip(null);
    resetEditForm();
  };
  const handleDeleteDialogOpen = (businessTrip) => {
    setSelectedBusinessTrip(businessTrip);
    setOpenDeleteDialog(true);
  };
  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setSelectedBusinessTrip(null);
  };

  // CRUD операции
  const handleCreateBusinessTrip = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/business_trips/",
        {
          employee_id: newEmployeeId,
          destination: newDestination,
          start_trip: newStartDate.toISOString(),
          end_trip: newEndDate.toISOString(),
        }
      );
      setBusinessTrips([...businessTrips, response.data]);
      handleCreateDialogClose();
    } catch (error) {
      console.error("Error creating business trip:", error);
      if (error.response && error.response.data.detail) {
        alert(error.response.data.detail);
      }
    }
  };

  const handleUpdateBusinessTrip = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8000/business_trips/${selectedBusinessTrip.id}`,
        {
          employee_id: editEmployeeId,
          destination: editDestination,
          start_trip: editStartDate.toISOString(),
          end_trip: editEndDate.toISOString(),
        }
      );
      setBusinessTrips(
        businessTrips.map((bt) =>
          bt.id === selectedBusinessTrip.id ? response.data : bt
        )
      );
      handleEditDialogClose();
    } catch (error) {
      console.error("Error updating business trip:", error);
      if (error.response && error.response.data.detail) {
        alert(error.response.data.detail);
      }
    }
  };

  const handleDeleteBusinessTrip = async () => {
    try {
      await axios.delete(
        `http://localhost:8000/business_trips/${selectedBusinessTrip.id}`
      );
      setBusinessTrips(
        businessTrips.filter((bt) => bt.id !== selectedBusinessTrip.id)
      );
      handleDeleteDialogClose();
    } catch (error) {
      console.error("Error deleting business trip:", error);
    }
  };

  // Вспомогательные функции для форматирования даты
  const formatDate = (dateString) => {
    return dayjs(dateString).format("DD.MM.YYYY");
  };

  // Функции для сброса форм
  const resetCreateForm = () => {
    setNewEmployeeId("");
    setNewDestination("");
    setNewStartDate(null);
    setNewEndDate(null);
  };

  const resetEditForm = () => {
    setEditEmployeeId("");
    setEditDestination("");
    setEditStartDate(null);
    setEditEndDate(null);
  };

  const getEmployeeNameById = (employeeId) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee ? employee.fio : "Неизвестный сотрудник";
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Командировки
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateDialogOpen}
          >
            Добавить командировку
          </Button>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Сотрудник</TableCell>
                  <TableCell>Место назначения</TableCell>
                  <TableCell>Дата начала</TableCell>
                  <TableCell>Дата окончания</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {businessTrips.map((businessTrip) => (
                  <TableRow key={businessTrip.id}>
                    <TableCell>{businessTrip.id}</TableCell>
                    <TableCell>
                      {getEmployeeNameById(businessTrip.employee_id)}
                    </TableCell>
                    <TableCell>{businessTrip.destination}</TableCell>
                    <TableCell>{formatDate(businessTrip.start_trip)}</TableCell>
                    <TableCell>{formatDate(businessTrip.end_trip)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleEditDialogOpen(businessTrip)}
                        aria-label="edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteDialogOpen(businessTrip)}
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

          {/* Диалог создания командировки */}
          <Dialog open={openCreateDialog} onClose={handleCreateDialogClose}>
            <DialogTitle>Добавить командировку</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Заполните информацию о новой командировке:
              </DialogContentText>
              <FormControl fullWidth margin="dense">
                <InputLabel>Сотрудник</InputLabel>
                <Select
                  value={newEmployeeId}
                  onChange={(e) => setNewEmployeeId(e.target.value)}
                  label="Сотрудник"
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.fio}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                autoFocus
                margin="dense"
                label="Место назначения"
                type="text"
                fullWidth
                value={newDestination}
                onChange={(e) => setNewDestination(e.target.value)}
              />
              <DatePicker
                label="Дата начала"
                value={newStartDate}
                onChange={(newValue) => setNewStartDate(newValue)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin="dense" />
                )}
              />
              <DatePicker
                label="Дата окончания"
                value={newEndDate}
                onChange={(newValue) => setNewEndDate(newValue)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin="dense" />
                )}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCreateDialogClose}>Отмена</Button>
              <Button
                onClick={handleCreateBusinessTrip}
                disabled={
                  !newEmployeeId ||
                  !newDestination ||
                  !newStartDate ||
                  !newEndDate
                }
              >
                Добавить
              </Button>
            </DialogActions>
          </Dialog>

          {/* Диалог редактирования командировки */}
          <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
            <DialogTitle>Редактировать командировку</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Измените информацию о командировке:
              </DialogContentText>
              <FormControl fullWidth margin="dense">
                <InputLabel>Сотрудник</InputLabel>
                <Select
                  value={editEmployeeId}
                  onChange={(e) => setEditEmployeeId(e.target.value)}
                  label="Сотрудник"
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.fio}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                autoFocus
                margin="dense"
                label="Место назначения"
                type="text"
                fullWidth
                value={editDestination}
                onChange={(e) => setEditDestination(e.target.value)}
              />
              <DatePicker
                label="Дата начала"
                value={editStartDate}
                onChange={(newValue) => setEditStartDate(newValue)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin="dense" />
                )}
              />
              <DatePicker
                label="Дата окончания"
                value={editEndDate}
                onChange={(newValue) => setEditEndDate(newValue)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin="dense" />
                )}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditDialogClose}>Отмена</Button>
              <Button
                onClick={handleUpdateBusinessTrip}
                disabled={
                  !editEmployeeId ||
                  !editDestination ||
                  !editStartDate ||
                  !editEndDate
                }
              >
                Сохранить
              </Button>
            </DialogActions>
          </Dialog>

          {/* Диалог удаления командировки */}
          <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
            <DialogTitle>Удалить командировку</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Вы уверены, что хотите удалить командировку? Это действие нельзя
                отменить.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteDialogClose}>Отмена</Button>
              <Button onClick={handleDeleteBusinessTrip} color="error">
                Удалить
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default BusinessTripsPage;

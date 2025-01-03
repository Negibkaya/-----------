import { NavLink, Outlet } from "react-router-dom";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";
import FlightIcon from "@mui/icons-material/Flight";
import PaidIcon from "@mui/icons-material/Paid";

const Layout = () => {
  return (
    <div className="flex min-h-screen">
      <aside className="bg-beige-100 w-64 p-4 shadow-md fixed top-1/2 transform -translate-y-1/2">
        <nav>
          <ul className="list-none p-0 m-0">
            <li className="mb-4">
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `flex items-center p-2 rounded text-gray-700 hover:bg-beige-200 transition-colors ${
                    isActive ? "bg-beige-300 font-semibold text-gray-900" : ""
                  }`
                }
              >
                <AnalyticsIcon className="mr-2" />
                Аналитика
              </NavLink>
            </li>
            <li className="mb-4">
              <NavLink
                to="/employees"
                className={({ isActive }) =>
                  `flex items-center p-2 rounded text-gray-700 hover:bg-beige-200 transition-colors ${
                    isActive ? "bg-beige-300 font-semibold text-gray-900" : ""
                  }`
                }
              >
                <PeopleIcon className="mr-2" />
                Сотрудники
              </NavLink>
            </li>
            <li className="mb-4">
              <NavLink
                to="/expense-types"
                className={({ isActive }) =>
                  `flex items-center p-2 rounded text-gray-700 hover:bg-beige-200 transition-colors ${
                    isActive ? "bg-beige-300 font-semibold text-gray-900" : ""
                  }`
                }
              >
                <CategoryIcon className="mr-2" />
                Типы расходов
              </NavLink>
            </li>
            <li className="mb-4">
              <NavLink
                to="/business-trips"
                className={({ isActive }) =>
                  `flex items-center p-2 rounded text-gray-700 hover:bg-beige-200 transition-colors ${
                    isActive ? "bg-beige-300 font-semibold text-gray-900" : ""
                  }`
                }
              >
                <FlightIcon className="mr-2" />
                Командировки
              </NavLink>
            </li>
            <li className="mb-4">
              <NavLink
                to="/expenses"
                className={({ isActive }) =>
                  `flex items-center p-2 rounded text-gray-700 hover:bg-beige-200 transition-colors ${
                    isActive ? "bg-beige-300 font-semibold text-gray-900" : ""
                  }`
                }
              >
                <PaidIcon className="mr-2" />
                Расходы
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-4 ml-64">
        {" "}
        {/* Добавили margin-left чтобы контент не перекрывался */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

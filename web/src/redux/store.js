import { configureStore } from "@reduxjs/toolkit";
import companiesReducer from "./slice/companiesSilce";
import employeesReducer from "./slice/employeesSlice";
import branchesReducer from "./slice/branchesSlice";
import positionsReducer from "./slice/positionsSlice";
import divisionsReducer from "./slice/divisionsSlice";
import vlansReducer from "./slice/vlansSlice";
import ipsReducer from "./slice/ipsSlice";
export const store = configureStore({
  reducer: {
    companies: companiesReducer,
    employees: employeesReducer,
    branches: branchesReducer,
    positions: positionsReducer,
    divisions: divisionsReducer,
    vlans: vlansReducer,
    ips: ipsReducer,
  },
});
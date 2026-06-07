import { configureStore } from "@reduxjs/toolkit";
import companiesReducer from "./slice/companiesSilce";
import employeesReducer from "./slice/employeesSlice";
import branchesReducer from "./slice/branchesSlice";
import positionsReducer from "./slice/positionsSlice";
import vlansReducer from "./slice/vlansSlice";
import ipsReducer from "./slice/ipsSlice";
import employeesViettelReducer from "./slice/employeesViettelSlice";
import viettelBranchReducer from "./slice/viettelBranchSlice";
import accountsReducer from "./slice/accountsSlice";
import departmentsReducer from "./slice/departmentsSlice";
import authReducer from "./slice/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    companies: companiesReducer,
    employees: employeesReducer,
    employeesViettel: employeesViettelReducer,
    viettelBranch: viettelBranchReducer,
    branches: branchesReducer,
    positions: positionsReducer,
    vlans: vlansReducer,
    ips: ipsReducer,
    accounts: accountsReducer,
    departments: departmentsReducer,
  },
});
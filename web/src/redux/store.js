
import { configureStore } from "@reduxjs/toolkit";
import companiesReducer from "./slice";
import employeesReducer from "./slice/employeesSlice";

export const store = configureStore({
  reducer: {
    companies: companiesReducer,
    employees: employeesReducer,
  },
});
import axios from "axios";

  export const EmployeeViettelAPI = {
    // GET list
    getLists: async () => {
      const res = await axios.get(`/viettel-employees/`);
      return res.data;
    },

    // CREATE
    create: async (payload) => {
      const res = await axios.post(`/viettel-employees/create`, payload);
      return res.data;
    },

    // UPDATE
    update: async ( payload) => {
      const res = await axios.put(`/viettel-employees/update`, payload);
      return res.data;
    },

    // DELETE
    delete: async (payload) => {
      const res = await axios.delete(`/viettel-employees/${payload}`);
      return res.data;
    },
  };
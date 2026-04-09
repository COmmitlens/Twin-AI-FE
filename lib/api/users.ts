import api from "@/lib/axios";
import { UserDataResponse, UpdateUserParam } from "@/lib/types/workspace";

export const userAPI = {
  async getUser() {
    const response = await api.get<UserDataResponse>("/user/get-user");
    return response.data;
  },

  async updateProfile(params: UpdateUserParam) {
    const response = await api.post("/user/update-profile", params);
    return response.data;
  },
};

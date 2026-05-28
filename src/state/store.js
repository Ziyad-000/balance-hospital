import { configureStore } from "@reduxjs/toolkit"

import modeSlice from "./slices/mode"
import authSlice from "./slices/auth"
import categorySlice from "./slices/category"
import departmentSlice from "./slices/department"
import shiftHoursTypeSlice from "./slices/shiftHours"
import subDepartmentSlice from "./slices/subDepartment"
import contractingTypeSlice from "./slices/contractingType"
import scientificDegreeSlice from "./slices/scientificDegree"
import managementRolesSlice from "./slices/managementRole"
import userSlice from "./slices/user"
import usersReducer from "./slices/users"
import rosterManagementSlice from "./slices/roster"
import notificationsSlice from "./slices/notification"
import reportSlice from "./slices/reports"
import leavesSlice from "./slices/leaves"
import profileReducer from "./slices/profile"
export const store = configureStore({
  reducer: {
    mode: modeSlice,
    auth: authSlice,
    profile: profileReducer,
    category: categorySlice,
    department: departmentSlice,
    subDepartment: subDepartmentSlice,
    contractingType: contractingTypeSlice,
    scientificDegree: scientificDegreeSlice,
    shiftHour: shiftHoursTypeSlice,
    managementRoles: managementRolesSlice,

    // القديم لو فيه صفحات شغالة عليه
    user: userSlice,

    // الجديد لقسم Users اللي بنعمله دلوقتي
    users: usersReducer,

    rosterManagement: rosterManagementSlice,
    notifications: notificationsSlice,
    reports: reportSlice,
    leaves: leavesSlice,
  },
})
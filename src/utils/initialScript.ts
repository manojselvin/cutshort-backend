import { constants } from "../config/constants";
import Role from "../models/Role";

export const addUserRoles = () => {
    Object.values(constants.ROLES).map(async (roleName) => {
        const role = await Role.findOne({name: roleName}).exec();

        if (role == null) { 
            await new Role({ name: roleName }).save();
            console.log(`New Role ${roleName} added to the system`);
        }

    });
};
package syshosp.data.request.admin;

import syshosp.access.EnumAPIRole;

public class RoleChangeRequestData
{
    private int user;

    private EnumAPIRole newRole;

    public int getUser()
    {
        return this.user;
    }

    public EnumAPIRole getNewRole()
    {
        return this.newRole;
    }
}

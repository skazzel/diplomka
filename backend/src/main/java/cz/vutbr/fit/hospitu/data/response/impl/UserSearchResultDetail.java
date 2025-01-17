package cz.vutbr.fit.hospitu.data.response.impl;

import cz.vutbr.fit.hospitu.access.EnumAPIRole;
import org.jetbrains.annotations.NotNull;

public class UserSearchResultDetail extends UserSearchResult
{

    public UserSearchResultDetail(int id, @NotNull String name, @NotNull String surname, @NotNull EnumAPIRole role)
    {
        super(id, name, surname, role);
    }
}

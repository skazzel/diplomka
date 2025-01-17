package cz.vutbr.fit.hospitu.data.response.impl;

import org.jetbrains.annotations.NotNull;

public class ExtendedUserResponseData extends UserResponseData
{

    public ExtendedUserResponseData(int id,
                                    @NotNull String login,
                                    @NotNull String name,
                                    @NotNull String surname,
                                    @NotNull String role)
    {
        super(id, login, name, surname, role);
    }
}

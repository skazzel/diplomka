package syshosp.data.response.generic;

import org.jetbrains.annotations.NotNull;

public class Generic404ResponseData extends AbstractGenericCodeResponseData
{
    public Generic404ResponseData(@NotNull String message)
    {
        super(404, message);
    }
}

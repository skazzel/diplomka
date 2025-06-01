package syshosp.data.response.impl.doctor;

import syshosp.data.response.generic.AbstractGenericCodeResponseData;
import org.jetbrains.annotations.NotNull;

public class HumanReadableResponseData extends AbstractGenericCodeResponseData
{
    @NotNull
    private final String humanReadableMessage;

    public HumanReadableResponseData(int code, @NotNull String message, @NotNull String humanReadableMessage)
    {
        super(code, message);

        this.humanReadableMessage = humanReadableMessage;
    }

    public @NotNull String getHumanReadableMessage()
    {
        return this.humanReadableMessage;
    }
}

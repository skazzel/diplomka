package syshosp.data.response.impl.doctor;
import syshosp.data.response.generic.AbstractGenericCodeResponseData;

public class TicketUpdateResponseData extends AbstractGenericCodeResponseData {
    public TicketUpdateResponseData()
    {
        super(200, "Ticket Updated.");
    }
}

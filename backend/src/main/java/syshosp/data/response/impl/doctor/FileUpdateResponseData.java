package syshosp.data.response.impl.doctor;
import syshosp.data.response.generic.AbstractGenericCodeResponseData;

public class FileUpdateResponseData extends AbstractGenericCodeResponseData {
    public FileUpdateResponseData()
    {
        super(200, "File Updated.");
    }

}

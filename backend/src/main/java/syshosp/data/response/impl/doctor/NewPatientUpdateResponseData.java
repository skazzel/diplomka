package syshosp.data.response.impl.doctor;
import syshosp.data.response.generic.AbstractGenericCodeResponseData;

public class NewPatientUpdateResponseData extends AbstractGenericCodeResponseData {
    public NewPatientUpdateResponseData(){
        super(200, "Patient created.");
    }
}

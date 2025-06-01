package syshosp.data.response.impl.doctor;

import syshosp.data.response.generic.AbstractGenericCodeResponseData;

public class UnPatientsUpdateResponseData extends AbstractGenericCodeResponseData {
    public UnPatientsUpdateResponseData(){
        super(200, "Patient moved.");
    }
}

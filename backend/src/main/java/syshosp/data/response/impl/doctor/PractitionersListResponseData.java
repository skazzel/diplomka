package syshosp.data.response.impl.doctor;

import syshosp.data.response.AbstractResponseData;

import java.util.List;

public class PractitionersListResponseData extends AbstractResponseData {
    private final List<PractitionersResponseData> practitionersList;

    public PractitionersListResponseData(List<PractitionersResponseData> practitionersList){
        super(200);
        this.practitionersList = practitionersList;
    }

    public List<PractitionersResponseData> getPractitionersList() {
        return this.practitionersList;
    }
    
}

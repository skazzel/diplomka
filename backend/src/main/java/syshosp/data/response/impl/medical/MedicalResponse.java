package syshosp.data.response.impl.medical;

public class MedicalResponse {
    int medication_id;
    String name;

    public MedicalResponse(int medication_id, String name) {
        this.medication_id = medication_id;
        this.name = name;
    }

    public int getId() {
        return medication_id;
    }

    public String getMedicine() {
        return name;
    }
}
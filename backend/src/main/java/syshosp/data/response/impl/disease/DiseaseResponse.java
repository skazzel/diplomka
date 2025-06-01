package syshosp.data.response.impl.disease;

public class DiseaseResponse {
    int id;
    String name;

    public DiseaseResponse(int id, String name) {
        this.id = id;
        this.name = name;

    }

    public int getId() {
        return id;
    }

    public String getDisease() {
        return name;
    }
}
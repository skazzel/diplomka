package cz.vutbr.fit.hospitu.data.response.impl.patient;

public class AllergySymptomResponse {
    int id;
    String name;

    public AllergySymptomResponse(int id, String name) {
        this.id = id;
        this.name = name;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}

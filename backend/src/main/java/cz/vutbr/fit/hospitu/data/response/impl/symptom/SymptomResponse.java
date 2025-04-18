package cz.vutbr.fit.hospitu.data.response.impl.symptom;

public class SymptomResponse {
    int id;
    String symptom;
    String type;

    public SymptomResponse(int id, String symptom, String type) {
        this.id = id;
        this.symptom = symptom;
        this.type = type;
    }

    public int getId() {
        return id;
    }

    public String getSymptom() {
        return symptom;
    }

    public String getType() { return type; }
}
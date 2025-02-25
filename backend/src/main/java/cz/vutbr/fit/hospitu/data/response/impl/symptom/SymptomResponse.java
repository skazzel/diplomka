package cz.vutbr.fit.hospitu.data.response.impl.symptom;

public class SymptomResponse {
    int id;
    String symptom;

    public SymptomResponse(int id, String symptom) {
        this.id = id;
        this.symptom = symptom;
    }

    public int getId() {
        return id;
    }

    public String getSymptom() {
        return symptom;
    }
}
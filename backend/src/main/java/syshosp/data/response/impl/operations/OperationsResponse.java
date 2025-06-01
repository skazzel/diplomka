package syshosp.data.response.impl.operations;

public class OperationsResponse {
    int id;
    String name;

    public OperationsResponse(int id, String name) {
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
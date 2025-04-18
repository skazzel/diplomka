package cz.vutbr.fit.hospitu.controller.SymptomController;
import cz.vutbr.fit.hospitu.data.response.impl.disease.DiseaseResponse;
import cz.vutbr.fit.hospitu.data.response.impl.symptom.SymptomResponse;
import cz.vutbr.fit.hospitu.sql.SQLConnection;
import io.javalin.http.Context;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class DiseaseController {

    public static void getDisease(Context context) {
        String diseaseName = context.queryParam("disease");

        // ✅ Check if the query parameter is null or empty
        if (diseaseName == null || diseaseName.trim().isEmpty()) {
            System.out.println("Error: Missing or empty disease parameter.");
            context.status(400).json("{\"error\": \"Missing or empty disease parameter.\"}");
            return;
        }

        try (Connection connection = SQLConnection.create()) {
            String sql = """
                SELECT id, name FROM chronical_diseases WHERE name LIKE ?
            """;

            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                statement.setString(1, diseaseName + "%");// ✅ Prevents 'null' being passed in query

                System.out.println("Executing query: " + statement.toString()); // ✅ Debugging log

                ResultSet result = statement.executeQuery();
                List<DiseaseResponse> diseases = new ArrayList<>();

                while (result.next()) {
                    diseases.add(new DiseaseResponse(
                            result.getInt("id"),
                            result.getString("name")
                    ));
                }

                if (diseases.isEmpty()) {
                    System.out.println("No diseases found for: '" + diseaseName + "'"); // ✅ Debugging log
                    context.status(404).json("{\"message\": \"No diseases found.\"}");
                } else {
                    System.out.println("Found " + diseases.size() + " diseases.");
                    context.status(200).json(diseases);
                }
            }
        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage()); // ✅ Better logging for debugging
            e.printStackTrace();
            context.status(500).json("{\"error\": \"Database error.\"}");
        }
    }
}


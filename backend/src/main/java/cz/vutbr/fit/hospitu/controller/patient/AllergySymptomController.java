package cz.vutbr.fit.hospitu.controller.patient;

import cz.vutbr.fit.hospitu.data.response.impl.operations.OperationsResponse;
import cz.vutbr.fit.hospitu.data.response.impl.patient.AllergySymptomResponse;
import cz.vutbr.fit.hospitu.sql.SQLConnection;
import io.javalin.http.Context;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class AllergySymptomController {

    public static void getSymptom(Context context) {
        String symptomName = context.queryParam("symptom");

        // ✅ Check if the query parameter is null or empty
        if (symptomName == null || symptomName.trim().isEmpty()) {
            System.out.println("Error: Missing or empty allergy response parameter.");
            context.status(400).json("{\"error\": \"Missing or empty allergy response parameter.\"}");
            return;
        }

        try (Connection connection = SQLConnection.create()) {
            String sql = """
                SELECT id, name FROM allergy_symptoms WHERE name LIKE ?
            """;

            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                statement.setString(1, symptomName + "%");// ✅ Prevents 'null' being passed in query

                System.out.println("Executing query: " + statement.toString()); // ✅ Debugging log

                ResultSet result = statement.executeQuery();
                List<AllergySymptomResponse> allergy_responses = new ArrayList<>();

                while (result.next()) {
                    allergy_responses.add(new AllergySymptomResponse(
                            result.getInt("id"),
                            result.getString("name")
                    ));
                }

                if (allergy_responses.isEmpty()) {
                    System.out.println("No allergy_responses found for: '" + symptomName + "'"); // ✅ Debugging log
                    context.status(404).json("{\"message\": \"No allergy_responses found.\"}");
                } else {
                    System.out.println("Found " + allergy_responses.size() + " allergy_responses.");
                    context.status(200).json(allergy_responses);
                }
            }
        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage()); // ✅ Better logging for debugging
            e.printStackTrace();
            context.status(500).json("{\"error\": \"Database error.\"}");
        }
    }
}


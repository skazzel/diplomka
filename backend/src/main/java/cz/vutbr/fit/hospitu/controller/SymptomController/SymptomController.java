package cz.vutbr.fit.hospitu.controller.SymptomController;

import cz.vutbr.fit.hospitu.data.response.impl.symptom.SymptomResponse;
import cz.vutbr.fit.hospitu.sql.SQLConnection;
import io.javalin.http.Context;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class SymptomController {

    public static void getSymptom(Context context) {
        String symptomName = context.queryParam("symptom");

        // ✅ Check if the query parameter is null or empty
        if (symptomName == null || symptomName.trim().isEmpty()) {
            System.out.println("Error: Missing or empty symptom parameter.");
            context.status(400).json("{\"error\": \"Missing or empty symptom parameter.\"}");
            return;
        }

        try (Connection connection = SQLConnection.create()) {
            String sql = """
                SELECT id, symptom FROM symptoms WHERE symptom LIKE ?
            """;

            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                statement.setString(1, "%" + symptomName + "%"); // ✅ Prevents 'null' being passed in query

                System.out.println("Executing query: " + statement.toString()); // ✅ Debugging log

                ResultSet result = statement.executeQuery();
                List<SymptomResponse> symptoms = new ArrayList<>();

                while (result.next()) {
                    symptoms.add(new SymptomResponse(
                            result.getInt("id"),
                            result.getString("symptom")
                    ));
                }

                if (symptoms.isEmpty()) {
                    System.out.println("No symptoms found for: '" + symptomName + "'"); // ✅ Debugging log
                    context.status(404).json("{\"message\": \"No symptoms found.\"}");
                } else {
                    System.out.println("Found " + symptoms.size() + " symptoms.");
                    context.status(200).json(symptoms);
                }
            }
        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage()); // ✅ Better logging for debugging
            e.printStackTrace();
            context.status(500).json("{\"error\": \"Database error.\"}");
        }
    }
}

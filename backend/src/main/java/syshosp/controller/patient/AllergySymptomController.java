package syshosp.controller.patient;

import syshosp.data.response.impl.patient.AllergySymptomResponse;
import syshosp.sql.SQLConnection;
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
        String lang = context.queryParam("lang", "cs"); // defaultně čeština

        if (symptomName == null || symptomName.trim().isEmpty()) {
            System.out.println("Error: Missing or empty allergy response parameter.");
            context.status(400).json("{\"error\": \"Missing or empty allergy response parameter.\"}");
            return;
        }

        // Mapování jazykových kódů na sloupce v databázi
        String columnName = switch (lang.toLowerCase()) {
            case "en" -> "symptom_en";
            case "de" -> "symptom_de";
            case "ja" -> "symptom_ja";
            case "ua", "uk" -> "symptom_uk";
            default -> "symptom_cz"; // fallback
        };

        try (Connection connection = SQLConnection.create()) {
            String sql = "SELECT id, " + columnName + " AS name FROM allergy_symptoms WHERE " + columnName + " LIKE ?";

            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                statement.setString(1, symptomName + "%");

                System.out.println("Executing query: " + statement);
                ResultSet result = statement.executeQuery();

                List<AllergySymptomResponse> allergy_responses = new ArrayList<>();
                while (result.next()) {
                    allergy_responses.add(new AllergySymptomResponse(
                            result.getInt("id"),
                            result.getString("name")
                    ));
                }

                if (allergy_responses.isEmpty()) {
                    System.out.println("ℹNo allergy responses found for: '" + symptomName + "'");
                    context.status(404).json("{\"message\": \"No allergy responses found.\"}");
                } else {
                    System.out.println("Found " + allergy_responses.size() + " allergy responses.");
                    context.status(200).json(allergy_responses);
                }
            }
        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage());
            e.printStackTrace();
            context.status(500).json("{\"error\": \"Database error.\"}");
        }
    }
}

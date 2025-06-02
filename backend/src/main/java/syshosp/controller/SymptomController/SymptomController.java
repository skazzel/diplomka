package syshosp.controller.SymptomController;

import syshosp.data.response.impl.symptom.SymptomResponse;
import syshosp.sql.SQLConnection;
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
        String lang = context.queryParam("lang", "cs").toLowerCase(); // výchozí jazyk = čeština

        // mapování jazyka na sloupec v databázi
        String column;
        switch (lang) {
            case "en" -> column = "symptom_en";
            case "de" -> column = "symptom_de";
            case "ja" -> column = "symptom_ja";
            case "uk" -> column = "symptom_uk";
            default -> column = "symptom_cz"; // výchozí čeština
        }

        if (symptomName == null || symptomName.trim().isEmpty()) {
            System.out.println("Error: Missing or empty symptom parameter.");
            context.status(400).json("{\"error\": \"Missing or empty symptom parameter.\"}");
            return;
        }

        try (Connection connection = SQLConnection.create()) {
            String sql = "SELECT id, " + column + " AS symptom, type FROM symptoms WHERE " + column + " LIKE ?";

            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                statement.setString(1, symptomName + "%");

                System.out.println("Executing query: " + statement); // pro debug

                ResultSet result = statement.executeQuery();
                List<SymptomResponse> symptoms = new ArrayList<>();

                while (result.next()) {
                    symptoms.add(new SymptomResponse(
                            result.getInt("id"),
                            result.getString("symptom"),
                            result.getString("type")
                    ));
                }

                if (symptoms.isEmpty()) {
                    System.out.println("No symptoms found for: '" + symptomName + "'");
                    context.status(404).json("{\"message\": \"No symptoms found.\"}");
                } else {
                    System.out.println("Found " + symptoms.size() + " symptoms.");
                    context.status(200).json(symptoms);
                }
            }
        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage());
            e.printStackTrace();
            context.status(500).json("{\"error\": \"Database error.\"}");
        }
    }
}

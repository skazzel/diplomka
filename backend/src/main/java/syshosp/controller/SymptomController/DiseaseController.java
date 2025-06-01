package syshosp.controller.SymptomController;

import syshosp.data.response.impl.disease.DiseaseResponse;
import syshosp.sql.SQLConnection;
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
        String lang = context.queryParam("lang", "cs").toLowerCase(); // výchozí jazyk je čeština

        // Ověření jazyka a přiřazení sloupce v databázi
        String columnName;
        switch (lang) {
            case "en" -> columnName = "chronical_en";
            case "de" -> columnName = "chronical_de";
            case "ja" -> columnName = "chronical_ja";
            case "uk" -> columnName = "chronical_uk";
            case "cs" -> columnName = "chronical_cz";
            default -> columnName = "chronical_cz";
        }

        // Ověření vstupního parametru
        if (diseaseName == null || diseaseName.trim().isEmpty()) {
            System.out.println("❌ Missing or empty disease parameter.");
            context.status(400).json("{\"error\": \"Missing or empty disease parameter.\"}");
            return;
        }

        try (Connection connection = SQLConnection.create()) {
            // Dynamické vytvoření SQL dotazu
            String sql = String.format("SELECT id, %s AS disease FROM chronical_diseases WHERE %s LIKE ?", columnName, columnName);

            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                statement.setString(1, diseaseName + "%");

                System.out.println("✅ Executing query: " + statement);

                ResultSet result = statement.executeQuery();
                List<DiseaseResponse> diseases = new ArrayList<>();

                while (result.next()) {
                    diseases.add(new DiseaseResponse(
                            result.getInt("id"),
                            result.getString("disease")
                    ));
                }

                if (diseases.isEmpty()) {
                    System.out.println("ℹ️ No diseases found for: '" + diseaseName + "'");
                    context.status(404).json("{\"message\": \"No diseases found.\"}");
                } else {
                    System.out.println("✅ Found " + diseases.size() + " diseases.");
                    context.status(200).json(diseases);
                }
            }
        } catch (SQLException e) {
            System.err.println("❌ Database error: " + e.getMessage());
            e.printStackTrace();
            context.status(500).json("{\"error\": \"Database error.\"}");
        }
    }
}

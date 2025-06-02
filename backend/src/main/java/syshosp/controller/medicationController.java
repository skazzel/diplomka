package syshosp.controller;
import syshosp.data.response.impl.medical.MedicalResponse;
import syshosp.sql.SQLConnection;
import io.javalin.http.Context;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class medicationController {

    public static void getMedication(Context context) {
        String medicationName = context.queryParam("medication");

        if (medicationName == null || medicationName.trim().isEmpty()) {
            System.out.println("Error: Missing or empty medication parameter.");
            context.status(400).json("{\"error\": \"Missing or empty medication parameter.\"}");
            return;
        }

        try (Connection connection = SQLConnection.create()) {
            String sql = """
                SELECT id, name FROM medications WHERE name LIKE ?
            """;

            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                statement.setString(1, medicationName + "%");

                System.out.println("Executing query: " + statement.toString());

                ResultSet result = statement.executeQuery();
                List<MedicalResponse> medicine = new ArrayList<>();

                while (result.next()) {
                    medicine.add(new MedicalResponse(
                            result.getInt("id"),
                            result.getString("name")
                    ));
                }

                if (medicine.isEmpty()) {
                    System.out.println("No medication found for: '" + medicationName + "'");
                    context.status(404).json("{\"message\": \"No medication found.\"}");
                } else {
                    System.out.println("Found " + medicine.size() + " medication.");
                    context.status(200).json(medicine);
                }
            }
        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage());
            e.printStackTrace();
            context.status(500).json("{\"error\": \"Database error.\"}");
        }
    }
}

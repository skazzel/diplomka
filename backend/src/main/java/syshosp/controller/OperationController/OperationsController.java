package syshosp.controller.OperationController;

import syshosp.data.response.impl.operations.OperationsResponse;
import syshosp.sql.SQLConnection;
import io.javalin.http.Context;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class OperationsController {

    public static void getOperation(Context context) {
        String operationName = context.queryParam("operation");
        String lang = context.queryParam("lang", "cs");

        // Výběr správného sloupce podle jazyka
        String columnName;
        switch (lang.toLowerCase()) {
            case "en":
                columnName = "operation_en";
                break;
            case "de":
                columnName = "operation_de";
                break;
            case "ja":
                columnName = "operation_ja";
                break;
            case "uk":
                columnName = "operation_uk";
                break;
            case "cs":
            default:
                columnName = "operation_cz";
                break;
        }

        if (operationName == null || operationName.trim().isEmpty()) {
            System.out.println("Error: Missing or empty operation parameter.");
            context.status(400).json("{\"error\": \"Missing or empty operation parameter.\"}");
            return;
        }

        try (Connection connection = SQLConnection.create()) {
            // ⚠️ Sloupec musí být zapsán přímo ve stringu – nejde použít parametr v SQL pro název sloupce
            String sql = String.format("SELECT id, %s AS name FROM operations WHERE %s LIKE ?", columnName, columnName);

            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                statement.setString(1, operationName + "%");

                System.out.println("Executing query: " + statement.toString());

                ResultSet result = statement.executeQuery();
                List<OperationsResponse> operations = new ArrayList<>();

                while (result.next()) {
                    operations.add(new OperationsResponse(
                            result.getInt("id"),
                            result.getString("name")
                    ));
                }

                if (operations.isEmpty()) {
                    System.out.println("No operations found for: '" + operationName + "'");
                    context.status(404).json("{\"message\": \"No operations found.\"}");
                } else {
                    System.out.println("Found " + operations.size() + " operations.");
                    context.status(200).json(operations);
                }
            }
        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage());
            e.printStackTrace();
            context.status(500).json("{\"error\": \"Database error.\"}");
        }
    }
}

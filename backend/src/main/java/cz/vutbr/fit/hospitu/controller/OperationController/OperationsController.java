package cz.vutbr.fit.hospitu.controller.OperationController;

import cz.vutbr.fit.hospitu.data.response.impl.operations.OperationsResponse;
import cz.vutbr.fit.hospitu.sql.SQLConnection;
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

        // ✅ Check if the query parameter is null or empty
        if (operationName == null || operationName.trim().isEmpty()) {
            System.out.println("Error: Missing or empty operation parameter.");
            context.status(400).json("{\"error\": \"Missing or empty operation parameter.\"}");
            return;
        }

        try (Connection connection = SQLConnection.create()) {
            String sql = """
                SELECT id, name FROM operations WHERE name LIKE ?
            """;

            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                statement.setString(1, operationName + "%");// ✅ Prevents 'null' being passed in query

                System.out.println("Executing query: " + statement.toString()); // ✅ Debugging log

                ResultSet result = statement.executeQuery();
                List<OperationsResponse> operations = new ArrayList<>();

                while (result.next()) {
                    operations.add(new OperationsResponse(
                            result.getInt("id"),
                            result.getString("name")
                    ));
                }

                if (operations.isEmpty()) {
                    System.out.println("No operations found for: '" + operationName + "'"); // ✅ Debugging log
                    context.status(404).json("{\"message\": \"No operations found.\"}");
                } else {
                    System.out.println("Found " + operations.size() + " operations.");
                    context.status(200).json(operations);
                }
            }
        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage()); // ✅ Better logging for debugging
            e.printStackTrace();
            context.status(500).json("{\"error\": \"Database error.\"}");
        }
    }
}


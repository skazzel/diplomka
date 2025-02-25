package cz.vutbr.fit.hospitu.controller.patient;
import io.javalin.http.Context;
import cz.vutbr.fit.hospitu.sql.SQLConnection;
import io.javalin.http.Context;
import java.sql.*;

public class PatientInfoController {

    public static void createPatient(Context context) {
        String gender = context.queryParam("gender");

        System.out.println("🔹 [DEBUG] Received request to create patient.");
        System.out.println("🔹 [DEBUG] gender: " + gender);

        if (gender == null || gender.isEmpty()) {
            System.out.println("❌ [ERROR] Gender is missing.");
            context.status(400).json("{\"error\": \"Gender is required.\"}");
            return;
        }

        try (Connection conn = SQLConnection.create()) {
            // ✅ Fix: Add missing parameter for gender
            String sql = "INSERT INTO patients (gender, date) VALUES (?, NOW())";

            try (PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                stmt.setString(1, gender);  // ✅ Set the gender parameter

                int rowsAffected = stmt.executeUpdate();
                if (rowsAffected == 0) {
                    System.out.println("❌ [ERROR] Failed to create patient.");
                    context.status(500).json("{\"error\": \"Failed to create patient.\"}");
                    return;
                }

                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        int patientId = rs.getInt(1);
                        System.out.println("✅ [SUCCESS] Created patient with ID: " + patientId);
                        context.status(201).json("{\"patientId\": " + patientId + "}");
                    } else {
                        System.out.println("❌ [ERROR] Failed to retrieve patient ID.");
                        context.status(500).json("{\"error\": \"Failed to retrieve patient ID.\"}");
                    }
                }
            }
        } catch (SQLException e) {
            System.out.println("❌ [ERROR] SQL Exception: " + e.getMessage());
            e.printStackTrace();
            context.status(500).json("{\"error\": \"Database error: " + e.getMessage() + "\"}");
        }
    }


    // ✅ Update existing patient record (age, symptoms, etc.)
    public static void updatePatient(Context context) {
        int patientId = Integer.parseInt(context.formParam("patientId"));
        String age = context.formParam("age");
        String symptoms = context.formParam("symptoms");

        if (patientId <= 0) {
            context.status(400).json("{\"error\": \"Invalid patient ID.\"}");
            return;
        }

        try (Connection conn = SQLConnection.create()) {
            String sql = "UPDATE patients SET age = ?, symptoms = ? WHERE id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, age);
                stmt.setString(2, symptoms);
                stmt.setInt(3, patientId);

                int updated = stmt.executeUpdate();
                if (updated > 0) {
                    context.status(200).json("{\"message\": \"Patient updated successfully.\"}");
                } else {
                    context.status(404).json("{\"error\": \"Patient not found.\"}");
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            context.status(500).json("{\"error\": \"Database error.\"}");
        }
    }
}

package syshosp.controller.patient;
import io.javalin.http.Context;
import syshosp.sql.SQLConnection;

import java.sql.*;
import java.util.*;

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
                        Map<String, Object> response = new HashMap<>();
                        response.put("patientId", patientId);
                        context.status(201).json(response);
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
        String patientIdParam = context.formParam("patientId");
        String ageParam = context.formParam("age");

        if (patientIdParam == null || ageParam == null) {
            System.out.println("❌ Error: Missing parameters - patientId or age.");
            context.status(400).json(Collections.singletonMap("error", "Patient ID and Age are required."));
            return;
        }

        int patientId;
        int age;

        try {
            patientId = Integer.parseInt(patientIdParam);
            age = Integer.parseInt(ageParam);
        } catch (NumberFormatException e) {
            System.out.println("❌ Error: Invalid number format.");
            context.status(400).json(Collections.singletonMap("error", "Invalid number format for patientId or age."));
            return;
        }

        try (Connection conn = SQLConnection.create()) {
            String sql = "UPDATE patients SET age = ? WHERE patient_id = ?";

            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, age);
                stmt.setInt(2, patientId);

                int rowsAffected = stmt.executeUpdate();
                if (rowsAffected > 0) {
                    context.status(200).json(Collections.singletonMap("message", "Patient age updated successfully."));
                } else {
                    context.status(404).json(Collections.singletonMap("error", "Patient not found."));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            context.status(500).json(Collections.singletonMap("error", "Database error: " + e.getMessage()));
        }
    }

    public static void getLatestAnamnesis(Context context) {
        String idParam = context.pathParam("id");

        if (idParam == null || idParam.isEmpty()) {
            context.status(400).json(Collections.singletonMap("error", "Missing patient ID"));
            return;
        }

        try (Connection conn = SQLConnection.create()) {
            String sql = "SELECT content FROM anamneses WHERE patient_id = ? ORDER BY created DESC LIMIT 1";

            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, Integer.parseInt(idParam));

                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        String content = rs.getString("content");
                        context.status(200).json(Collections.singletonMap("anamnesis", content));
                    } else {
                        context.status(200).json(Collections.singletonMap("anamnesis", ""));
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            context.status(500).json(Collections.singletonMap("error", "Internal server error"));
        }
    }

    public static void getAnamnesesByBirthNumber(Context context) {
        String birthNumber = context.pathParam("birthNumber");

        if (birthNumber == null || birthNumber.isEmpty()) {
            context.status(400).json(Collections.singletonMap("error", "Missing birth number"));
            return;
        }

        try (Connection conn = SQLConnection.create()) {
            List<Map<String, Object>> results = new ArrayList<>();

            // 1. AI-generated anamneses
            String sqlAI = "SELECT patient_id, content, created FROM anamneses WHERE birth_number = ?";

            try (PreparedStatement stmt = conn.prepareStatement(sqlAI)) {
                stmt.setString(1, birthNumber);
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> row = new HashMap<>();
                        row.put("patient_id", rs.getInt("patient_id"));
                        row.put("content", rs.getString("content"));
                        row.put("created", rs.getTimestamp("created"));
                        row.put("source", "AI");
                        results.add(row);
                    }
                }
            }

            // 2. Referral-based anamneses
            String sqlReferral = "SELECT context AS content, created FROM refered_anamneses WHERE birth_number = ?";

            try (PreparedStatement stmt = conn.prepareStatement(sqlReferral)) {
                stmt.setString(1, birthNumber);
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> row = new HashMap<>();
                        row.put("patient_id", null);
                        row.put("content", rs.getString("content"));
                        row.put("created", rs.getTimestamp("created"));
                        row.put("source", "Referral");
                        results.add(row);
                    }
                }
            }

            // 3. Seřazení všech záznamů podle data (nejnovější první)
            results.sort((a, b) -> {
                Timestamp t1 = (Timestamp) a.get("created");
                Timestamp t2 = (Timestamp) b.get("created");

                if (t1 == null && t2 == null) return 0;
                if (t1 == null) return 1; // t1 za t2
                if (t2 == null) return -1; // t1 před t2

                return t2.compareTo(t1); // seřazení od nejnovějšího
            });

            context.status(200).json(results);
        } catch (Exception e) {
            e.printStackTrace();
            context.status(500).json(Collections.singletonMap("error", "Internal server error"));
        }
    }

}

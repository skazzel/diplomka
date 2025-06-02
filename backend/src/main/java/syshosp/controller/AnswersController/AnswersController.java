package syshosp.controller.AnswersController;

import syshosp.sql.SQLConnection;
import io.javalin.http.Context;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Paths;
import java.sql.*;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import com.fasterxml.jackson.databind.ObjectMapper;

public class AnswersController {

    public static void saveAnswers(Context context) {
        try {
            Map<String, Object> answers = context.bodyAsClass(Map.class);

            if (answers == null || answers.isEmpty()) {
                System.out.println("Received empty request body.");
                context.status(400).json("{\"error\": \"Empty request body.\"}");
                return;
            }

            String language = (String) answers.getOrDefault("language", "cz");

            System.out.println("Received Patient Answers: " + answers);

            try (Connection connection = SQLConnection.create()) {
                String sql = """
                        INSERT INTO patients (gender, age, symptoms, main_symptom, chronic_condition,
                                              is_smoking, smoking_amount, is_drinking, alcohol_amount,
                                              medications, food_allergy, medication_allergy, is_pregnant,
                                              similar_around, `condition`, previous_trouble, duration,
                                              chronical_since, surgeries, drugs, medication_details,
                                              allergy_symptoms, employment_status, living_with,
                                              residence_type, apartment_floor, has_elevator,
                                              is_foreigner, foreigner_origin, foreigner_reason,
                                              traveled_outside_europe, gynecology_last_check,
                                              pain_type, pain_change, pain_worse, pain_relief,
                                              pain_intensity, pain_time, pain_trigger, birth_number, pain_areas, referred_by_doctor, pending,
                                              is_deleted, date)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, NOW())
                    """;

                try (PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                    statement.setString(1, (String) answers.getOrDefault("gender", "Unknown"));
                    statement.setInt(2, (Integer) answers.getOrDefault("age", 0));
                    statement.setString(3, getIdListFromTable("symptoms", "symptom_" + language, answers.get("symptoms")));
                    if ((Integer) answers.getOrDefault("main_symptom", 0) != 0) {
                        statement.setInt(4, (Integer) answers.get("main_symptom"));
                    } else {
                        statement.setNull(4, Types.INTEGER);
                    }
                    statement.setString(5, getIdListFromTable("chronical_diseases", "chronical_" + language, answers.get("chronicCondition")));

                    Map<String, Object> badHabits = (Map<String, Object>) answers.getOrDefault("badHabits", Map.of());
                    statement.setString(6, badHabits.getOrDefault("smoking", "no").toString());
                    statement.setString(7, getNonEmptyValue(badHabits.get("smokingAmount"), "0"));
                    statement.setString(8, badHabits.getOrDefault("alcohol", "no").toString());
                    statement.setString(9, getNonEmptyValue(badHabits.get("alcoholAmount"), "0"));

                    statement.setString(10, getIdListFromTable("medications", "name", answers.get("medications")));
                    statement.setString(11, listToString(answers.get("foodAllergies")));
                    statement.setString(12, getIdListFromTable("medications", "name", answers.get("medication_allergy")));
                    statement.setString(13, answers.getOrDefault("pregnancyStatus", "No").toString());

                    statement.setString(14, (String) answers.getOrDefault("similarAround", ""));
                    statement.setString(15, (String) answers.getOrDefault("condition", ""));
                    statement.setString(16, (String) answers.getOrDefault("previousTrouble", ""));
                    statement.setString(17, (String) answers.getOrDefault("duration", ""));

                    statement.setString(18, toJsonString(answers.get("chronicalSince")));
                    statement.setString(19, getIdListFromTable("operations", "operation_" + language, answers.get("surgeries")));
                    statement.setString(20, toJsonString(answers.get("drugs")));
                    statement.setString(21, toJsonString(answers.get("medicationDetails")));
                    statement.setString(22, getIdListFromTable("allergy_symptoms", "symptom_" + language, answers.get("allergySymptoms")));

                    statement.setString(23, (String) answers.getOrDefault("employmentStatus", ""));
                    statement.setString(24, (String) answers.getOrDefault("livingWith", ""));
                    statement.setString(25, (String) answers.getOrDefault("residenceType", ""));
                    statement.setObject(26, answers.getOrDefault("apartmentFloor", null), Types.INTEGER);
                    statement.setString(27, (String) answers.getOrDefault("hasElevator", ""));
                    statement.setString(28, (String) answers.getOrDefault("isForeigner", ""));
                    statement.setString(29, (String) answers.getOrDefault("foreignerOrigin", ""));
                    statement.setString(30, (String) answers.getOrDefault("foreignerReason", ""));
                    statement.setString(31, (String) answers.getOrDefault("traveledOutsideEurope", ""));
                    statement.setString(32, (String) answers.getOrDefault("gynecologyLastCheck", ""));

                    statement.setString(33, (String) answers.getOrDefault("painType", ""));
                    statement.setString(34, (String) answers.getOrDefault("painChange", ""));
                    statement.setString(35, (String) answers.getOrDefault("painWorse", ""));
                    statement.setString(36, (String) answers.getOrDefault("painRelief", ""));
                    statement.setObject(37, answers.getOrDefault("painIntensity", null), Types.INTEGER);
                    statement.setString(38, (String) answers.getOrDefault("painTime", ""));
                    statement.setString(39, (String) answers.getOrDefault("painTrigger", ""));
                    statement.setString(40, (String) answers.getOrDefault("birthNumber", ""));
                    statement.setString(41, listToString(answers.get("painAreas")));
                    statement.setBoolean(42, Boolean.parseBoolean(answers.getOrDefault("referredByDoctor", false).toString()));
                    statement.setString(43, "N");

                    int rowsInserted = statement.executeUpdate();
                    if (rowsInserted > 0) {
                        ResultSet generatedKeys = statement.getGeneratedKeys();
                        if (generatedKeys.next()) {
                            int newPatientId = generatedKeys.getInt(1);
                            System.out.println("Patient saved with ID: " + newPatientId);
                            context.status(201).json(Map.of("message", "Patient saved", "patient_id", newPatientId));
                        }
                    } else {
                        context.status(500).json("{\"error\": \"Failed to save patient answers.\"}");
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error processing patient answers: " + e.getMessage());
            e.printStackTrace();
            context.status(500).json("{\"error\": \"Server error.\"}");
        }
    }

    public static void getAnamnesesByBirthNumber(Context context) {
        String birthNumber = context.pathParam("birthNumber");
        List<Map<String, Object>> result = new ArrayList<>();

        try (Connection connection = SQLConnection.create()) {
            String query = "SELECT content, created FROM anamneses WHERE birth_number = ? ORDER BY created DESC";
            try (PreparedStatement stmt = connection.prepareStatement(query)) {
                stmt.setString(1, birthNumber);
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> row = new HashMap<>();
                        row.put("content", rs.getString("content"));
                        row.put("created", rs.getTimestamp("created"));
                        result.add(row);
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching anamneses: " + e.getMessage());
            context.status(500).json(Map.of("error", "Database error"));
            return;
        }

        context.status(200).json(result);
    }

    private static String getIdListFromTable(String tableName, String columnName, Object obj) throws SQLException {
        if (obj == null || obj.toString().isEmpty()) return "";

        List<String> idList = new ArrayList<>();
        List<?> items = (obj instanceof List) ? (List<?>) obj : List.of(obj.toString());

        try (Connection conn = SQLConnection.create()) {
            for (Object item : items) {
                String value = item.toString();

                try (PreparedStatement stmt = conn.prepareStatement(
                        "SELECT id FROM " + tableName + " WHERE " + columnName + " = ? LIMIT 1")) {
                    stmt.setString(1, value);
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) {
                            idList.add(String.valueOf(rs.getInt("id")));
                        } else {
                            System.err.println("ID not found for " + tableName + " value: " + value);
                        }
                    }
                }
            }
        }

        return String.join(",", idList);
    }

    private static String listToString(Object obj) {
        if (obj instanceof List) {
            return String.join(", ", (List<String>) obj);
        }
        return obj != null ? obj.toString() : "";
    }

    private static String getNonEmptyValue(Object value, String defaultValue) {
        if (value == null || value.toString().trim().isEmpty()) {
            return defaultValue;
        }
        return value.toString();
    }

    private static String toJsonString(Object obj) {
        try {
            return obj != null ? new ObjectMapper().writeValueAsString(obj) : "";
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }
}

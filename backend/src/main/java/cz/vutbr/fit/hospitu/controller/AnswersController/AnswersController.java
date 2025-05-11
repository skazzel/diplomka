package cz.vutbr.fit.hospitu.controller.AnswersController;

import cz.vutbr.fit.hospitu.sql.SQLConnection;
import io.javalin.http.Context;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Paths;
import java.sql.*;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

public class AnswersController {

    public static void saveAnswers(Context context) {
        try {
            Map<String, Object> answers = context.bodyAsClass(Map.class);

            if (answers == null || answers.isEmpty()) {
                System.out.println("❌ Received empty request body.");
                context.status(400).json("{\"error\": \"Empty request body.\"}");
                return;
            }

            System.out.println("📜 Received Patient Answers: " + answers);

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
                                              pain_intensity, pain_time, pain_trigger, birth_number, pain_areas, referred_by_doctor,
                                              is_deleted, date)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                    """;

                try (PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                    statement.setString(1, (String) answers.getOrDefault("gender", "Unknown"));
                    statement.setInt(2, (Integer) answers.getOrDefault("age", 0));
                    statement.setString(3, listToString(answers.get("symptoms")));
                    statement.setString(4, (String) answers.getOrDefault("main_symptom", ""));
                    statement.setString(5, listToString(answers.get("chronicCondition")));

                    Map<String, Object> badHabits = (Map<String, Object>) answers.getOrDefault("badHabits", Map.of());
                    statement.setString(6, badHabits.getOrDefault("smoking", "no").toString());
                    statement.setString(7, getNonEmptyValue(badHabits.get("smokingAmount"), "0"));
                    statement.setString(8, badHabits.getOrDefault("alcohol", "no").toString());
                    statement.setString(9, getNonEmptyValue(badHabits.get("alcoholAmount"), "0"));

                    statement.setString(10, listToString(answers.get("medications")));
                    statement.setString(11, listToString(answers.get("foodAllergies")));
                    statement.setString(12, listToString(answers.get("medication_allergy")));
                    statement.setString(13, answers.getOrDefault("pregnancyStatus", "No").toString());

                    statement.setString(14, (String) answers.getOrDefault("similarAround", ""));
                    statement.setString(15, (String) answers.getOrDefault("condition", ""));
                    statement.setString(16, (String) answers.getOrDefault("previousTrouble", ""));
                    statement.setString(17, (String) answers.getOrDefault("duration", ""));

                    statement.setString(18, toJsonString(answers.get("chronicalSince")));
                    statement.setString(19, listToString(answers.get("surgeries")));
                    statement.setString(20, toJsonString(answers.get("drugs")));
                    statement.setString(21, toJsonString(answers.get("medicationDetails")));
                    statement.setString(22, listToString(answers.get("allergySymptoms")));

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
                    statement.setString(43, "N"); // is_deleted



                    int rowsInserted = statement.executeUpdate();
                    if (rowsInserted > 0) {
                        ResultSet generatedKeys = statement.getGeneratedKeys();
                        if (generatedKeys.next()) {
                            int newPatientId = generatedKeys.getInt(1);
                            System.out.println("✅ Patient saved with ID: " + newPatientId);
                            context.status(201).json(Map.of("message", "Patient saved", "patient_id", newPatientId));

                            //runPythonScriptWithPatientId(newPatientId);
                        }
                    } else {
                        context.status(500).json("{\"error\": \"Failed to save patient answers.\"}");
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error processing patient answers: " + e.getMessage());
            e.printStackTrace();
            context.status(500).json("{\"error\": \"Server error.\"}");
        }
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

    private static void runPythonScriptWithPatientId(int patientId) {
        try {
            String scriptPath = Paths.get("..", "ai", "chatbot.py").toAbsolutePath().toString();
            System.out.println("📍 Python skript path: " + scriptPath);

            ProcessBuilder pb = new ProcessBuilder("python", scriptPath, String.valueOf(patientId));
            pb.redirectErrorStream(true);

            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));

            String line;
            System.out.println("Výstup skriptu:");
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }

            int exitCode = process.waitFor();
            System.out.println("✅ Python skript ukončen s kódem: " + exitCode);

        } catch (Exception e) {
            System.err.println("❌ Chyba při spouštění Python skriptu: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

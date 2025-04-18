package cz.vutbr.fit.hospitu.controller.AnswersController;

import cz.vutbr.fit.hospitu.sql.SQLConnection;
import io.javalin.http.Context;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.File;
import java.nio.file.Paths;
import java.sql.*;
import java.util.List;
import java.util.Map;

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
                                          date, is_deleted)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
                """;

                try (PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                    statement.setString(1, (String) answers.getOrDefault("gender", "Unknown"));
                    statement.setInt(2, (Integer) answers.getOrDefault("age", 0));
                    statement.setString(3, listToString(answers.get("symptoms")));
                    statement.setString(4, (String) answers.getOrDefault("main_symptom", ""));
                    statement.setString(5, (String) answers.getOrDefault("chronicCondition", ""));

                    Map<String, Object> badHabits = (Map<String, Object>) answers.getOrDefault("badHabits", Map.of());
                    statement.setString(6, badHabits.getOrDefault("smoking", "no").toString());
                    statement.setString(7, getNonEmptyValue(badHabits.get("smokingAmount"), "0"));
                    statement.setString(8, badHabits.getOrDefault("alcohol", "no").toString());
                    statement.setString(9, getNonEmptyValue(badHabits.get("alcoholAmount"), "0"));

                    statement.setString(10, listToString(answers.get("medications")));
                    statement.setString(11, listToString(answers.get("foodAllergies")));
                    statement.setString(12, listToString(answers.get("medication_allergy")));
                    statement.setString(13, answers.getOrDefault("pregnancyStatus", "No").toString());
                    statement.setString(14, "N");

                    int rowsInserted = statement.executeUpdate();
                    if (rowsInserted > 0) {
                        ResultSet generatedKeys = statement.getGeneratedKeys();
                        if (generatedKeys.next()) {
                            int newPatientId = generatedKeys.getInt(1);
                            System.out.println("✅ Patient saved with ID: " + newPatientId);
                            context.status(201).json(Map.of("message", "Patient saved", "patient_id", newPatientId));

                            // ✅ Spustit Python skript s ID pacienta
                            runPythonScriptWithPatientId(newPatientId);
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
        return "";
    }

    private static String getNonEmptyValue(Object value, String defaultValue) {
        if (value == null || value.toString().trim().isEmpty()) {
            return defaultValue;
        }
        return value.toString();
    }

    // ✅ Spustit Python skript s ID pacienta jako argument (relativně vůči rootu projektu)
    private static void runPythonScriptWithPatientId(int patientId) {
        try {
            String scriptPath = Paths.get("..", "ai", "ai", "chatbot.py").toAbsolutePath().toString();
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

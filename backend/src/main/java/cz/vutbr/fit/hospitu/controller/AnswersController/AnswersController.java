package cz.vutbr.fit.hospitu.controller.AnswersController;

import cz.vutbr.fit.hospitu.sql.SQLConnection;
import io.javalin.http.Context;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public class AnswersController {

    public static void saveAnswers(Context context) {
        try {
            // ✅ Read the incoming JSON body as a single object
            Map<String, Object> answers = context.bodyAsClass(Map.class);

            if (answers == null || answers.isEmpty()) {
                System.out.println("❌ Received empty request body.");
                context.status(400).json("{\"error\": \"Empty request body.\"}");
                return;
            }

            // ✅ Debug: Print received answers
            System.out.println("📜 Received Patient Answers: " + answers);

            try (Connection connection = SQLConnection.create()) {
                String sql = """
                    INSERT INTO patients (gender, age, symptoms, main_symptom, chronic_condition, 
                                          is_smoking, smoking_amount, is_drinking, alcohol_amount, 
                                          medications, food_allergy, medication_allergy, is_pregnant, 
                                          date, is_deleted) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
                """;

                try (PreparedStatement statement = connection.prepareStatement(sql)) {
                    statement.setString(1, (String) answers.getOrDefault("gender", "Unknown")); // ✅ Gender
                    statement.setInt(2, (Integer) answers.getOrDefault("age", 0)); // ✅ Age
                    statement.setString(3, listToString(answers.get("symptoms"))); // ✅ Symptoms (List)
                    statement.setString(4, (String) answers.getOrDefault("main_symptom", "")); // ✅ Main Symptom
                    statement.setString(5, (String) answers.getOrDefault("chronicCondition", "")); // ✅ Chronic Condition

                    // ✅ Extract `badHabits` values properly
                    Map<String, Object> badHabits = (Map<String, Object>) answers.getOrDefault("badHabits", Map.of());
                    statement.setString(6, badHabits.getOrDefault("smoking", "no").toString()); // ✅ Is Smoking (yes/no)
                    statement.setString(7, getNonEmptyValue(badHabits.get("smokingAmount"), "0"));
                    statement.setString(8, badHabits.getOrDefault("alcohol", "no").toString()); // ✅ Is Drinking (yes/no)
                    statement.setString(9, getNonEmptyValue(badHabits.get("alcoholAmount"), "0"));

                    statement.setString(10, listToString(answers.get("medications"))); // ✅ Medications (List)
                    statement.setString(11, listToString(answers.get("foodAllergies"))); // ✅ Food Allergy (List)
                    statement.setString(12, listToString(answers.get("medication_allergy"))); // ✅ Medication Allergy (List)
                    statement.setString(13, answers.getOrDefault("pregnancyStatus", "No").toString()); // ✅ Is Pregnant (Yes/No)
                    statement.setString(14, "N"); // ✅ is_deleted (Default: 'N')

                    int rowsInserted = statement.executeUpdate();
                    if (rowsInserted > 0) {
                        context.status(201).json("{\"message\": \"Patient answers saved successfully.\"}");
                        System.out.println("✅ Patient Answers Saved to Database");
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

    // ✅ Convert List to a String for storing in database
    private static String listToString(Object obj) {
        if (obj instanceof List) {
            return String.join(", ", (List<String>) obj);
        }
        return "";
    }

    private static String getNonEmptyValue(Object value, String defaultValue) {
        if (value == null || value.toString().trim().isEmpty()) {
            return defaultValue; // Return default if value is empty
        }
        return value.toString();
    }
}

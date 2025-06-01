package syshosp.controller.patient;

import io.javalin.http.Context;
import io.javalin.http.UploadedFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.*;

public class PatientImageController {
    private static final String UPLOAD_DIR = "upload-image";

    public static void postImage(Context ctx) {
        List<UploadedFile> files = ctx.uploadedFiles("file");
        String birthNumber = ctx.formParam("birthNumber").replaceAll("[^a-zA-Z0-9]", "");

        if (files == null || files.isEmpty() || birthNumber == null) {
            ctx.status(400).result("Missing file(s) or birthNumber.");
            return;
        }

        File patientFolder = new File(UPLOAD_DIR, birthNumber);
        if (!patientFolder.exists()) {
            patientFolder.mkdirs();
        }

        int existingCount = Optional.ofNullable(patientFolder.listFiles())
                .map(arr -> (int) Arrays.stream(arr).filter(File::isFile).count())
                .orElse(0);

        List<String> savedFiles = new ArrayList<>();
        int index = existingCount + 1;

        for (UploadedFile file : files) {
            String extension = getExtension(file.getFilename());
            String newFileName = birthNumber + "-" + index + extension;
            File destination = new File(patientFolder, newFileName);

            try {
                Files.copy(file.getContent(), destination.toPath(), StandardCopyOption.REPLACE_EXISTING);
                savedFiles.add("/" + UPLOAD_DIR + "/" + birthNumber + "/" + newFileName);
                index++;
            } catch (IOException e) {
                e.printStackTrace();
                ctx.status(500).result("File upload failed.");
                return;
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("filePaths", savedFiles);
        response.put("totalUploaded", index - 1);

        ctx.json(response);
    }

    private static String getExtension(String fileName) {
        int lastDot = fileName.lastIndexOf('.');
        return lastDot >= 0 ? fileName.substring(lastDot) : "";
    }
}

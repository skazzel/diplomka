package syshosp;

import syshosp.access.APIAccessManager;
import syshosp.access.EnumAPIRole;
import syshosp.controller.*;
import syshosp.controller.*;
import syshosp.controller.AnswersController.AnswersController;
import syshosp.controller.OperationController.OperationsController;
import syshosp.controller.SymptomController.DiseaseController;
import syshosp.controller.SymptomController.SymptomController;
import syshosp.controller.admin.*;
import syshosp.controller.admin.*;
import syshosp.controller.doctor.DoctorController;
import syshosp.controller.doctor.FilesController;
import syshosp.controller.doctor.TicketController;
import syshosp.controller.patient.AllergySymptomController;
import syshosp.controller.patient.PatientImageController;
import syshosp.controller.patient.PatientInfoController;
import syshosp.controller.validator.ValidationException;
import syshosp.data.response.generic.Generic400ResponseData;
import syshosp.data.response.generic.Generic500ResponseData;
import syshosp.sql.SQLConnection;
import syshosp.sql.table.Tables;
import io.javalin.Javalin;
import io.javalin.apibuilder.ApiBuilder;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.util.ssl.SslContextFactory;

import java.util.Set;

public class Main
{
    public static void main(String[] args)
    {
        try
        {
            var serverConfig = ServerConfigLoader.load();

            if (serverConfig == null)
            {
                System.err.println("Failed to load the server config, exiting.");
                return;
            }

            SQLConnection.initialize(serverConfig);

            try (var connection = SQLConnection.create())
            {
                Tables.initialize(connection);
            }

            Javalin app = Javalin.create(config -> {
                if (serverConfig.getKeyStorePassword() != null)
                {
                    config.server(() -> {
                        Server server = new Server();
                        ServerConnector sslConnector = new ServerConnector(server, getSslContextFactory(serverConfig));
                        sslConnector.setPort(serverConfig.getHttpPort());
                        server.setConnectors(new Connector[]{ sslConnector });
                        return server;
                    });

                    config.enforceSsl = true;
                }

                config.accessManager(APIAccessManager::manage);
                config.defaultContentType = "application/json";
                config.enableCorsForAllOrigins();
            });
            app.exception(ValidationException.class, (exception, ctx) -> {});
            app.error(500, ctx -> ctx.json(new Generic500ResponseData()));
            app.error(400, ctx -> ctx.json(new Generic400ResponseData()));
            app.routes(() -> {
                ApiBuilder.path("patients", () -> {
                    ApiBuilder.path(":id", () -> {
                        ApiBuilder.get("latest-anamnesis", PatientInfoController::getLatestAnamnesis, Set.of(EnumAPIRole.DOCTOR));
                    });
                });
                ApiBuilder.path("image", () -> {
                    ApiBuilder.post("save", PatientImageController::postImage, Set.of(EnumAPIRole.PATIENT));
                });

                ApiBuilder.path("patients", () -> {
                    ApiBuilder.path("by-birth-number", () -> {
                        ApiBuilder.path(":birthNumber", () -> {
                            ApiBuilder.get("anamneses", PatientInfoController::getAnamnesesByBirthNumber, Set.of(EnumAPIRole.DOCTOR));
                        });
                    });
                });
                ApiBuilder.path("users", () -> {
                    ApiBuilder.post("login", LoginController::postLogin, Set.of(EnumAPIRole.ANONYMOUS));

                    ApiBuilder.put("register", RegisterController::putRegister, Set.of(EnumAPIRole.ANONYMOUS));

                    ApiBuilder.get("search", UserSearchController::getSearch, Set.of(EnumAPIRole.DOCTOR, EnumAPIRole.INSURANCE_WORKER));

                    ApiBuilder.get("search-detail", UserSearchController::getSearchDetailed, Set.of(EnumAPIRole.DOCTOR, EnumAPIRole.INSURANCE_WORKER));

                    ApiBuilder.path("@self", () -> {
                        ApiBuilder.get("profile", UserController::getSelfUserProfile, Set.of(EnumAPIRole.PATIENT));

                        ApiBuilder.get("profile-detail", UserController::getSelfUserProfileDetail, Set.of(EnumAPIRole.PATIENT));

                        ApiBuilder.patch("profile-update", UserController::updateSelfUserProfile, Set.of(EnumAPIRole.PATIENT));

                        ApiBuilder.post("patient-info-create", PatientInfoController::createPatient, Set.of(EnumAPIRole.PATIENT));

                        ApiBuilder.post("patient-info-update", PatientInfoController::updatePatient, Set.of(EnumAPIRole.PATIENT));
                    });

                    ApiBuilder.path(":user-id", () -> {
                        ApiBuilder.get("profile", UserController::getUserProfile, Set.of(EnumAPIRole.ANONYMOUS));

                        ApiBuilder.get("profile-detail", UserController::getUserProfileDetail, Set.of(EnumAPIRole.DOCTOR, EnumAPIRole.INSURANCE_WORKER));

                        ApiBuilder.patch("profile-update", UserController::updateUserProfile, Set.of(EnumAPIRole.ADMIN));

                        ApiBuilder.patch("update-role", RoleController::patchChangeRole, Set.of(EnumAPIRole.ADMIN));

                        ApiBuilder.post("patient-info-create", PatientInfoController::createPatient, Set.of(EnumAPIRole.PATIENT));

                        ApiBuilder.post("patient-info-update", PatientInfoController::updatePatient, Set.of(EnumAPIRole.PATIENT));
                    });
                });

                ApiBuilder.path("hFile", () -> {
                    ApiBuilder.path("info", () -> {
                        ApiBuilder.get(FilesController::getFiles, Set.of(EnumAPIRole.DOCTOR));
                    });

                    ApiBuilder.path("patients", () -> {
                        ApiBuilder.get(FilesController::getPatient, Set.of(EnumAPIRole.DOCTOR));
                    });

                    ApiBuilder.path("create", () -> {
                        ApiBuilder.put(FilesController::putFiles, Set.of(EnumAPIRole.DOCTOR));
                    });

                    ApiBuilder.path("switch", () -> {
                        ApiBuilder.put(FilesController::putChangeDoctor, Set.of(EnumAPIRole.DOCTOR));
                    });

                    ApiBuilder.path(":ptch-id", () -> {
                        ApiBuilder.patch("file-update", FilesController::updateFile, Set.of(EnumAPIRole.DOCTOR));

                        ApiBuilder.patch("file-report-update", FilesController::updateFileReport, Set.of(EnumAPIRole.DOCTOR));
                    });
                });

                 ApiBuilder.path("admin", () -> {
                    ApiBuilder.path("change", () -> {
                        ApiBuilder.post(AdminControllerWriteDoc::getAdmins, Set.of(EnumAPIRole.ADMIN));
                    });
                    ApiBuilder.path("changep", () -> {
                        ApiBuilder.post(AdminControllerWritePoj::getAdmins, Set.of(EnumAPIRole.ADMIN));
                    });
                    ApiBuilder.path("info", () -> {
                        ApiBuilder.get(AdminControllerTable::getAdmins, Set.of(EnumAPIRole.ADMIN));
                    });
                    ApiBuilder.path("deleted", () -> {
                        ApiBuilder.post(AdminControllerDeleteDoctor::getAdmins, Set.of(EnumAPIRole.ADMIN));
                    });
                    ApiBuilder.path("deletep", () -> {
                        ApiBuilder.post(AdminControllerDeletePoj::getAdmins, Set.of(EnumAPIRole.ADMIN));
                    });
                    ApiBuilder.path("deletepac", () -> {
                        ApiBuilder.post(AdminControllerDeletePacient::getAdmins, Set.of(EnumAPIRole.ADMIN));
                    });
                });

                ApiBuilder.path("doctors", () -> {
                    ApiBuilder.path("info", () -> {
                        ApiBuilder.get(DoctorController::getDoctorInfo, Set.of(EnumAPIRole.DOCTOR));
                    });

                    ApiBuilder.path("files", () -> {
                        ApiBuilder.get(DoctorController::getDoctorFiles, Set.of(EnumAPIRole.DOCTOR));
                    });

                    ApiBuilder.path("practitioners", () -> {
                        ApiBuilder.get(DoctorController::getPractitioners, Set.of(EnumAPIRole.DOCTOR));
                    });

                    ApiBuilder.path("un-patients", () -> {
                        ApiBuilder.get(DoctorController::getUnPatients, Set.of(EnumAPIRole.DOCTOR));
                    });

                    ApiBuilder.path("patients", () -> {
                        ApiBuilder.get(DoctorController::getPatients, Set.of(EnumAPIRole.DOCTOR));
                    });

                    ApiBuilder.path(":un_pid", () -> {
                        ApiBuilder.put("move-patient",DoctorController::movePatient, Set.of(EnumAPIRole.DOCTOR));

                        ApiBuilder.patch("update-patient",DoctorController::updatePatient, Set.of(EnumAPIRole.DOCTOR));
                    });

                    ApiBuilder.path("create-patient", () -> {
                        ApiBuilder.put(DoctorController::putPatient, Set.of(EnumAPIRole.DOCTOR));
                    });
                });

                ApiBuilder.path("tickets", () -> {
                    ApiBuilder.path("info", () -> {
                        ApiBuilder.get(TicketController::getTickets, Set.of(EnumAPIRole.DOCTOR));
                    });

                    ApiBuilder.path("create", () -> {
                        ApiBuilder.put(TicketController::putTickets, Set.of(EnumAPIRole.DOCTOR));
                    });

                    ApiBuilder.path("insurance", () -> {
                        ApiBuilder.put(TicketController::putIRequest, Set.of(EnumAPIRole.DOCTOR));
                    });

                    ApiBuilder.path("switch", () -> {
                        ApiBuilder.put(TicketController::putChangeDoctor, Set.of(EnumAPIRole.DOCTOR));
                    });

                    ApiBuilder.path(":cr-id", () -> {
                        ApiBuilder.patch("ticket-update", TicketController::updateFileTicket, Set.of(EnumAPIRole.DOCTOR));

                        ApiBuilder.patch("ticket-report-update", TicketController::updateFileTicketReport, Set.of(EnumAPIRole.DOCTOR));
                    });
                });
                ApiBuilder.path("symptoms", () -> {
                    ApiBuilder.get("info", SymptomController::getSymptom, Set.of(EnumAPIRole.PATIENT, EnumAPIRole.DOCTOR));
                });
                ApiBuilder.path("diseases", () -> {
                    ApiBuilder.get("info", DiseaseController::getDisease, Set.of(EnumAPIRole.PATIENT, EnumAPIRole.DOCTOR));
                });
                ApiBuilder.path("medications", () -> {
                    ApiBuilder.get("info", medicationController::getMedication, Set.of(EnumAPIRole.PATIENT, EnumAPIRole.DOCTOR));
                });
                ApiBuilder.path("answers", () -> {
                    ApiBuilder.post("info", AnswersController::saveAnswers, Set.of(EnumAPIRole.PATIENT, EnumAPIRole.DOCTOR));
                });
                ApiBuilder.path("operations", () -> {
                    ApiBuilder.get("info", OperationsController::getOperation, Set.of(EnumAPIRole.PATIENT, EnumAPIRole.DOCTOR));
                });
                ApiBuilder.path("allergy_symptom", () -> {
                    ApiBuilder.get("info", AllergySymptomController::getSymptom, Set.of(EnumAPIRole.PATIENT, EnumAPIRole.DOCTOR));
                });
            });

            app.start(serverConfig.getHttpPort());
        }
        catch (Exception e)
        {
            System.err.println("The following error has occurred while initializing the server:");
            e.printStackTrace();
        }
    }

    private static SslContextFactory getSslContextFactory(ServerConfigLoader.ServerConfig config) {
        var keyStore = Main.class.getResource("/keystore.jks").toExternalForm();

        SslContextFactory sslContextFactory = new SslContextFactory.Server();
        sslContextFactory.setKeyStorePath(keyStore);
        sslContextFactory.setKeyStorePassword(config.getKeyStorePassword());
        sslContextFactory.setTrustStorePath(keyStore);
        sslContextFactory.setTrustStorePassword(config.getKeyStorePassword());
        return sslContextFactory;
    }
}

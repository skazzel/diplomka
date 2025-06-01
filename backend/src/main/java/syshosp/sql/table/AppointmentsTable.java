package syshosp.sql.table;

import java.sql.Connection;
import java.util.List;

public class AppointmentsTable extends AbstractTable
{
    protected AppointmentsTable()
    {
        super("appointments", "apo_");
    }

    public List<String> getCreateCommands(Connection connection)
    {
        var sql = """
            CREATE TABLE $
            (
                 appointment_id   INT  PRIMARY KEY NOT NULL,
                 patient_id       INT NOT NULL,
                 doctor_id        INT NOT NULL,
                 date             DATE NOT NULL,
                 status           VARCHAR(45) NOT NULL,
                                      
                 CONSTRAINT fk_doctor_id
                     FOREIGN KEY (doctor_id) REFERENCES doctors (doctor_id),
                     
                 CONSTRAINT fk_patient_id
                     FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
                         ON DELETE CASCADE
             );
            """;

        return List.of(sql);
    }
}

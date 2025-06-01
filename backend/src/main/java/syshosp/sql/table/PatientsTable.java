package syshosp.sql.table;

import java.sql.Connection;
import java.util.List;

public class PatientsTable extends AbstractTable
{
    protected PatientsTable()
    {
        super("patients", "pt_");
    }

    public List<String> getCreateCommands(Connection connection)
    {
        var sql = """
            CREATE TABLE $
            (
                patient_id              INT                              PRIMARY KEY NOT NULL,
                gender                  VARCHAR(45) NOT NULL
                age                     INT,
                date                    DATE
            );
            """;

        return List.of(sql);
    }
}

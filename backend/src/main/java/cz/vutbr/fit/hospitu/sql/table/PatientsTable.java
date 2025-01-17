package cz.vutbr.fit.hospitu.sql.table;

import java.sql.Connection;
import java.util.List;

public class PatientsTable extends AbstractTable
{
    protected PatientsTable()
    {
        super("patient", "pt_");
    }

    public List<String> getCreateCommands(Connection connection)
    {
        var sql = """
            CREATE TABLE $
            (
                patient_id              INT                              PRIMARY KEY NOT NULL,
                name                    VARCHAR(45) NOT NULL
                surname                 VARCHAR(45) NOT NULL,
                insurance_number        INT,
                birthdate               DATE,
                date                    DATE,
                social_security_number  INT,
                address                 VARCHAR(45) NOT NULL,
                phone_number            INT,
                email                   VARCHAR(45) NOT NULL,
                gender                  CHAR(1) NOT NULL
            );
            """;

        return List.of(sql);
    }
}

package cz.vutbr.fit.hospitu.sql.table;

import java.sql.Connection;
import java.util.List;

public class DoctorsTable extends AbstractTable
{
    protected DoctorsTable()
    {
        super("doctor", "dr_");
    }

    public List<String> getCreateCommands(Connection connection)
    {
        var sql = """
            CREATE TABLE $
            (
                doctor_id       INT PRIMARY KEY AUTO_INCREMENT,
                name            VARCHAR(45) NOT NULL
                surname         VARCHAR(45) NOT NULL,
                phone_number    INT,
                email           VARCHAR(45) NOT NULL,
                doc_salt        VARCHAR(45) NOT NULL,
                login           VARCHAR(45) NOT NULL,
                password        VARCHAR(45) NOT NULL
            );
            """;

        return List.of(sql);
    }
}

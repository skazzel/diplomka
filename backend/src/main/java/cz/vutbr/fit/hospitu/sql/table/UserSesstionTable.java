package cz.vutbr.fit.hospitu.sql.table;

import java.sql.Connection;
import java.util.List;

public class UserSesstionTable extends AbstractTable
{
    protected UserSesstionTable()
    {
        super("user_sessions", "uss_");
    }

    public List<String> getCreateCommands(Connection connection)
    {
        var sql = """
            CREATE TABLE $
            (
                sesstion_id         INT PRIMARY KEY AUTO_INCREMENT,
                patient_id          INT NOT NULL,
                token               VARCHAR(45) NOT NULL,
                created             DATE,
                expiration_date     DATE,
                
                CONSTRAINT f_patient_id
                     FOREIGN KEY (patient_id) REFERENCES patient (patient_id)
                         ON DELETE CASCADE
            );
            """;

        return List.of(sql);
    }
}

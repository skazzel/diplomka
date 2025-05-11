package cz.vutbr.fit.hospitu.sql.table;

import java.sql.Connection;
import java.util.List;

public class AnamnesisTable extends AbstractTable
{
    protected AnamnesisTable()
    {
        super("anamneses", "ana_");
    }

    public List<String> getCreateCommands(Connection connection)
    {
        var sql = """
            CREATE TABLE $
            (
                anamnesis_id    INT PRIMARY KEY AUTO_INCREMENT,
                patient_id      INT NOT NULL,
                surname         VARCHAR(45) NOT NULL,
                additional_info VARCHAR(45),
                created         DATE,
                
                CONSTRAINT patient_id
                     FOREIGN KEY (patient_id) REFERENCES patients (patient_id) ON DELETE CASCADE
            );
            """;

        return List.of(sql);
    }
}

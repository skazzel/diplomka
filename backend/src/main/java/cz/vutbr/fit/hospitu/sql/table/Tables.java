package cz.vutbr.fit.hospitu.sql.table;

import org.eclipse.jetty.server.Authentication;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public class Tables
{
    public static final DoctorsTable TABLE_DOCTORS = new DoctorsTable();
    public static final AppointmentsTable TABLE_APPOINTMENTS = new AppointmentsTable();
    public static final PatientsTable TABLE_PATIENTS = new PatientsTable();
    public static final AnamnesisTable TABLE_USER_SESSIONS = new AnamnesisTable();
    public static final UserSesstionTable TABLE_ANAMNESIS = new UserSesstionTable();

    public static void initialize(Connection connection) throws SQLException
    {
        final var tables = List.of(
            TABLE_DOCTORS,
            TABLE_PATIENTS,
            TABLE_APPOINTMENTS,
            TABLE_ANAMNESIS,
            TABLE_USER_SESSIONS
        );

        for (var table: tables)
        {
            if (!table.exists(connection))
                table.create(connection);
            else
                System.out.printf("Table '%s' already exists, will not be created%n", table.getName());
        }
    }
}

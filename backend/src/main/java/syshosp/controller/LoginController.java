package syshosp.controller;

import syshosp.access.AuthorizationManager;
import syshosp.data.request.LoginRequestData;
import syshosp.data.response.impl.LoginResponseData;
import syshosp.data.response.impl.doctor.HumanReadableResponseData;
import syshosp.sql.SQLConnection;
import io.javalin.http.Context;

public class LoginController
{
    public static void postLogin(Context context)
    {
        var loginData = context.bodyAsClass(LoginRequestData.class);

        SQLConnection.createTransaction(context, connection -> {
            var sql = """
            SELECT * FROM doctors WHERE login=? AND password=SHA2(CONCAT(?, doc_salt), 256)                
            """;

            try (var statement = connection.prepareStatement(sql))
            {
                statement.setString(1, loginData.getUsername());
                statement.setString(2, loginData.getPassword());

                var result = statement.executeQuery();

                if (!result.next())
                {
                    context.status(404).json(new HumanReadableResponseData(404,
                        "A user with these credentials was not found.",
                        "Uživatel s těmito přihlašovacími údaji nebyl nalezen."));
                    return;
                }

                int userID = result.getInt("doctor_id");

                context.status(200).json(new LoginResponseData(
                    userID,
                    result.getString("login"),
                    result.getString("name"),
                    result.getString("surname"),
                    result.getString("perm"),
                    AuthorizationManager.instance().authorize(userID)
                ));
            }
        });
    }
}

package syshosp.controller;

import syshosp.access.EnumAPIRole;
import syshosp.data.response.impl.UserSearchResponseData;
import syshosp.data.response.impl.UserSearchResult;
import syshosp.data.response.impl.UserSearchResultDetail;
import syshosp.sql.SQLConnection;
import io.javalin.http.Context;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.Objects;
import java.util.stream.Collectors;

public class UserSearchController
{
    public static void getSearch(Context context)
    {
        var query = context.queryParam("name");
        var role = EnumAPIRole.getByDBName(context.queryParam("role"));

        var roles = role != null ? role.getCumulativePermissions() : EnumSet.allOf(EnumAPIRole.class);

        SQLConnection.createTransaction(context, connection -> {
            var sql = """
            SELECT doctor_id,
                name,
                surname,
                perm
            FROM doctors
            WHERE 
                (
                    LOWER(CONCAT(name, ' ', surname)) LIKE LOWER(?)
                        OR
                    LOWER(CONCAT(surname, ' ', name)) LIKE LOWER(?)
                )
                    AND
                perm IN ('$')
            ORDER BY surname, name
            LIMIT 50             
            """.replace("('$')", roles.stream()
                .map(EnumAPIRole::getDBName)
                .filter(Objects::nonNull)
                .map(name -> String.format("'%s'", name))
                .collect(Collectors.joining(",", "(", ")")));

            // When is Java getting string interpolation? >:(

            try (var statement = connection.prepareStatement(sql))
            {
                statement.setString(1, query + "%");
                statement.setString(2, query + "%");

                var resultSet = statement.executeQuery();

                var searchResults = new ArrayList<UserSearchResult>();

                while (resultSet.next())
                {
                    searchResults.add(new UserSearchResult(
                        resultSet.getInt("doctor_id"),
                        resultSet.getString("name"),
                        resultSet.getString("surname"),
                        EnumAPIRole.getByDBName(resultSet.getString("perm"))
                    ));
                }

                context.status(200).json(new UserSearchResponseData(
                    searchResults
                ));
            }
        });
    }

    public static void getSearchDetailed(Context context)
    {
        var query = context.queryParam("name");
        var role = EnumAPIRole.getByDBName(context.queryParam("role"));

        var roles = role != null ? EnumSet.of(role) : EnumSet.allOf(EnumAPIRole.class);

        SQLConnection.createTransaction(context, connection -> {
            var sql = """
            SELECT doctor_id,
                name,
                surname,
                perm
            FROM doctors
            WHERE 
                (
                    LOWER(CONCAT(name, ' ', surname)) LIKE LOWER(?)
                        OR
                    LOWER(CONCAT(surname, ' ', name)) LIKE LOWER(?)
                )
                    AND
                perm IN ('$')
            ORDER BY surname, name
            LIMIT 50             
            """.replace("('$')", roles.stream()
                .map(EnumAPIRole::getDBName)
                .filter(Objects::nonNull)
                .map(name -> String.format("'%s'", name))
                .collect(Collectors.joining(",", "(", ")")));

            // When is Java getting string interpolation? >:(

            try (var statement = connection.prepareStatement(sql))
            {
                statement.setString(1, query + "%");
                statement.setString(2, query + "%");

                var resultSet = statement.executeQuery();

                var searchResults = new ArrayList<UserSearchResultDetail>();

                var formatter = DateTimeFormatter.ISO_DATE;

                while (resultSet.next())
                {
                    searchResults.add(new UserSearchResultDetail(
                        resultSet.getInt("doctor_id"),
                        resultSet.getString("name"),
                        resultSet.getString("surname"),
                        EnumAPIRole.getByDBName(resultSet.getString("perm"))
                    ));
                }

                context.status(200).json(new UserSearchResponseData(
                    searchResults
                ));
            }
        });
    }
}

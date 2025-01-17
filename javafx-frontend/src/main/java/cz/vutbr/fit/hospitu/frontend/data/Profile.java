package cz.vutbr.fit.hospitu.frontend.data;

import cz.vutbr.fit.hospitu.frontend.api.EnumAPIRole;
import javafx.beans.property.*;

import java.time.LocalDate;

public class Profile
{
    private final StringProperty propertyLogin;
    private final IntegerProperty propertyUserID;
    private final StringProperty propertyName;
    private final StringProperty propertySurname;
    private final ObjectProperty<EnumAPIRole> propertyRole;

    private final StringProperty propertyPhone;
    private final StringProperty propertyEmail;
    private final ObjectProperty<LocalDate> propertyBirthDate;
    private final StringProperty propertyBirthID;

    public Profile()
    {
        this.propertyLogin = new SimpleStringProperty();
        this.propertyUserID = new SimpleIntegerProperty();
        this.propertyName = new SimpleStringProperty();
        this.propertySurname = new SimpleStringProperty();
        this.propertyRole = new SimpleObjectProperty<>();
        this.propertyPhone = new SimpleStringProperty();
        this.propertyEmail = new SimpleStringProperty();
        this.propertyBirthDate = new SimpleObjectProperty<>();
        this.propertyBirthID = new SimpleStringProperty();
    }

    public StringProperty loginProperty()
    {
        return this.propertyLogin;
    }

    public IntegerProperty userIDProperty()
    {
        return this.propertyUserID;
    }

    public StringProperty nameProperty()
    {
        return this.propertyName;
    }

    public StringProperty surnameProperty()
    {
        return this.propertySurname;
    }

    public ObjectProperty<EnumAPIRole> roleProperty()
    {
        return this.propertyRole;
    }

    public StringProperty phoneProperty()
    {
        return this.propertyPhone;
    }

    public StringProperty emailProperty()
    {
        return this.propertyEmail;
    }

    public ObjectProperty<LocalDate> birthDateProperty()
    {
        return this.propertyBirthDate;
    }

    public StringProperty birthIDProperty()
    {
        return this.propertyBirthID;
    }

    public String getLogin()
    {
        return this.propertyLogin.get();
    }

    public int getUserID()
    {
        return this.propertyUserID.get();
    }

    public String getName()
    {
        return this.propertyName.get();
    }

    public String getSurname()
    {
        return this.propertySurname.get();
    }

    public EnumAPIRole getRole()
    {
        return this.propertyRole.get();
    }

    public String getPhone()
    {
        return this.propertyPhone.get();
    }

    public String getEmail()
    {
        return this.propertyEmail.get();
    }

    public LocalDate getBirthDate()
    {
        return this.propertyBirthDate.get();
    }

    public String getBirthID()
    {
        return this.propertyBirthID.get();
    }

    public void setLogin(String login)
    {
        this.propertyLogin.set(login);
    }

    public void setUserID(int userID)
    {
        this.propertyUserID.set(userID);
    }

    public void setName(String name)
    {
        this.propertyName.set(name);
    }

    public void setSurname(String surname)
    {
        this.propertySurname.set(surname);
    }

    public void setRole(EnumAPIRole role)
    {
        this.propertyRole.set(role);
    }

    public void setPhone(String phone)
    {
        this.propertyPhone.set(phone);
    }

    public void setEmail(String email)
    {
        this.propertyEmail.set(email);
    }

    public void setBirthDate(LocalDate date)
    {
        this.propertyBirthDate.set(date);
    }

    public void setBirthID(String birthID)
    {
        this.propertyBirthID.set(birthID);
    }
}
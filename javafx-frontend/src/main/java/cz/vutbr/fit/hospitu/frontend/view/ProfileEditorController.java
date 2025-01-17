package cz.vutbr.fit.hospitu.frontend.view;

import cz.vutbr.fit.hospitu.frontend.api.EnumAPIRole;
import cz.vutbr.fit.hospitu.frontend.data.Profile;
import javafx.beans.binding.Bindings;
import javafx.beans.property.StringProperty;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.input.KeyEvent;

public class ProfileEditorController
{
    @FXML
    private TextField textLogin;

    @FXML
    private TextField textUserID;

    @FXML
    private TextField textName;

    @FXML
    private TextField textSurname;

    @FXML
    private ComboBox<EnumAPIRole> comboRole;

    @FXML
    private TextField textPhone;

    @FXML
    private TextField textEmail;

    @FXML
    private DatePicker dateBirthDate;

    @FXML
    private TextField textBirthID;

    @FXML
    private Button buttonUpdate;

    private Profile profile;

    public ProfileEditorController()
    {
        profile = new Profile();
    }

    @FXML
    public void initialize()
    {
        this.textUserID.textProperty().bind(this.profile.userIDProperty().asString());
        this.textLogin.textProperty().bindBidirectional(this.profile.loginProperty());
        this.textName.textProperty().bindBidirectional(this.profile.nameProperty());
        this.textSurname.textProperty().bindBidirectional(this.profile.surnameProperty());
        this.textPhone.textProperty().bindBidirectional(this.profile.phoneProperty());
        this.dateBirthDate.valueProperty().bindBidirectional(this.profile.birthDateProperty());
        this.comboRole.valueProperty().bindBidirectional(this.profile.roleProperty());
        this.comboRole.getItems().addAll(EnumAPIRole.values());

        this.textEmail.setTextFormatter(new TextFormatter<String>(change -> {
            if (!change.getText().matches(".+?@.+?"))
                return null;

            return change;
        }));

        this.textBirthID.setTextFormatter(new TextFormatter<String>(change -> {
            if (!change.getText().matches("[0-9+/]*"))
                return null;

            return change;
        }));

        this.comboRole.setDisable(true);

        this.buttonUpdate.setOnAction(event -> {

        });

    }


    public Profile getProfile()
    {
        return this.profile;
    }
}

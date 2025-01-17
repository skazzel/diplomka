1. Nastavení DB

CREATE DATABASE IF NOT EXISTS itudata CHARACTER SET UTF8 COLLATE utf8_czech_ci;
CREATE USER IF NOT EXISTS 'itubackend' IDENTIFIED BY '<vložte heslo uživatele>';
GRANT CREATE, INDEX, DELETE, INSERT, SELECT, UPDATE ON itudata.* TO 'itubackend';
FLUSH PRIVILEGES;


2. Spuštění backendu

 * Vyžadováno JDK 15

 Konfigurační soubor: `backend/settings.json`
 Konfigurační soubor je vygenerován při prvním spuštění.

 Příkaz: `./gradlew run` ve složce `backend`

3. Spuštění webové aplikace

 * Vyžadováno node.js/npm

 Konfigurační soubor: `react-frontend/src/config.ts` 

 Příkazy: `npm install` ve složce `react-frontend`
          `npm start` ve složce `react-frontend`

4. Spuštění desktopové aplikace

 * Vyžadováno JDK 15

 Konfigurační soubor: `javafx-frontend/src/main/resources/config/api_config.json`

 Příkaz: `./gradlew run` ve složce `javafx-frontend`
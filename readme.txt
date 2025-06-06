1. Nastavení DB

mysql -u root -p < syshosp.sql


2. Spuštění backendu

 * Vyžadováno JDK 15

 Konfigurační soubor: `backend/settings.json`
 Konfigurační soubor je vygenerován při prvním spuštění.

 Příkaz: `./gradlew run` ve složce `backend`

3. Spuštění webové aplikace

 * Vyžadováno node.js/npm

 Konfigurační soubor: `react-frontend/src/config.ts` 

 Příkazy: `npm install` ve složce `react-frontend-doctor` a `react-frontend-patient`
          `npm start` ve složce `react-frontend` a `react-frontend-patient`

4. Spuštění desktopové aplikace

 * Vyžadováno JDK 15

 Konfigurační soubor: `javafx-frontend/src/main/resources/config/api_config.json`

 Příkaz: `./gradlew run` ve složce `javafx-frontend`

5. for testing pusposes, please visit this github repository, which will contain IP address for testing server. In this server you will be able to test my development.
http://138.201.152.25:3000/
http://138.201.152.25:9000/
package sample.mysql;

import sample.model.CinemaChild;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MySQLClient {
    private static final String JDBC_DRIVER = "com.mysql.cj.jdbc.Driver";
    private static final String URL = "jdbc:mysql://192.168.1.88:4406/";
    private static final String USER = "83-10";
    private static final String PASS = "qunb8p";
    private static final String comma = ",";
    private static final String symbol1 = "'";
    private static final char symbol2 = '"';

    private String name = "";
    private String address = "";
    private String startingDate = "";
    private String placesCount = "";
    private String screensCount = "";
    private String technology = "";
    private String threeD = "";

    private static Statement stmt;
    private static Connection con;
    private List<CinemaChild> bcList;
    private List<String> dateTime;
    private List<String> errorText;

    /**
     * Метод для підключення до бази даних
     *
     * @param db назва бази даних
     * @return повертає результат підключення
     * @throws ClassNotFoundException
     */
    public Connection connectToDB(String db) throws ClassNotFoundException {
        String DB_URL = URL + db + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        Class.forName(JDBC_DRIVER);
        try {
            con = DriverManager.getConnection(DB_URL, USER, PASS);
        } catch (Exception e) {
            con = null;
        }
        return con;
    }

    /**
     * Метод для створення таблиці Cinema
     *
     * @throws SQLException
     */
    public void createCinemaTable() throws SQLException {

        String createTable = "CREATE TABLE IF NOT EXISTS Cinema (\n" +
                "  `id` INT(11) NOT NULL AUTO_INCREMENT,\n" +
                "  `name` VARCHAR(45) NOT NULL,\n" +
                "  `address` VARCHAR(45) NOT NULL,\n" +
                "  `startingDate` VARCHAR(45) NOT NULL,\n" +
                "  `placesCount` VARCHAR(45) NOT NULL,\n" +
                "  `screensCount` VARCHAR(45) NOT NULL,\n" +
                "  `technology` VARCHAR(45) NOT NULL,\n" +
                "  `threeD` VARCHAR(45) NOT NULL,\n" +
                "  PRIMARY KEY (`id`),\n" +
                "  UNIQUE INDEX `name_UNIQUE` (`name` ASC));";
        stmt = con.createStatement();
        stmt.executeUpdate(createTable);
    }

    /**
     * Метод для створення таблиці Log
     *
     * @throws SQLException
     */
    public void createLogTable() throws SQLException {
        String createTable = "CREATE TABLE IF NOT EXISTS Log (\n" +
                "  `DateTime` DATETIME NOT NULL,\n" +
                "  `Text` LONGTEXT NOT NULL,\n" +
                "  PRIMARY KEY (`DATETIME`))";
        stmt = con.createStatement();
        stmt.executeUpdate(createTable);
    }

    /**
     * Метод для завантаження даних в MySQL
     *
     * @param bcList колекція
     * @throws SQLException
     */
    public void loadDataToDB(List<CinemaChild> bcList) throws SQLException {
        CinemaChild b;
        for (int i = 0; i < bcList.size(); i++) {
            b = bcList.get(i);
            name = b.getName();
            address = b.getAddress();
            startingDate = b.getStartingDate().toInstant().toString();
            placesCount = b.getPlacesCount().toString();
            screensCount = b.getScreensCount().toString();
            technology = b.getTechnology();
            threeD = b.getThreeD().toString();

            String insert = "INSERT INTO Cinema(name, address, startingDate, placesCount, screensCount, technology, threeD) VALUES(" +
                    symbol1 + name + symbol1 + comma + symbol1 + address + symbol1 + comma + symbol1 + startingDate + symbol1 + comma + symbol1 + placesCount +
                    symbol1 + comma + symbol1 + screensCount + symbol1 + comma + symbol1 + technology + symbol1 + comma + symbol1 + threeD + symbol1 + ");";
            stmt = con.createStatement();
            stmt.executeUpdate(insert);
        }
    }

    /**
     * Завантаження даних з таблиці Cinema
     *
     * @throws Exception
     */
    public void loadFromCinemaTable() throws Exception {
        String MIN = "SELECT MIN(id) FROM Cinema;";
        stmt = con.createStatement();
        ResultSet rs = stmt.executeQuery(MIN);
        int min = 0;
        if (rs.next()) {
            min = rs.getInt(1);
        }
        String MAX = "SELECT MAX(id) FROM Cinema;";
        stmt = con.createStatement();
        rs = stmt.executeQuery(MAX);
        int max = 0;
        if (rs.next()) {
            max = rs.getInt(1);
        }
        bcList = new ArrayList<>();
        for (int i = min; i <= max; i++) {
            String id = Integer.toString(i);
            String SELECT = "SELECT * FROM Cinema WHERE id=" + id + ";";
            stmt = con.createStatement();
            rs = stmt.executeQuery(SELECT);
            while (rs.next()) {
                CinemaChild bc = new CinemaChild();

                bc.setName(rs.getString("name"));
                bc.setAddress(rs.getString("address"));
                bc.setStartingDate(rs.getString("startingDate").substring(0, rs.getString("startingDate").indexOf('T')));
                bc.setPlacesCount(rs.getString("placesCount"));
                bc.setScreensCount(rs.getString("screensCount"));
                bc.setTechnology(rs.getString("technology"));
                bc.setThreeD(rs.getString("threeD"));
                bc.setId(rs.getInt("id"));

                bcList.add(bc);
            }
        }
    }

    /**
     * Завантаження даних з таблиці Log
     *
     * @throws SQLException
     */
    public void loadFromLogTable() throws SQLException {
        String COUNT = "SELECT COUNT(*) FROM Log";
        stmt = con.createStatement();
        ResultSet rs = stmt.executeQuery(COUNT);
        int count = 0;
        if (rs.next()) {
            count = rs.getInt(1);
        }
        dateTime = new ArrayList<>();
        errorText = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            String OFFSET = Integer.toString(i);
            String select = "SELECT * FROM Log ORDER BY DATETIME DESC LIMIT 1 OFFSET " + OFFSET + ";";
            stmt = con.createStatement();
            rs = stmt.executeQuery(select);
            while (rs.next()) {
                dateTime.add(rs.getString(1));
                errorText.add(rs.getString(2));
            }
        }
    }

    /**
     * Повернення об'єкту з таблиці Cinema
     *
     * @param index індекс об'єкту
     * @return повертає об'єкт таблиці Cinema
     */
    public CinemaChild getCinema(int index) {
        return bcList.get(index);
    }

    /**
     * Повернення кількості об'єктів в таблиці Cinema
     *
     * @return повертає кількість об'єктів в таблиці Cinema
     * @throws SQLException
     */
    public int getCinemaCount() throws SQLException {
        String COUNT = "SELECT COUNT(*) FROM Cinema;";
        stmt = con.createStatement();
        ResultSet rs = stmt.executeQuery(COUNT);
        int count = 0;
        if (rs.next()) {
            count = rs.getInt(1);
        }
        return count;
    }

    /**
     * Повернення дати та часу з таблиці Log
     *
     * @param index індекс об'єкту
     * @return повертає дату та час
     */
    public String getDateTime(int index) {
        return dateTime.get(index);
    }

    /**
     * Повернення тексту помилки з таблиці Log
     *
     * @param index індекс об'єкту
     * @return повертає текст помилки
     */
    public String getErrorText(int index) {
        return errorText.get(index);
    }

    /**
     * Повернення кількості об'єктів в таблиці Log
     *
     * @return повертає кількість об'єктів в таблиці Log
     */
    public int getLogCount() {
        return dateTime.size();
    }

    /**
     * Додавання нового об'єкту в таблицю Cinema
     *
     * @param b об'єкт класу Cinema
     * @throws SQLException
     */
    public void insertIntoCinemaTable(CinemaChild b) throws SQLException {

        name = b.getName();
        address = b.getAddress();
        startingDate = b.getStartingDate().toString();
        placesCount = b.getPlacesCount().toString();
        screensCount = b.getScreensCount().toString();
        technology = b.getTechnology();
        threeD = b.getThreeD().toString();

        String insert = "INSERT INTO Cinema(name, address, startingDate, placesCount, screensCount, technology, threeD) VALUES(" +
                symbol1 + name + symbol1 + comma + symbol1 + address + symbol1 + comma + symbol1 + startingDate + symbol1 + comma + symbol1 + placesCount +
                symbol1 + comma + symbol1 + screensCount + symbol1 + comma + symbol1 + technology + symbol1 + comma + symbol1 + threeD + symbol1 + ");";

        stmt = con.createStatement();
        stmt.executeUpdate(insert);
        String MAX = "SELECT MAX(id) FROM Cinema;";
        stmt = con.createStatement();
        ResultSet rs = stmt.executeQuery(MAX);
        if (rs.next()) {
            b.setId(rs.getInt(1));
        }
        bcList.add(b);
    }

    /**
     * Апдейт об'єкту таблиці Cinema
     *
     * @param b об'єкт таблиці Cinema
     * @throws SQLException
     */
    public void update(CinemaChild b) throws SQLException {
        for (CinemaChild currentCinema : bcList) {
            if (currentCinema.getId() == b.getId()) {

                name = "name = " + symbol1 + b.getName() + symbol1;
                address = "address = " + symbol1 + b.getAddress() + symbol1;
                startingDate = "startingDate = " + symbol1 + b.getStartingDate() + symbol1;
                placesCount = "placesCount = " + symbol1 + b.getPlacesCount() + symbol1;
                screensCount = "screensCount = " + symbol1 + b.getScreensCount() + symbol1;
                technology = "technology = " + symbol1 + b.getTechnology() + symbol1;
                threeD = "threeD = " + symbol1 + b.getThreeD() + symbol1;

                String update = "UPDATE Cinema SET " + name + comma + address + comma + startingDate + comma
                        + placesCount + comma + screensCount + comma + technology + comma + threeD + " WHERE id = " + b.getId() + ";";
                stmt = con.createStatement();
                stmt.executeUpdate(update);
            }
        }
    }

    /**
     * Видалення з таблиці Cinema
     *
     * @param b об'єкт таблиці Cinema
     * @throws SQLException
     */
    public void delete(CinemaChild b) throws SQLException {
        for (CinemaChild currentCinema : bcList) {
            if (currentCinema.getId() == b.getId()) {
                bcList.remove(currentCinema);
                String delete = "DELETE FROM Cinema WHERE id = " + b.getId() + ";";
                stmt = con.createStatement();
                stmt.executeUpdate(delete);
                break;
            }
        }
    }

    /**
     * Видалення всіх об'єктів таблиці Cinema
     *
     * @throws SQLException
     */
    public void deleteAll() throws SQLException {
        String delete = "DELETE FROM Cinema";
        stmt = con.createStatement();
        stmt.executeUpdate(delete);
        bcList.clear();
    }

    /**
     * Запис помилки в таблицю Log
     *
     * @param error помилка
     * @throws SQLException
     */
    public void insertIntoLogTable(String error) throws SQLException {
        String insert = "INSERT INTO Log VALUES(NOW()," + symbol2 + error + symbol2 + ");";
        stmt = con.createStatement();
        stmt.executeUpdate(insert);
    }
}

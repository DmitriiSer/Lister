package com.lister.utils;

import com.lister.servlets.UserProfile;
import static com.lister.utils.Utils.errorMesage;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * @author dmitr
 */
public class DBUtils {
    private static final Logger logger = LogManager.getLogger(DBUtils.class);

    private static Connection con = null;
    public static boolean loadDriver() {
        // The newInstance() call is a work around for some
        // broken Java implementations
        try {
            Class.forName("com.mysql.jdbc.Driver").newInstance();
            return true;
        } catch (Exception e) {
            logger.error(errorMesage(e));
            return false;
        }
    }
    public static boolean connect() {
        try {
            // Localhost
            // "jdbc:mysql://localhost:3306/lister", "root", "root"
            logger.info("Attempting to get database connection");
            String url = "jdbc:mysql://127.12.206.2:3306/lister";
            con = DriverManager.getConnection(url,"admintxyeVtZ","R9AGStuM75FE");
            logger.info("Connection to the database was established");
            return true;
        } catch (SQLException e) {
            logger.error("Connection to the database was not established", e);
            //logger.error(errorMesage(e));
            return false;
        }
    }
    public static void disconnect() {
        try {
            con.close();
        } catch (SQLException e) {
            logger.error(errorMesage(e));
        }
    }
    public static boolean checkUserExistance(String username) {
        try {
            Statement stmt = con.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT UserName FROM users");
            while (rs.next()) {
                // check if 'username' equalsIgnoreCase to 'UserName' in 'users' table
                if (username.equalsIgnoreCase(rs.getString("UserName"))) {
                    rs.close();
                    stmt.close();
                    return true;
                }
            }
            rs.close();
            stmt.close();
            return false;
        } catch (SQLException e) {
            logger.error(errorMesage(e));
            return false;
        }
    }
    public static boolean checkListExistance(String username, String listname) {
        try {
            Statement stmt = con.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT UserName, ListName FROM lists WHERE UserName='"
                    + username + "' AND ListName='" + listname + "'");
            while (rs.next()) {
                // check if 'username' equalsIgnoreCase to 'UserName' in 'users' table
                rs.close();
                stmt.close();
                return true;
            }
            rs.close();
            stmt.close();
            return false;
        } catch (SQLException e) {
            logger.error(errorMesage(e));
            return false;
        }
    }
    public static boolean createUser(String username, String password, String avatar) {
        try {
            Statement stmt = con.createStatement();
            stmt.executeUpdate("INSERT INTO users(UserName, Password, Avatar) "
                    + "VALUES('" + username + "', '" + password + "', '" + avatar + "')");
            stmt.close();
            return true;
        } catch (SQLException e) {
            logger.error(errorMesage(e));
            return false;
        }
    }
    public static boolean checkCreds(String username, String password) {
        try {
            Statement stmt = con.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT UserName, Password FROM users");
            while (rs.next()) {
                // check if 'username' equalsIgnoreCase to 'UserName' in 'users' table
                if (username.equalsIgnoreCase(rs.getString("UserName"))) {
                    // check if 'password' equals to 'Password' in 'users' table
                    if (password.equals(rs.getString("Password"))) {
                        rs.close();
                        stmt.close();
                        return true;
                    }
                }
            }
            rs.close();
            stmt.close();
            return false;
        } catch (SQLException e) {
            logger.error(errorMesage(e));
            return false;
        }
    }
    public static UserProfile getUserProfile(String username) {
        try {
            Statement stmt = con.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM users");
            while (rs.next()) {
                // check if 'username' equalsIgnoreCase to 'UserName' in 'users' table
                if (username.equalsIgnoreCase(rs.getString("UserName"))) {
                    // return UserProfile object
                    UserProfile userInfo = new UserProfile(rs.getString("UserName"), rs.getString("Avatar"));
                    rs.close();
                    stmt.close();
                    return userInfo;
                }
            }
            rs.close();
            stmt.close();
            return null;
        } catch (SQLException e) {
            logger.error(errorMesage(e));
            return null;
        }
    }
    public static List<String> getLists(String username) {
        try {
            List<String> lists = new ArrayList<>();
            Statement stmt = con.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM lists WHERE UserName='" + username + "'");
            while (rs.next()) {
                // check if 'username' equalsIgnoreCase to 'UserName' in 'users' table
                if (username.equalsIgnoreCase(rs.getString("UserName"))) {
                    logger.info(rs.getString("UserName") + ", " + rs.getString("ListName"));
                    lists.add(rs.getString("ListName"));
                }
            }
            rs.close();
            stmt.close();
            return lists;
        } catch (SQLException e) {
            logger.error(errorMesage(e));
            return null;
        }
    }
    public static boolean createList(String username, String listname) {
        try {
            Statement stmt = con.createStatement();
            stmt.executeUpdate("INSERT INTO lists(UserName, ListName) "
                    + "VALUES('" + username + "', '" + listname + "')", Statement.RETURN_GENERATED_KEYS);
            ResultSet rs = stmt.getGeneratedKeys();
            long listID = -1;
            if (rs.next()) {
                listID = rs.getLong(1);
            }
            stmt = con.createStatement();
            stmt.executeUpdate("INSERT INTO list_contents(ListID, DataRef) "
                    + "VALUES('" + listID + "', '/data/" + username + "_" + listname + ".dt')");
            rs.close();
            stmt.close();
            return true;
        } catch (SQLException e) {
            logger.error(errorMesage(e));
            return false;
        }
    }
    public static boolean removeList(String username, String listname) {
        try {
            Statement stmt = con.createStatement();
            int result = stmt.executeUpdate("DELETE FROM lists WHERE UserName='" + username + "' AND ListName='" + listname + "'");
            if (result != 1) {
                throw new SQLException("There is no rows to delete from table 'lists'");
            }
            stmt.close();
            return true;
        } catch (SQLException e) {
            logger.error(errorMesage(e));
            return false;
        }
    }
    public static String getListContentRef(String username, String listname) throws Exception {
        String DataRef = null;
        try {
            Statement stmt = con.createStatement();
            ResultSet rs;
            rs = stmt.executeQuery("SELECT ListId FROM lists WHERE UserName='" + username + "' AND ListName='" + listname + "'");
            String listID = null;
            while (rs.next()) {
                listID = rs.getString("ListID");
            }
            rs.close();
            rs = stmt.executeQuery("SELECT DataRef FROM list_contents WHERE ListID='" + listID + "'");
            while (rs.next()) {
                DataRef = rs.getString("DataRef");
                logger.info(DataRef);
            }
        } catch (SQLException e) {
            logger.error(errorMesage(e));
        }
        return DataRef;
    }
}

package com.lister.utils;

import com.lister.servlets.UserProfile;
import static com.lister.utils.Utils.errorMesage;
import java.math.BigDecimal;
import java.net.UnknownHostException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import javax.servlet.http.HttpServletRequest;
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
            // trying to connect to local database
            try {
                // Localhost database connection
                con = DriverManager.getConnection("jdbc:mysql://localhost:3306/lister", "root", "root");
            } catch (SQLException ex1) {
                // trying to connect to remote (http://lister-advancedlists.rhcloud.com/) database
                try {
                    // Remote "http://lister-advancedlists.rhcloud.com/" database connectipn
                    con = DriverManager.getConnection("jdbc:mysql://127.12.206.2:3306/lister", "admintxyeVtZ", "R9AGStuM75FE");
                } catch (SQLException ex2) {
                    throw ex2;
                }
            }
            return true;
        } catch (Exception e) {
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
            ResultSet rs = stmt.executeQuery("SELECT * FROM lists WHERE UserName='" + username + "' ORDER BY ListOrder");
            while (rs.next()) {
                // check if 'username' equalsIgnoreCase to 'UserName' in 'users' table
                if (username.equalsIgnoreCase(rs.getString("UserName"))) {
                    //logger.info(rs.getString("UserName") + ", " + rs.getString("ListName"));
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
    public static boolean createList(String username, String listname, int listsSize) {
        try {
            Statement stmt = con.createStatement();
            stmt.executeUpdate("INSERT INTO lists(UserName, ListName, ListOrder) "
                    + "VALUES('" + username + "', '" + listname + "', '" + listsSize + "')", Statement.RETURN_GENERATED_KEYS);
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
    public static String renameList(String username, String oldListname, String listname) {
        try {
            Statement stmt = con.createStatement();
            int result = stmt.executeUpdate("UPDATE lists SET ListName='" + listname + "' WHERE UserName='" + username + "' AND ListName='" + oldListname + "'");
            if (result != 1) {
                throw new SQLException("There is no rows to modify in table 'lists'");
            }
            updateListContentRef(username, listname);
            stmt.close();
            logger.info("The list with name '" + oldListname + "' was renamed to '" + listname + "'");
            return "/data/" + username + "_" + listname + ".dt";
        } catch (SQLException e) {
            logger.error(errorMesage(e));
            return null;
        }
    }
    public static boolean removeList(String username, String listname, int listsSize) {
        try {
            Statement stmt = con.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT ListOrder FROM lists WHERE UserName='" + username + "' AND ListName='" + listname + "'");
            String currentListOrder = null;
            while (rs.next()) {
                currentListOrder = rs.getString("ListOrder");
            }
            //
            logger.info("currentListOrder = " + currentListOrder);
            try {
                int intCurrentListOrder = Integer.parseInt(currentListOrder);
                if (intCurrentListOrder < 0 || intCurrentListOrder > listsSize - 1) {
                    throw new Exception("List data integrity was violated");
                }
                int subtracter = 1;
                for (int i = intCurrentListOrder + 1; i < listsSize; i++) {
                    ResultSet rs1 = stmt.executeQuery("SELECT ListName FROM lists WHERE UserName='" + username + "' AND ListOrder='" + i + "'");
                    String nextListName = null;
                    while (rs1.next()) {
                        nextListName = rs1.getString("ListName");
                    }
                    if (nextListName == null) {
                        subtracter += 1;
                        continue;
                    }
                    int result = stmt.executeUpdate("UPDATE lists SET ListOrder='" + (i - subtracter) + "' WHERE UserName='" + username
                            + "' AND ListName='" + nextListName + "'");
                    if (result != 1) {
                        throw new SQLException("There is no rows to delete from table 'lists'");
                    }
                }
            } catch (Exception e) {
                throw new SQLException(e.getMessage());
            }
            // removing the current list from
            int result = stmt.executeUpdate("DELETE FROM lists WHERE UserName='" + username + "' AND ListName='" + listname + "'");
            if (result != 1) {
                throw new SQLException("There is no rows to delete from table 'lists'");
            }
            stmt.close();
            logger.info("The record in the database was removed");
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
            rs = stmt.executeQuery("SELECT ListID FROM lists WHERE UserName='" + username + "' AND ListName='" + listname + "'");
            String listID = null;
            while (rs.next()) {
                listID = rs.getString("ListID");
            }
            rs.close();
            rs = stmt.executeQuery("SELECT DataRef FROM list_contents WHERE ListID='" + listID + "'");
            while (rs.next()) {
                DataRef = rs.getString("DataRef");
                //logger.info(DataRef);
            }
            stmt.close();
        } catch (SQLException e) {
            logger.error(errorMesage(e));
        }
        return DataRef;
    }
    private static void updateListContentRef(String username, String listname) throws SQLException {
        String DataRef = null;
        Statement stmt = con.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT ListID FROM lists WHERE UserName='" + username + "' AND ListName='" + listname + "'");
        String listID = null;
        while (rs.next()) {
            listID = rs.getString("ListID");
        }
        rs.close();
        stmt = con.createStatement();
        int result = stmt.executeUpdate("UPDATE list_contents SET DataRef='/data/" + username + "_" + listname + ".dt' WHERE ListID='" + listID + "'");
        if (result != 1) {
            throw new SQLException("There is no rows to modify in table 'list_contents'");
        }
        stmt.close();
    }
    public static void changeListsOrder(String username, List<String> oldListTitles, List<String> newListIndexes) {
        try {
            logger.info(newListIndexes.toString());
            Statement stmt = con.createStatement();
            for (int i = 0; i < oldListTitles.size(); i++) {
                int result = stmt.executeUpdate("UPDATE lists SET ListOrder='" + newListIndexes.get(i) + "' WHERE UserName='" + username
                        + "' AND ListName='" + oldListTitles.get(i) + "'");
            }
            String listOrder = null;
            stmt.close();
        } catch (SQLException e) {
            logger.error(errorMesage(e));
        }
    }
}

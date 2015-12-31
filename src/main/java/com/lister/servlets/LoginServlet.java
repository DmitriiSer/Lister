package com.lister.servlets;

import com.google.gson.Gson;
import com.lister.utils.DBUtils;
import com.lister.utils.Utils;
import java.io.IOException;
import java.util.List;
import java.util.logging.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class LoginServlet extends HttpServlet {
    private static final Logger logger = LogManager.getLogger(LoginServlet.class);
    // Initialize GSON object
    private static final Gson gson = new Gson();
    public LoginServlet() {
        // load JDBC driver
        if (!DBUtils.loadDriver()) {
            logger.error("JDBC driver was not loaded correctly");
        } else {
            logger.info("JDBC driver was loaded correctly");
        }
    }
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            // set response type to JSON
            response.setContentType("application/json");
            HttpSession session = request.getSession(/*false*/); // 'false' - do not create a new session if does not exist
            String sessionRemoteIP = (String) session.getAttribute("RemoteIP");
            String sessionUsername = (String) session.getAttribute("Username");
            // check if requested 'isLoggedIn'
            if (request.getParameter("isLoggedIn") != null) {
                // check if it's a first attempt to log in
                if (sessionRemoteIP == null) {
                    logger.info("user [" + request.getRemoteAddr() + "] requires an authentification");
                    Utils.sendResponse(LoginServlet.class.getName(), response, new UserProfile());
                } // check if user already logged in and it's remote IP is the same as IP stored in session
                else {
                    logger.info("User [" + request.getRemoteAddr()
                            + "] have already been logged in session [" + session.getId() + "]");
                    // update list titles
                    // connect to database
                    List<String> lists = null;
                    logger.info("Attempting to get database connection");
                    if (DBUtils.connect()) {
                        logger.info("Connection to the database was established");
                        lists = DBUtils.getLists(sessionUsername);
                        logger.info("Retrieving user lists: [" + lists + "]");
                        // close the connection
                        DBUtils.disconnect();
                    } else {
                        logger.error("Connection to the database was not established");
                        throw new IOException("LoginServlet cannot connect to the database");
                    }
                    UserProfile sessionData = (UserProfile) session.getAttribute("Data");
                    if (sessionData == null) {
                        throw new IOException("LoginServlet cannot obtain session data");
                    }
                    sessionData.setListTitles(lists);
                    session.setAttribute("Data", sessionData);
                    Utils.sendResponse(LoginServlet.class.getName(), response, (UserProfile) session.getAttribute("Data"));
                }
            } // check if requested 'logout'
            else if (request.getParameter("logout") != null) {
                session.invalidate();
                logger.info("user [" + request.getRemoteAddr() + "] sent 'logout' and session [" + session.getId() + "] was invalidated");
                Utils.sendResponse(LoginServlet.class.getName(), response, new UserProfile());
                //response.sendRedirect("/Lister/index.html");
            } // wrong request
            else {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "Wrong request");
            }
        } catch (Exception e) {
            logger.error(Utils.errorMesage(e));
            try {
                response.sendError(HttpServletResponse.SC_CONFLICT, "ServerError: " + e.getMessage());
            } catch (IOException ex) {
                logger.error(Utils.errorMesage(ex));
            }
        }
    }
    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        try {
            // set response type to JSON
            response.setContentType("application/json");
            // get UserProfile from request body
            UserProfile userProfile = (UserProfile) Utils.fromJson(LoginServlet.class.getName(), request, UserProfile.class);
            String username = userProfile.getUsername();
            String password = userProfile.getPassword();
            // connect to database
            logger.info("Attempting to get database connection");
            if (DBUtils.connect()) {
                logger.info("Connection to the database was established");
                // check if user with the right credentials from the request exists
                if (DBUtils.checkCreds(username, password)) {
                    // credentials are correct
                    userProfile = DBUtils.getUserProfile(username);
                    List<String> lists = DBUtils.getLists(username);
                    userProfile.setLoggedIn(true);
                    userProfile.setListTitles(lists);
                    // get session object and set session relative attributes
                    HttpSession session = request.getSession(false);
                    if (session == null) {
                        session = request.getSession(true);
                    }
                    session.setAttribute("RemoteIP", new String(request.getRemoteAddr()));
                    session.setAttribute("Username", new String(username));
                    session.setAttribute("Data", userProfile);
                    // send user profile back to client
                    logger.info("User [" + request.getRemoteAddr() + "] is logged in in session [" + session.getId() + "]");
                    Utils.sendResponse(LoginServlet.class.getName(), response, userProfile);
                } // wrong credentials
                else {
                    Utils.sendResponse(LoginServlet.class.getName(), response, "Username or password is incorrect");
                }
                // close the connection
                DBUtils.disconnect();
            } else {
                logger.error("Connection to the database was not established");
                response.sendError(HttpServletResponse.SC_CONFLICT, "ServerError: LoginServlet cannot connect to the database");
                throw new IOException("LoginServlet cannot connect to the database");
            }
        } catch (Exception e) {
            try {
                response.sendError(HttpServletResponse.SC_CONFLICT, "ServerError: " + e.getMessage());
            } catch (IOException ie) {
                logger.error(Utils.errorMesage(ie));
            }
            logger.error(Utils.errorMesage(e));
        }
    }
    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "LoginServlet is responsible for user authentification process";
    }
}

package com.lister.servlets;

import com.google.gson.Gson;
import com.lister.utils.DBUtils;
import com.lister.utils.Utils;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * @author dmitr
 */
public class SignUpServlet extends HttpServlet {
    private static final Logger logger = LogManager.getLogger(SignUpServlet.class);
    // Initialize GSON object
    private static final Gson gson = new Gson();
    public SignUpServlet() {
        // load JDBC driver
        if (!DBUtils.loadDriver()) {
            logger.error("JDBC driver was not loaded correctly");
        } else {
            logger.info("JDBC driver was loaded correctly");
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
            UserProfile userProfile = (UserProfile) Utils.fromJson(SignUpServlet.class.getName(), request, UserProfile.class);
            String username = userProfile.getUsername();
            String password = userProfile.getPassword();
            String avatar = userProfile.getAvatar();
            // connect to database
            if (DBUtils.connect()) {
                //ResponseJsonObject responseJsonObject = new ResponseJsonObject();
                // check if user exists in DB
                if (DBUtils.checkUserExistance(username)) {
                    response.sendError(422, "Validation Failed: User already exists");
                } // user doesn't exists in DB
                else {
                    // trying to create a user
                    if (DBUtils.createUser(username, password, avatar)) {
                        // log user creation
                        logger.info("user [" + request.getRemoteAddr() + "] with name [" + userProfile.getUsername()
                                + "] was created in database");
                        // clear the password
                        userProfile.clearPassword();
                        userProfile.setLoggedIn(true);
                        userProfile.setListTitles(new ArrayList<String>());
                        // get session object and set session relative attributes
                        HttpSession session = request.getSession(false);
                        session.setAttribute("RemoteIP", new String(request.getRemoteAddr()));
                        session.setAttribute("Username", new String(username));
                        session.setAttribute("Data", userProfile);
                        // send user profile back to client
                        logger.info("user [" + request.getRemoteAddr() + "] is logged in in session [" + session.getId() + "]");
                        Utils.sendResponse(SignUpServlet.class.getName(), response, userProfile);
                    } // servlet cannot create a user
                    else {
                        response.sendError(HttpServletResponse.SC_CONFLICT, "ServerError: User cannot be created in database");
                        throw new IOException("SignUpServlet cannot create user in database");
                    };
                }
                // close the connection
                DBUtils.disconnect();
            } else {
                response.sendError(HttpServletResponse.SC_CONFLICT, "ServerError: Internal error");
                throw new IOException("SignUpServlet cannot connect to the database");
            }
        } catch (Exception e) {
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
        return "SignUpServlet is responsible for signing up new users";
    }
}

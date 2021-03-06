package com.lister.servlets;

import com.lister.utils.DBUtils;
import com.lister.utils.FileUtils;
import com.lister.utils.Utils;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.List;
import java.util.logging.Level;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 *
 * @author Dmitrii Serikov
 */
@WebServlet(name = "DataServlet", urlPatterns = {"/DataServlet"})
public class DataServlet extends HttpServlet {
    private static final Logger logger = LogManager.getLogger(DataServlet.class);
    private String currentDirectory = null;
    public DataServlet() {
        // load JDBC driver
        if (!DBUtils.loadDriver()) {
            logger.error("JDBC driver was not loaded correctly");
        } else {
            logger.info("JDBC driver was loaded correctly");
        }
    }
    private void checkCurrentDirectory(HttpServletRequest request) throws IOException {
        // set FileUtils current directory
        //String currentDirectory = "C:\\Users\\dmitr\\workspace-nb";
        currentDirectory = System.getenv("OPENSHIFT_DATA_DIR");
        // chekc if currentDirectory is incorrect
        if (currentDirectory == null) {
            currentDirectory = "C:\\OpenShift";
            //currentDirectory = request.getServletContext().getRealPath("/");
        }
        // chekc if currentDirectory is still incorrect
        if (currentDirectory == null) {
            throw new IOException("DataServlet cannot find current directory");
        }
        if (currentDirectory != null) {
            logger.info("Current directory is \"" + currentDirectory + "\"");
        }
        FileUtils.setCurrentDirectory(currentDirectory);
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
            checkCurrentDirectory(request);
            // set response type to JSON
            response.setContentType("application/json");
            // set FileUtils current directory
            // FileUtils.setCurrentDirectory(getServletContext().getRealPath("/"));
            // FileUtils.setCurrentDirectory("C:\\Users\\dmitr\\workspace-nb");
            //
            HttpSession session = request.getSession(false);
            String sessionRemoteIP = (String) session.getAttribute("RemoteIP");
            String sessionUsername = (String) session.getAttribute("Username");
            // check if data stored in session came from the same IP address
            if (sessionRemoteIP != null && sessionRemoteIP.equals(request.getRemoteAddr())
                    && sessionUsername != null) {
                // connect to database
                logger.info("Attempting to get database connection");
                if (DBUtils.connect()) {
                    logger.info("Connection to the database was established");
                    // get a list content
                    if (request.getParameter("getList") != null) {
                        String paramListname = request.getParameter("getList");
                        String DataRef = DBUtils.getListContentRef(sessionUsername, paramListname);
                        // if there is a reference to a local file with list content
                        if (DataRef != null) {
                            String listContent = FileUtils.getFileContent(DataRef);
                            UserList userList = new UserList(paramListname, listContent, UserList.CREATED_BY_USER);
                            Utils.sendResponse(DataServlet.class.getName(), response, userList);
                            logger.info("User [" + sessionRemoteIP + "] requested list content for the list with name \"" + paramListname + "\"");
                        } // there is no a reference to a local file in database
                        else {
                            throw new IOException("DataServlet cannot get data reference from the database");
                        }
                    } // remove a list
                    else if (request.getParameter("removeList") != null) {
                        String paramListname = request.getParameter("removeList");
                        UserProfile sessionData = (UserProfile) session.getAttribute("Data");
                        String DataRef;
                        logger.info("Attempt to remove a record in the database and a file referenced to that record with list[" + paramListname + "] data");
                        if ((DBUtils.removeList(sessionUsername, paramListname, sessionData.lists.size()))
                                && (FileUtils.removeListFile("/data/" + sessionUsername + "_" + paramListname + ".dt"))
                                && (sessionData.removeList(paramListname))) {
                            logger.info("sessionData.lists = " + sessionData.lists.toString());
                            logger.info("The record in the database and the file were removed");
                            Utils.sendResponse(DataServlet.class.getName(), response, "list with name '" + paramListname + "' was deleted");
                            logger.info("user [" + sessionRemoteIP + "] removedr a list with name \"" + paramListname + "\"");
                        } else {
                            //response.sendError(HttpServletResponse.SC_CONFLICT, "ServerError: Internal error. File cannot be removed from the database");
                            throw new IOException("DataServlet cannot remove list " + paramListname + " from the database");
                        }
                    } // wrong request
                    else {
                        response.sendError(HttpServletResponse.SC_NOT_FOUND);
                    }
                } else {
                    throw new IOException("DataServlet cannot connect to the database");
                }
                // close the connection
                DBUtils.disconnect();
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
            checkCurrentDirectory(request);
            // set response type to JSON
            response.setContentType("application/json");
            // set FileUtils current directory
            //FileUtils.setCurrentDirectory(getServletContext().getRealPath("/"));
            //
            HttpSession session = request.getSession(false);
            String sessionRemoteIP = (String) session.getAttribute("RemoteIP");
            String sessionUsername = (String) session.getAttribute("Username");
            // check if data stored in session came from the same IP address
            if (sessionRemoteIP != null && sessionRemoteIP.equals(request.getRemoteAddr())
                    && sessionUsername != null) {
                // connect to database
                logger.info("Attempting to get database connection");
                if (DBUtils.connect()) {
                    logger.info("Connection to the database was established");
                    // add a new list
                    if (request.getParameter("addList") != null) {
                        String paramListname = request.getParameter("addList");
                        // get list content from request body
                        String listContent = (String) Utils.fromJson(DataServlet.class.getName(), request, String.class);
                        // check if there is no a list with the same name                        
                        if (DBUtils.checkListExistance(sessionUsername, paramListname)) {
                            // list already exists in database
                            response.sendError(HttpServletResponse.SC_CONFLICT, "ServerError: The list with name[" + paramListname + "] already exists in database");
                            throw new IOException("DataServlet cannot create a list in database");
                        } else {
                            // list does not exists in database
                            // create a list in database
                            logger.info("Attempt to create a record in the database and a file referenced to that record with list[" + paramListname + "] data");
                            UserProfile sessionData = (UserProfile) session.getAttribute("Data");
                            if (DBUtils.createList(sessionUsername, paramListname, sessionData.lists.size())
                                    && FileUtils.createListFile("/data/" + sessionUsername + "_" + paramListname + ".dt")) {
                                logger.info("The record in the database and the file were created");
                                String DataRef = DBUtils.getListContentRef(sessionUsername, paramListname);
                                if (DataRef != null) {
                                    // set list content
                                    FileUtils.setFileContent(DataRef, listContent);
                                    //
                                    sessionData.lists.add(paramListname);
                                    //UserList userList = new UserList(paramListname, "{}", UserList.CREATED_BY_SERVER);
                                    UserList userList = new UserList(paramListname, listContent, UserList.CREATED_BY_SERVER);
                                    Utils.sendResponse(DataServlet.class.getName(), response, userList);
                                    logger.info("List with name \"" + paramListname + "\" was created in user [" + sessionRemoteIP + "] profile");
                                } // there is no a reference to a local file in database
                                else {
                                    throw new IOException("DataServlet cannot get data reference from the database");
                                }
                            } else {
                                logger.error("The record in the database and the file were not created");
                                response.sendError(HttpServletResponse.SC_CONFLICT, "ServerError: The list with name[" + paramListname + "] cannot be created in database");
                                throw new IOException("DataServlet cannot create a list in database");
                            }
                        }
                    } // change list content
                    else if (request.getParameter("changeList") != null) {
                        String paramListname = request.getParameter("changeList");
                        logger.info("User [" + sessionRemoteIP + "] wants to change a list with name \"" + paramListname + "\"");
                        // get list content from request body
                        String listContent = (String) Utils.fromJson(DataServlet.class.getName(), request, String.class);
                        // if there is a reference to a local file with list content
                        String DataRef = DBUtils.getListContentRef(sessionUsername, paramListname);
                        if (DataRef != null) {
                            // check if list was renamed
                            String paramTitle = request.getParameter("title");
                            if (paramTitle != null) {
                                // rename the list
                                DataRef = DBUtils.renameList(sessionUsername, paramListname, paramTitle);
                                FileUtils.renameListFile(sessionUsername, paramListname, paramTitle);
                            }
                            // set list content
                            FileUtils.setFileContent(DataRef, listContent);
                            //UserList userList = new UserList(paramListname, listContent, UserList.CREATED_BY_USER);
                            //Utils.sendResponse(DataServlet.class.getName(), response, userList);
                        } // there is no a reference to a local file in database
                        else {
                            throw new IOException("DataServlet cannot get data reference from the database");
                        }
                    } else if (request.getParameter("reorderLists") != null) {
                        String reorderListsContent = (String) Utils.fromJson(DataServlet.class.getName(), request, String.class);
                        List<String> listOrderIndexes = new ArrayList<>(Arrays.asList(reorderListsContent.split(",")));
                        UserProfile sessionData = (UserProfile) session.getAttribute("Data");
                        List<String> newLists = new ArrayList<>();
                        for (int i = 0; i < listOrderIndexes.size(); i++) {
                            int listOrderIndex = listOrderIndexes.indexOf(Integer.toString(i));
                            String newListElement = sessionData.lists.get(listOrderIndex);
                            newLists.add(newListElement);
                        }
                        logger.info("prev lists: " + sessionData.lists.toString());
                        logger.info("new  lists: " + newLists.toString());
                        // reorder lists in the database
                        DBUtils.changeListsOrder(sessionUsername, sessionData.lists, listOrderIndexes);
                        // overwrite session data
                        sessionData.lists.clear();
                        sessionData.lists.addAll(newLists);

                        Utils.sendResponse(DataServlet.class.getName(), response, sessionData);
                    } // wrong request
                    else {
                        response.sendError(HttpServletResponse.SC_NOT_FOUND);
                    }
                } else {
                    logger.error("Connection to the database was not established");
                    throw new IOException("DataServlet cannot connect to the database");
                }
                // close the connection
                DBUtils.disconnect();
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
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "DataServlet is responsible for data transfer";
    }
}

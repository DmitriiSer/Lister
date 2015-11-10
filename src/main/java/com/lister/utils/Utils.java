package com.lister.utils;

import com.google.gson.Gson;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.http.HttpServletResponse;
import com.lister.servlets.UserProfile;
import java.io.BufferedReader;
import javax.servlet.http.HttpServletRequest;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 *
 * @author dmitr
 */
public class Utils {
    // Initialize GSON object
    private static final Gson gson = new Gson();
    //
    public static String errorMesage(Exception e) {
        StringBuilder stackTraceStringBuilder = new StringBuilder();
        stackTraceStringBuilder.append(e.toString() + "\r\n");
        for (int i = 0; i < e.getStackTrace().length; i++) {
            stackTraceStringBuilder.append(e.getStackTrace()[i] + "\r\n");
        }
        return stackTraceStringBuilder.toString();
    }
    public static void sendResponse(String callerClassName, HttpServletResponse response, Object obj) throws IOException {
        Logger logger = LogManager.getLogger(callerClassName);
        PrintWriter responsePrintWriter = response.getWriter();
        String responseString = gson.toJson(obj);
        logger.info("Server is trying to serialize obj=[" + obj + "]");
        logger.info("Server sent response: " + responseString);
        responsePrintWriter.print(responseString);
        responsePrintWriter.flush();
    }
    /*public static UserProfile fromJson(String callerClassName, HttpServletRequest request) {
     UserProfile userProfile = null;
     try {
     BufferedReader reader = request.getReader();
     String line;
     StringBuilder sb = new StringBuilder();
     while ((line = reader.readLine()) != null) {
     sb.append(line);
     }
     String requestJson = sb.toString();
     if (requestJson != null) {
     userProfile = gson.fromJson(requestJson, UserProfile.class);
     }
     } catch (IOException e) {
     Logger logger = LogManager.getLogger(callerClassName);
     logger.error(e);
     }
     return userProfile;
     }*/
    public static Object fromJson(String callerClassName, HttpServletRequest request, Class objectClass) {
        Object obj = null;
        try {
            BufferedReader reader = request.getReader();
            String line;
            StringBuilder sb = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            String requestJson = sb.toString();
            if (requestJson != null) {
                if (objectClass == String.class) {
                    return requestJson;
                } else {
                    obj = gson.fromJson(requestJson, objectClass);
                }
            }
        } catch (IOException e) {
            Logger logger = LogManager.getLogger(callerClassName);
            logger.error(e);
        }
        return obj;
    }
}

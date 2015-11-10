package com.lister.listeners;

import com.lister.servlets.LoginServlet;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 *
 * @author dmitr
 */
public class SessionListener implements HttpSessionListener {
    private static final Logger logger = LogManager.getLogger(LoginServlet.class);
    @Override
    public void sessionCreated(HttpSessionEvent e) {
        logger.info("session ["+ e.getSession().getId() + "] created");
    }
    @Override
    public void sessionDestroyed(HttpSessionEvent e) {
        logger.info("session ["+ e.getSession().getId() + "] destroyed");
    }
}

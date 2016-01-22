package com.lister.filters;

import java.io.IOException;
import java.util.Date;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class SessionTimeoutCookieFilter implements Filter {
    private static final Logger logger = LogManager.getLogger(SessionTimeoutCookieFilter.class);
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            long currentTime = System.currentTimeMillis();
            long expirationTime = currentTime + session.getMaxInactiveInterval() * 1000;
            Cookie cookie = new Cookie("serverTime", "" + currentTime);
            cookie.setPath("/");
            httpResponse.addCookie(cookie);
            cookie = new Cookie("sessionExpiry", "" + expirationTime);
            cookie.setPath("/");
            httpResponse.addCookie(cookie);
        }
        filterChain.doFilter(request, response);
    }
    @Override
    public void destroy() {
    }
}

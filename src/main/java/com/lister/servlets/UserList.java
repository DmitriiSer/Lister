package com.lister.servlets;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author dmitr
 */
public class UserList {
    public static final boolean CREATED_BY_USER = false;
    public static final boolean CREATED_BY_SERVER = true;
    private String title;
    private String content;
    private boolean createdByServer = true;
    public UserList(String title, String content) {
        this.title = title;
        this.content = content;
    }
    public UserList(String title, String content, boolean createdByServer) {
        this.title = title;
        this.content = content;
        this.createdByServer = createdByServer;
    }
}

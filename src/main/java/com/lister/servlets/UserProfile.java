package com.lister.servlets;

import java.util.List;

/**
 *
 * @author dmitr
 */
public class UserProfile {
    private String username;
    private String password;
    private String avatar;
    private boolean loggedIn;
    private int timeout;
    List<String> lists;
    //
    public UserProfile() {
    }
    public UserProfile(String username, String avatar) {
        this.username = username;
        this.avatar = avatar;
    }
    public String getUsername() {
        return username;
    }
    public String getPassword() {
        return password;
    }
    public void clearPassword() {
        this.password = "";
    }
    public String getAvatar() {
        return avatar;
    }
    public void setTimeout(int timeout) {
        this.timeout = timeout;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
    public void setLoggedIn(boolean loggedIn) {
        this.loggedIn = loggedIn;
    }
    public void setListTitles(List<String> lists) {
        this.lists = lists;
    }
    public boolean removeList(String listName) {
        try {
            this.lists.remove(listName);
        } catch (Exception e) {
            return false;
        }
        return true;
    }
}
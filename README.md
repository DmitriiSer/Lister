# Lister ([DEMO](http://lister-advancedlists.rhcloud.com))
### Version: 0.2.20
Lister is an on-line organizer that is written in HTML5, CSS, JavaScript, Java and is mobile-ready, natively looking, and backed by AngularJS and Ionic Fraeworks

<table align="center">
    <tr>
        <td>
            <h5>Small screen device:</h5>
            <img src="/../screenshots/screenshots/small_screen.gif?raw=true" title="Small screen device" height="240" width="160">
        </td>
        <td colspan="2">
            <h5>Big screen device:</h5>
            <img src="/../screenshots/screenshots/big_screen.gif?raw=true" title="Big screen device" height="240" width="480">
        </td>
        <td>
            <h5>Sign Up Process:</h5>
            <img src="/../screenshots/screenshots/signup.gif?raw=true" title="Sign Up process" height="240" width="160">
        </td>
    </tr>
    <tr>
        <td>
            <h5>Small size screen pop-up menu:</h5>
            <img src="/../screenshots/screenshots/popup_menu_small_screen.gif?raw=true" title="Small size screen pop-up menu" height="240" width="160">
        </td>
        <td>
            <h5>Pull to refresh feature:</h5>
            <img src="/../screenshots/screenshots/pull_to_refresh.gif?raw=true" title="Pull to refresh feature" height="240" width="160">
        </td>
        <td>
            <h5>Pull to close opened list:</h5>
            <img src="/../screenshots/screenshots/pull_to_close.gif?raw=true" title="Pull to close opened list" height="240" width="160">
        </td>
        <td>
            <h5>List reordering:</h5>
            <img src="/../screenshots/screenshots/list_reordering.gif?raw=true" title="List reordering" height="240" width="160">
        </td>
    </tr>
</table>

##### Main specifications:
  - [x] *All the lists are stored on a server*
  - [ ] ~~TODO: Fast syncronization between all the devices~~

##### Tech:
Lister uses a number of open source projects to work properly:
- [AngularJS] - HTML enhanced for web apps!
- [Bootstrap](http://getbootstrap.com/) - Bootstrap is the most popular HTML, CSS, and JS framework for developing responsive, mobile first projects on the web
- [Ionic](http://ionicframework.com) - Ionic is the beautiful. open source front-end SDK for developing hybrid mobile apps with web technologies
- [Font Awesome Icons](https://fortawesome.github.io/Font-Awesome/icons/) - The complete set of 605 icons in Font Awesome 4.5.0
- [UI Bootstrap](https://angular-ui.github.io/bootstrap/) - Bootstrap components written in pure [AngularJS] by the [AngularUI Team](http://angular-ui.github.io/)
- [Velocity.js](http://julian.com/research/velocity/) - Accelerated JavaScript animation
- [textarea-caret-position](https://github.com/component/textarea-caret-position) - Get the top and left coordinates of the caret in a [textarea] or [input type="text"], in pixels
- [SHA-3](https://code.google.com/p/crypto-js/#SHA-3) - SHA-3 is the winner of a five-year competition to select a new cryptographic hash algorithm where 64 competing designs were evaluated

And of course **Lister** itself is open source with a [public repository](https://github.com/DmitriiSer/Lister)
 on GitHub.
##### TODO:
- [ ] ISSUE: Scrolling textarea doesn't scroll checkboxes in list editor
- [ ] IMPROVEMENT: Create a toolbar in the list editor
- [ ] IMPROVEMENT: Reordering on mobile devices turns on only if user picked the "Reorder" menu item in list item pop-up menu
- [ ] IMPROVEMENT: Create an UI element displaying the online/offline status
- [ ] IMPROVEMENT: Fix "I forgot my password" link in the login window
- [ ] IMPROVEMENT: Create a task stack for the offline mode that would be responsible for uploading and syncing all the missed request to the server
- [x] ISSUE: Focusing the textarea in the list editor on mobile devices causes a sliding glitch
- [x] ~~IMPROVEMENT: Truncate list title on list thumbnail if length of text is bigger than 15 symbols~~
- [x] ~~IMPROVEMENT: Pull to close list editor~~
- [x] ~~ISSUE: Renaming a list does not rename it on the server~~
- [x] ~~ISSUE: Vertical list reordering causes wrong reordering~~
- [x] ~~ISSUE: Login window does not show the error messages anymore~~
- [x] ~~IMPROVEMENT: Make the minus button in the list editor show remove list dialog~~
- [x] ~~ISSUE: Turn off the poop-up list item menu for the desktop platform~~
- [x] ~~IMPROVEMENT: Show alert and confirmation messages~~
- [x] ~~ISSUE: Server does not save list content when user creates a list~~
- [x] ~~IMPROVEMENT: Save list order on the server after reordering~~
- [x] ~~IMPROVEMENT: Show pop-up window if session was expired~~
- [x] ~~ISSUE: Fixed some issues with session expiration mechanism~~

##### Changelog:
- v0.2.19 Truncate list title on list thumbnail if length of text is bigger than 15 symbols
- v0.2.18 Fixed some issues with session expiration mechanism
- v0.2.17 Created a session counter that is responsible for logging a user out when his session is expired
- v0.2.16 Made server remember lists order after user reorders them
- v0.2.15 Fixed an issue when the server didn't save list content on list creation
- v0.2.14 Removed a bottom border line on ion-header-bar side menu
- v0.2.13 Improved displaying the alert and confirmation messages
- v0.2.12 Turned off the poop-up list item menu for the desktop platform
- v0.2.11 Made the minus button in the list editor show removing confirmation dialog
- v0.2.10 Fixed an issue with the login window which was not showing the error messages
- v0.2.9 Fixed an issue with vertical list reordering which caused the wrong list reordering
- v0.2.8 Fixed an issue with renaming lists that would not rename it on the server
- v0.2.7 Redesigned list container to scroll all the visible lists
- v0.2.6 Redesigned list editor pull to close. Now it sticks to the outer border of the modal window
- v0.2.5 Fixed list title disappearing after drag'n'drop on mobile devices. Made list editor closing on pulling it down. Now on pressing Enter/Return in list editor's header makes text area in focus. Added the shortcut (Ctrl+Enter) for 'Submit' button in list editor
- v0.2.1 Minimum changes in servlets
- v0.2.0 Made it work on Android emulator
- v0.1.8 Added action sheet menu (mobile devices) if user holds a list button
- v0.1.7 Modifications in 'ngDraggable.js to resolve the issue with incorrect positioning of draggable element
- v0.1.6 Added 'ngDraggable' - drag and drop module for Angular JS and made it work with list representation
- v0.1.5 Fixed problem with side menu. It was impossible to drag it on mobile platforms
- v0.1.4 Fixed logout problem
- v0.1.3 Added side menu for mobile devices
- v0.1.2 Removed Ionic and Bootstrap CSS conflicts on login window
- v0.1.1 Replaced ngRoute module with ui-router that is used by Ionic. Other minor changes
- v0.1.0 Added ionic components for better mobile platforms support
- v0.0.7 Added angular-touche module for better mobile device support. Added deletion confirmation dialog.
- v0.0.6 Changed home.html layout to use just one 'plus' icon for all different layouts.Remove button and behavior for list tabs/thumbnails
- v0.0.5 Binded list data to UI elemets of 'listEditor'. Other UI improvements
- v0.0.4 Working on listEditor widget
- v0.0.3 Fixing roullete element to work without jQuery
- v0.0.2 Got rid of jQuery and Bootstrap.js. Got rid of hashtag in the URLs path. Created local session storage on the client side
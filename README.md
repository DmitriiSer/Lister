# Lister
### Version: 0.2.10
Lister is a mobile-ready, natively looking, AngularJS and Ionic powered HTML5 todo organizer.

##### Main specifications:
  - [x] *All the lists are stored on a server*
  - [ ] ~~Fast syncronization between all the devices~~

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
- [ ] Make minus button in list editor show remove list dialog
- [ ] IMPROVEMENT: Save list order on the server after reordering
- [ ] Create a toolbar in the list editor 
- [x] ~~Pull to close list editor~~
- [x] ~~ISSUE: Renaming a list does not rename it on the server~~
- [x] ~~ISSUE: Vertical list reordering causes wrong reordering~~
- [x] ~~ISSUE: Login window does not show the error messages anymore~~

##### Changelog:
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
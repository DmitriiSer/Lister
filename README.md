# Lister
### Version: 0.2.1
Lister is a mobile-ready, natively looking, AngularJS and Ionic powered HTML5 todo organizer.

##### Main specifications:
  - *All the lists are stored on a server*
  - ~~Fast syncronization between all the devices~~

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
- [ ] Pull to close list editor
- [ ] Save list order on the server after reordering
- [ ] Create an useful list editor toolbar

##### Changelog:
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
/*global */

// STANDALONE: pure js

(function (global) {
    "use strict";

    if (!global.JU.__JU){
        return;
    }

    // AutoPopulate Flag: global.JU_autoPopulateGlobal: bool
    var forcePush = false;

    // put the JU lib in the repo and publish all the libraries into the global namespace
    global.JU.publish(global.JU.__JU, global.JU._autoPopulateGlobal, forcePush);
    delete global.JU.__JU;

}(typeof window !== 'undefined' ? window : this));
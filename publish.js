/*global */

// STANDALONE: pure js

(function (global) {
    "use strict";

    if (!global.JU.__JU){
        return;
    }

    // AutoPopulate Flag: global.JU_autoPopulateGlobal: bool

    // put the JU lib in the repo
    global.JU.publish(global.JU.__JU, global.JU._autoPopulateGlobal, true);
    delete global.JU.__JU;

}(typeof window !== 'undefined' ? window : this));
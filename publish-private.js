/*global */

// STANDALONE: pure js

(function (global) {
    "use strict";

    if (!global.JU.__JU){
        return;
    }

    var populateGlobals = false, forcePush = false;

    // put the libraries into the private object _ju instead of the global namespace
    // eg. Str becomes _ju.Str
    global._ju = {};

    JU.publish(JU.__JU, populateGlobals, forcePush);
    delete JU.__JU;
    JU.activate(global._ju);

}(typeof window !== 'undefined' ? window : this));
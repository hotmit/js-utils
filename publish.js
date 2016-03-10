/*global */

// STANDALONE: pure js

(function (global, undefined) {
    "use strict";

    if (!global.JU.__JU){
        return;
    }

    // put the JU lib in the repo
    global.JU.publish(global.JU.__JU, global.JU._autoPublish, true);
    delete global.JU.__JU;

}(typeof window !== 'undefined' ? window : this));
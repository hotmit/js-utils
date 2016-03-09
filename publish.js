/*global, __JU */

// STANDALONE

(function (global, undefined) {
    "use strict";

    if (!global.__JU){
        return;
    }

    // put the JU lib in the repo
    global.JU.publish(global.__JU, global.JU._autoPublish, false);
    delete global.__JU;

}(typeof window !== 'undefined' ? window : this));
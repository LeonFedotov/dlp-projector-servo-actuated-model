/*
 * examples/servo.js
 * https://github.com/101100/pca9685
 *
 * Example to turn a servo motor in a loop.
 * Javascript version.
 *
 * Copyright (c) 2015-2016 Jason Heard
 * Licensed under the MIT license.
 */

"use strict";

var i2cBus = require('i2c-bus');

var Pca9685Driver = require('pca9685').Pca9685Driver;


// PCA9685 options
var options = {
    i2c: i2cBus.openSync(1),
    address: 0x40,
    frequency: 50,
    debug: true
};


// pulse lengths in microseconds (theoretically, 1.5 ms
// is the middle of a typical servo's range)
var speed = 1300;


// variables used in servoLoop
var pwm;
var current = -1;
var timer;


// loop to cycle through pulse lengths
function servoLoop() {
    timer = setTimeout(servoLoop, 500);
    pwm.setPulseLength(current, 1300);
    setTimeout(((current) => { //stop current in one seconds time
        return () => pwm.setPulseLength(current, 1500);
    }(current)), 1000);
    current = current >= 15 ? 0 : current+1;
}


// set-up CTRL-C with graceful shutdown
process.on("SIGINT", function () {
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");

    if (timer) {
        clearTimeout(timer);
        timer = null;
    }

    pwm.dispose();
});


// initialize PCA9685 and start loop once initialized
pwm = new Pca9685Driver(options, function startLoop(err) {
    if (err) {
        console.error("Error initializing PCA9685");
        process.exit(-1);
    }

    console.log("Starting servo loop...");
    servoLoop();
});

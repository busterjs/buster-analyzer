var buster = require("buster");

buster.testRunner.onCreate(function (runner) {
    runner.on("suite:end", function (results) {
        if (!results.ok) {
            setTimeout(function () {
                process.exit(1);
            }, 50);
        }
    });
});

require("./test/analyzer-test");
require("./test/file-reporter-test");

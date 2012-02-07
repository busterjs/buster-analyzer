var B = require("buster-core");
var levels = ["warning", "error", "fatal"];

function emitIfFailed(analyzer, results) {
    if (analyzer.emittedFail || !results.failed) { return; }
    analyzer.emit("fail", results);
    analyzer.emittedFail = true;
}

module.exports = B.extend(B.eventEmitter.create(), {
    create: function () {
        return B.extend(Object.create(this), {
            fatals: 0,
            errors: 0,
            warnings: 0,
            failLevel: 2,
            emittedFail: false
        });
    },

    fatal: function (message, data) {
        this.fatals += 1;
        this.emit("fatal", message, data);
        emitIfFailed(this, this.status());
    },

    error: function (message, data) {
        this.errors += 1;
        this.emit("error", message, data);
        emitIfFailed(this, this.status());
    },

    warning: function (message, data) {
        this.warnings += 1;
        this.emit("warning", message, data);
        emitIfFailed(this, this.status());
    },

    failOn: function (level) {
        var failLevel = levels.indexOf(level);
        if (failLevel < 0) { throw new Error("Unknown level " + level); }
        this.failLevel = failLevel;
    },

    status: function () {
        var self = this;
        var failCount = levels.filter(function (l, i) {
            return i >= self.failLevel;
        }).map(function (level) {
            return self[level + "s"];
        }).reduce(function (s, l) {
            return s + l;
        }, 0);

        return {
            warnings: this.warnings,
            errors: this.errors,
            fatals: this.fatals,
            failed: failCount > 0
        };
    }
});

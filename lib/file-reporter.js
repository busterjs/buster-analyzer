var B = require("buster-core");

function spaces(num) {
    var str = "";
    while (num--) { str += " "; }
    return str;
}

function tabsUntil(line, col) {
    var i, num = 0;
    for (i = 0; i < col; ++i) {
        if (/\t/.test(line.substr(i, 1))) {
            num += 1;
        }
    }
    return num;
}

function printError(error) {
    var label = "    " + (error.file || "<anonymous>"), content = "";
    if (typeof error.line === "number") {
        label += ":" + error.line;
        if (typeof error.col === "number") { label += ":" + error.col; }
    }
    if (error.content) {
        label += ":    ";
        content = error.content.replace(/\t/g, "    ");
    }
    this.print(label + content);
    if (typeof error.col === "number" && error.content) {
        var numTabs = tabsUntil(error.content, error.col - 1);
        var tabOffset = (numTabs * 4) - numTabs;
        var indent = spaces(label.length + error.col - 1 + tabOffset);
        this.print("\n" + indent + "^");
    }
    this.print("\n");
}

module.exports = {
    create: function (threshold, options) {
        return B.extend(buster.create(this), {
            threshold: threshold,
            io: options.io
        });
    },

    listen: function (analyzer) {
        analyzer.on("fatal", B.bind(this, "fatal"));
        analyzer.on("error", B.bind(this, "error"));
        analyzer.on("warning", B.bind(this, "warning"));
        return this;
    },

    fatal: function (message, data) {
        this.format(message, data);
    },

    error: function (message, data) {
        if (this.threshold === "fatal") { return; }
        this.format(message, data);
    },

    warning: function (message, data) {
        if (["fatal", "error"].indexOf(this.threshold) >= 0) { return; }
        this.format(message, data);
    },

    format: function (message, data) {
        this.io.puts(message);
        if (data && data.errors) {
            data.errors.filter(function (err) {
                return !!err;
            }).forEach(B.bind(this.io, printError));
        }
        if (data && !data.errors && data.hasOwnProperty("toString")) {
            this.io.puts("    " + data.toString());
        }
    }
};

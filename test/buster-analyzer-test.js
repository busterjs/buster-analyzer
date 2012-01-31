var buster = require("buster");
var analyzer = require("../lib/buster-analyzer");

buster.testCase("AnalyzerTest", {
    setUp: function () {
        this.jan = analyzer.create();
        this.listener = this.spy();
    },

    "emits fatal event": function () {
        this.jan.on("fatal", this.listener);
        this.jan.fatal("Oh", { id: 42 });

        assert.calledOnceWith(this.listener, "Oh", { id: 42 });
    },

    "emits error event": function () {
        this.jan.on("error", this.listener);
        this.jan.error("Oh", { id: 42 });

        assert.calledOnceWith(this.listener, "Oh", { id: 42 });
    },

    "emits warning event": function () {
        this.jan.on("warning", this.listener);
        this.jan.warning("Oh", { id: 42 });

        assert.calledOnceWith(this.listener, "Oh", { id: 42 });
    },

    "failOn": {
        "throws when setting non-existent level": function () {
            assert.exception(function () {
                this.jan.failOn("bogus");
            }.bind(this));
        },

        "does not throw when setting existent levels": function () {
            refute.exception(function () {
                this.jan.failOn("warning");
                this.jan.failOn("error");
                this.jan.failOn("fatal");
            }.bind(this));
        }
    },

    "status": {
        "is not failed by default": function () {
            refute(this.jan.status().failed);
        },

        "is not failed after error": function () {
            this.jan.error("Uh-oh");
            refute(this.jan.status().failed);
        },

        "is not failed after warning": function () {
            this.jan.warning("Uh-oh");
            refute(this.jan.status().failed);
        },

        "fails when receiving a fatal event": function () {
            this.jan.fatal("Oh noes");

            assert(this.jan.status().failed);
        },

        "failOn(error)": {
            setUp: function () {
                this.jan.failOn("error");
            },

            "fails on error": function () {
                this.jan.error("Oh noes");

                assert(this.jan.status().failed);
            },

            "fails on fatal": function () {
                this.jan.fatal("Oh noes");

                assert(this.jan.status().failed);
            },

            "does not fail on warning": function () {
                this.jan.warning("Oh noes");

                refute(this.jan.status().failed);
            }
        },

        "failOn(warning)": {
            setUp: function () {
                this.jan.failOn("warning");
            },

            "fails on error": function () {
                this.jan.error("Oh noes");

                assert(this.jan.status().failed);
            },

            "fails on fatal": function () {
                this.jan.fatal("Oh noes");

                assert(this.jan.status().failed);
            },

            "fails on warning": function () {
                this.jan.warning("Oh noes");

                assert(this.jan.status().failed);
            }
        }
    },

    "status includes stats": function () {
        this.jan.fatal("Ding!");
        this.jan.fatal("Dong!");
        this.jan.error("Ding!");
        this.jan.error("Dong!");
        this.jan.error("Poing!");
        this.jan.warning("Ding!");
        this.jan.warning("Dong!");
        this.jan.warning("Poing!");
        this.jan.warning("Pooong!");

        assert.equals(this.jan.status(), {
            failed: true,
            fatals: 2,
            errors: 3,
            warnings: 4
        });
    }
});

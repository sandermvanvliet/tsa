module.exports = function(grunt) {
    grunt.initConfig({
        clean: {
            default: ["lib"]
        },
        ts: {
            default: {
                src: ["src/*.ts", "!node_modules/**/*.ts", "!typings/**/*.ts"],
                outDir: "lib",
                module: "amd"
            }
        }
    });

    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-contrib-clean");

    grunt.registerTask("default", ["clean", "ts"]);
};

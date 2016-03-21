module.exports = function(grunt) {
    grunt.initConfig({
        ts: {
            default: {
                src: ["src/*.ts", "!node_modules/**/*.ts", "!typings/**/*.ts" ],
                outDir: "lib"
            }
        }
    });

    grunt.loadNpmTasks("grunt-ts");

    grunt.registerTask("default", ["ts"]);
};

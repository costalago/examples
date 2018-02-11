module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-ssh');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-http-server');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        'http-server': {
            'dev' : {
                'host' : "0.0.0.0",
                'port' : 2000
            }
        },

        ts: {
            // use to override the default options, See: http://gruntjs.com/configuring-tasks#options
            // these are the default options to the typescript compiler for grunt-ts:
            // see `tsc --help` for a list of supported options.
            options: {
                compile: true,                 // perform compilation. [true (default) | false]
                comments: false,               // same as !removeComments. [true | false (default)]
                target: 'es5',                 // target javascript language. [es3 | es5 (grunt-ts default) | es6]
                module: 'amd',                 // target javascript module style. [amd (default) | commonjs]
                sourceMap: true,               // generate a source map for every output js file. [true (default) | false]
                sourceRoot: '',                // where to locate TypeScript files. [(default) '' == source ts location]
                mapRoot: '',                   // where to locate .map.js files. [(default) '' == generated js location.]
                declaration: false,            // generate a declaration .d.ts file for every output js file. [true | false (default)]
                htmlModuleTemplate: 'My.Module.<%= filename %>',    // Template for module name for generated ts from html files [(default) '<%= filename %>']
                htmlVarTemplate: '<%= ext %>',                      // Template for variable name used in generated ts from html files [(default) '<%= ext %>]
                                                                    // Both html templates accept the ext and filename parameters.
                noImplicitAny: true,          // set to true to pass --noImplicitAny to the compiler. [true | false (default)]
                fast: "watch"                  // see https://github.com/TypeStrong/grunt-ts/blob/master/docs/fast.md ["watch" (default) | "always" | "never"]
                /* ,compiler: './node_modules/grunt-ts/customcompiler/tsc'  */ //will use the specified compiler.
            },
            // a particular target
            dev: {
                src: ['ts/**/*.ts'],
                //src : ['ts/**/*.ts', "!bower_components/**/*.ts" ,"!node_modules/**/*.ts"],          // The source typescript files, http://gruntjs.com/configuring-tasks#files
                //html: ['app/**/**.tpl.html'],  // The source html files, https://github.com/basarat/grunt-ts#html-2-typescript-support
                reference: 'ts/reference.ts', // If specified, generate this file that you can use for your reference management
                out: 'js/pelotas.js',             // If specified, generate an out.js file which is the merged js file
                watch: 'ts',                  // If specified, watches this directory for changes, and re-runs the current target
                // use to override the grunt-ts project options above for this target
                //options: {
                //    module: 'commonjs'
                //}
            },

            build: {
                src: ['ts/**/*.ts'],
                //src : ['ts/**/*.ts', "!bower_components/**/*.ts" ,"!node_modules/**/*.ts"],          // The source typescript files, http://gruntjs.com/configuring-tasks#files
                //html: ['app/**/**.tpl.html'],  // The source html files, https://github.com/basarat/grunt-ts#html-2-typescript-support
                reference: 'ts/reference.ts', // If specified, generate this file that you can use for your reference management
                out: 'js/pelotas.js',             // If specified, generate an out.js file which is the merged js file
                //watch: 'ts',                  // If specified, watches this directory for changes, and re-runs the current target
                // use to override the grunt-ts project options above for this target
                //options: {
                //    module: 'commonjs'
                //}
            }
        },

        uglify: {
            build: {
                files: {
                    'js/pelotas.min.js': [
                        'bower_components/jquery/dist/jquery.min.js',
                        'bower_components/gl-matrix/dist/gl-matrix-min.js',
                        'bower_components/socketio-client/socket.io.js',
                        'js/pelotas.js'
                    ],
                }
            }
        },

        compress: {
            build: {
                options: {
                    archive: function () {
                        return 'pelotas-artifact.zip'
                    },
                    pretty: true
                },
                files: [
                    {src: ['index.html', 'js/pelotas.min.js'], dest: '/'},
                ]
            }
        },


        // sshconfig: {
        //     kimsufi: {
        //         host: 'ns3000168.ip-5-196-67.eu',
        //         username: 'root',
        //         agent: process.env.SSH_AUTH_SOCK,
        //         agentForward: true,
        //         path: '/var/www/html',
        //     }
        // },
        // sftp: {
        //     deploy: {
        //         files: {
        //             "./tmp": "pelotas-artifact.zip"
        //         },
        //         options: {
        //             config: 'kimsufi',
        //             createDirectories: true,
        //             showProgress: true
        //         }
        //     }
        // },
        // sshexec: {
        //     clean_www_root: {
        //         command: ['rm -rf /var/www/html/*'], options: {
        //             config: 'kimsufi'
        //         }
        //     },
        //     process_artifact: {
        //         command: ['cd /var/www/html && unzip -o pelotas-artifact.zip && rm pelotas-artifact.zip && service nginx restart'], options: {
        //             config: 'kimsufi'
        //         }
        //     }
        // },

    });

    // Default task(s).
    grunt.registerTask('dev-http', ['http-server'])
    grunt.registerTask('default', ['ts:dev']);
    grunt.registerTask('build', ['ts:build', 'uglify:build', 'compress:build',
        /*'sshexec:clean_www_root', 'sftp:deploy', 'sshexec:process_artifact'*/]);

};
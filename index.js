'use strict'

'use strict'
/**
 * https://stackoverflow.com/questions/17575790/environment-detection-node-js-or-browser
 **/
var isNode=new Function("try {return this===global;}catch(e){return false;}");

var App = require('node-app');

if(isNode){
	App = require('node-app/load')(App);
}

var path = require('path'),
		fs = require('fs'),
		cradle = require('cradle-pouchdb-server'),
		//request = require('request'),
		pathToRegexp = require('path-to-regexp');
		//semver = require('semver');


////var Logger = require('node-express-logger'),
//var Authorization = require('node-express-authorization');
	////Authentication = require('node-express-authentication');

var debug = require('debug')('app-cradle-client');
var debug_events = require('debug')('app-cradle-client:Events');
var debug_internals = require('debug')('app-cradle-client:Internals');


var AppCradleClient = new Class({
  //Implements: [Options, Events],
  Extends: App,

  ON_CONNECT: 'onConnect',
  ON_CONNECT_ERROR: 'onConnectError',

  request: null,

  api: {},

  methods: [
		'create',
		'exists',
		'destroy',
		'get',
		'view',
		'save',
		'merge',
		'temporaryView',
		'remove',
		'update',
		'changes',
		//'feed' //https://www.npmjs.com/package/cradle#streaming
		/**
		 * @attachements
		 * https://www.npmjs.com/package/cradle#attachments
		 * */

		 /**
			* @server
			* https://www.npmjs.com/package/cradle#couchdb-server-level
			*
			* */
	 'info',
	 'config',
	 'uuids',
		 /**
			* @database
			* https://www.npmjs.com/package/cradle#database-level
			* */
		'compact',
		/**
		 * @cache
		 * https://www.npmjs.com/package/cradle#cache-api
		 * */
	],

  authorization:null,
  //authentication: null,
  _merged_apps: {},

  options: {

		host: '127.0.0.1',
		port: 5984,
		db: '',

		cradle: {
			cache: false,
			raw: false,
			forceSave: false,
		},


		logs: null,

		authentication: null,

		//authentication: {
			//username: 'user',
			//password: 'pass',
			//sendImmediately: true,
			//bearer: 'bearer,
			//basic: false
		//},

		authorization: null,


		/*routes: {

			get: [
				{
					path: '/:param',
					callbacks: ['check_authentication', 'get'],
					content_type: /text\/plain/,
				},
			],
			post: [
				{
				path: '',
				callbacks: ['', 'post']
				},
			],
			all: [
				{
				path: '',
				callbacks: ['', 'get']
				},
			]

		},*/

		api: {

			content_type: 'application/json',

			path: '',

			version: '0.0.0',

			versioned_path: false, //default false

			//accept_header: 'accept-version', //implement?

			/*routes: {
				get: [
					{
					path: '',
					callbacks: ['get_api'],
					content_type: 'application/x-www-form-urlencoded',
					//version: '1.0.1',
					},
					{
					path: ':service_action',
					callbacks: ['get_api'],
					version: '2.0.0',
					},
					{
					path: ':service_action',
					callbacks: ['get_api'],
					version: '1.0.1',
					},
				],
				post: [
					{
					path: '',
					callbacks: ['check_authentication', 'post'],
					},
				],
				all: [
					{
					path: '',
					callbacks: ['get'],
					version: '',
					},
				]

			},*/


			/*doc: {
				'/': {
					type: 'function',
					returns: 'array',
					description: 'Return an array of registered servers',
					example: '{"username":"lbueno","password":"40bd001563085fc35165329ea1ff5c5ecbdbbeef"} / curl -v -L -H "Accept: application/json" -H "Content-type: application/json" -X POST -d \' {"user":"something","password":"app123"}\'  http://localhost:8080/login'

				}
			},*/
		},
  },
  initialize: function(options){

		this.parent(options);//override default options

		/**
		 * cradle
		 *  - start
		 * **/
		//if(this.options.cradle){
		////console.log('---this.options.cradle----');
		////console.log(this.options.cradle);


			//if(typeof(this.options.cradle) == 'class'){
				//var tmp_class = this.options.cradle;
				//this.request = new tmp_class(this, {});
				//this.options.cradle = {};
			//}
			//else if(typeof(this.options.cradle) == 'function'){
				//this.request = this.options.cradle;
				//this.options.cradle = {};
			//}
			////else if(this.options.logs.instance){//winston
				////this.logger = this.options.logs;
				////this.options.logs = {};
			////}
			//else{
				//this.request = new(cradle.Connection)(this.options.host, this.options.port, this.options.cradle);
				////app.use(this.logger.access());
			//}

			////app.use(this.logger.access());

		//}

		//debug('initialize options %o', this.options);
		this.request = new(cradle.Connection)(this.options.host, this.options.port, this.options.cradle);

		/**
		 * cradle
		 *  - end
		 * **/



		//if(this.options.db);
			//this.request.database(this.options.db);

		if(this.logger)
			this.logger.extend_app(this);

		/**
		 * logger
		 *  - end
		 * **/

		/**
		 * authorization
		 * - start
		 * */
		 if(this.options.authorization && this.options.authorization.init !== false){
			 var authorization = null;

			 if(typeof(this.options.authorization) == 'class'){
				 authorization = new this.options.authorization({});
				 this.options.authorization = {};
			 }
			 else if(typeof(this.options.authorization) == 'function'){
				authorization = this.options.authorization;
				this.options.authorization = {};
			}
			else if(this.options.authorization.config){
				var rbac = this.options.authorization.config;

				if(typeof(this.options.authorization.config) == 'string'){
					//rbac = fs.readFileSync(path.join(__dirname, this.options.authorization.config ), 'ascii');
					rbac = fs.readFileSync(this.options.authorization.config , 'ascii');
					this.options.authorization.config = rbac;
				}

				/**
				 * @todo
				 * should do module injection, avoid "automatigically" importing and starting modules
				 * */
				authorization = new Authorization(this,
					JSON.decode(
						rbac
					)
				);
				/**
				 * *
				 * */
			}

			if(authorization){
				this.authorization = authorization;
				//app.use(this.authorization.session());
			}
		}
		/**
		 * authorization
		 * - end
		 * */

		//if(this.options.api && this.options.api.routes)
			//this.apply_routes(this.options.api.routes, true);

		this.apply_routes(this.options.routes, false);


  },
  apply_routes: function(routes, is_api){
		var uri = '';

		//if(this.options.authentication &&
			//this.options.authentication.basic &&
			//(this.options.authentication.user || this.options.authentication.username) &&
			//(this.options.authentication.pass || this.options.authentication.password))
		//{
			//var user = this.options.authentication.user || this.options.authentication.username;
			//var passwd = this.options.authentication.pass || this.options.authentication.password;
			//uri = this.options.scheme+'://'+user+':'+passwd+'@'+this.options.url+':'+this.options.port;
		//}
		//else{
			//uri = this.options.scheme+'://'+this.options.url+':'+this.options.port;
		//}


		var instance = this;
		//var conn = this.request;

		//var api = this.options.api;

		//if(is_api){
			////path = ((typeof(api.path) !== "undefined") ? this.options.path+api.path : this.options.path).replace('//', '/');
			//instance = this.api;
		//}
		//else{
			////path = (typeof(this.options.path) !== "undefined") ? this.options.path : '';
			//instance = this;
		//}

		Array.each(this.methods, function(verb){

			//console.log('---VERB---');
			//console.log(verb);
			/**
			 * @callback_alt if typeof function, gets executed instead of the method asigned to the matched route (is an alternative callback, instead of the default usage)
			 * */
			instance[verb] = function(verb, original_func, options, callback_alt){
				//debug_internals('instance[verb] %o', arguments);

				//console.log('---gets called??---')
				//console.log(arguments);

				//var request;//the request object to return

				var path = '';
				//if(is_api){
					//path = ((typeof(api.path) !== "undefined") ? this.options.path+api.path : this.options.path).replace('//', '/');
				//}
				//else{
					path = (typeof(this.options.path) !== "undefined") ? this.options.path : '';
				//}


				options = options || {};

				debug_internals('instance[verb] routes %o', routes);

				//if(options.auth === false || options.auth === null){
					//delete options.auth;
				//}
				//else if(!options.auth &&
					//this.options.authentication &&
					//(this.options.authentication.user || this.options.authentication.username) &&
					//(this.options.authentication.pass || this.options.authentication.password))
				//{
					//options.auth = this.options.authentication;
				//}

				//var content_type = '';
				//var version = '';

				//if(is_api){
					//content_type = (typeof(api.content_type) !== "undefined") ? api.content_type : '';
					//version = (typeof(api.version) !== "undefined") ? api.version : '';
				//}
				//else{
					//content_type = (typeof(this.options.content_type) !== "undefined") ? this.options.content_type : '';
				//}

				//var gzip = this.options.gzip || false;

				//console.log('---ROUTES---');
				//console.log(routes);

				debug_internals('routes %o', routes);
				debug_internals('verb %s', verb);
				debug_internals('routes[verb] %o', routes[verb]);

				if(routes[verb]){
					var uri_matched = false;

					Array.each(routes[verb], function(route){
						debug_internals('instance[verb] route.path %s', route.path);

						//console.log('---ROUTE PATH---');
						////console.log(route.path);

						//content_type = (typeof(route.content_type) !== "undefined") ? route.content_type : content_type;
						//gzip = route.gzip || false;

						route.path = route.path || '';
						options.uri = options.uri || '';

						var keys = []
						var re = pathToRegexp(route.path, keys);

						//console.log('route path: '+route.path);
						//console.log(re.exec(options.uri));
						//console.log('options.uri: '+options.uri);
						//console.log(path);
						//console.log(keys);
						//console.log('--------');



						if(options.uri != null && re.test(options.uri) == true){
							uri_matched = true;

							var callbacks = [];

							/**
							 * if no callbacks defined for a route, you should use callback_alt param
							 * */
							if(route.callbacks && route.callbacks.length > 0){
								route.callbacks.each(function(fn){
									////console.log('route function: ' + fn);

									//if the callback function, has the same name as the verb, we had it already copied as "original_func"
									if(fn == verb){
										callbacks.push({ func: original_func.bind(this), name: fn });
									}
									else{
										callbacks.push({ func: this[fn].bind(this), name: fn });
									}

								}.bind(this));
							}

							//if(is_api){
								////var versioned_path = '';
								//if(api.versioned_path === true && version != ''){
									//path = path + '/v'+semver.major(version);
									////path += (typeof(route.path) !== "undefined") ? '/' + route.path : '';
								//}
								//else{
									////path += (typeof(route.path) !== "undefined") ? '/' + route.path : '';
								//}
							//}

							////if(!is_api){
								//path += '/'+options.uri;
							////}

							//path = path.replace('//', '/');

							//if(path == '/')
								//path = '';



							//////console.log(path+options.uri);
							//////console.log('PATH');
							//////console.log(options.uri);
							//////console.log(options.uri);

							var merged = {};
							//Object.merge(
								//merged,
								//options,
								//{ headers: this.options.headers },
								//{
									//baseUrl: uri,
									////uri: path+options.uri,
									//uri: path,
									//gzip: gzip,
									//headers: {
										//'Content-Type': content_type
									//},
									//jar: this.options.jar
								//}
							//);

							//console.log('---MERGED----');
							//console.log(merged);
							//////console.log(process.env.PROFILING_ENV);
							//////console.log(this.logger);

							//console.log('---VERB----')
							////console.log(this.options.db);
							//console.log(verb);


							let response = function(err, resp, body){
								////console.log('---req_func.cache.has(options.doc)---')
								////console.log(resp._id);
								////console.log(this.request.database('dashboard').cache.has(resp._id));

								//console.log('--response callback---');
								//console.log(arguments);
								if(resp){
									let cast_resp = null;
									if(resp[0]){
										cast_resp = [];

										//console.log(typeof(cast_resp));

										Array.each(resp, function(value, index){
											cast_resp.push(value);
										})

										resp = cast_resp;

										//console.log(resp);
										//console.log(Array.isArray(cast_resp));
										//throw new Error('Array');
									}
									else{
										cast_resp = {};
										Object.each(resp, function(value, key){
											cast_resp[key] = value;
										})

										resp = cast_resp;

										//console.log(resp);
										//throw new Error('Object');
									}
								}


								if(err){
									//this.fireEvent(this.ON_CONNECT_ERROR, {options: merged, uri: options.uri, route: route.path, error: err });
									this.fireEvent(this.ON_CONNECT_ERROR, {uri: options.uri, route: route.path, error: err });
								}
								else{
									//this.fireEvent(this.ON_CONNECT, {options: merged, uri: options.uri, route: route.path, response: resp, body: body });
									//this.fireEvent(this.ON_CONNECT, {uri: options.uri, route: route.path, response: resp });
									this.fireEvent(this.ON_CONNECT, {uri: options.uri, route: route.path, response: resp, options: options });
								}


								if(typeof(callback_alt) == 'function' || callback_alt instanceof Function){
									var profile = 'ID['+this.options.id+']:METHOD['+verb+']:PATH['+merged.uri+']:CALLBACK[*callback_alt*]';

									if(process.env.PROFILING_ENV && this.logger) this.profile(profile);

									//callback_alt(err, resp, body, {options: merged, uri: options.uri, route: route.path });
									callback_alt(err, resp, {uri: options.uri, route: route.path, options: options });

									if(process.env.PROFILING_ENV && this.logger) this.profile(profile);
								}
								else{
									Array.each(callbacks, function(fn){
										var callback = fn.func;
										var name = fn.name;

										var profile = 'ID['+this.options.id+']:METHOD['+verb+']:PATH['+merged.uri+']:CALLBACK['+name+']';

										if(process.env.PROFILING_ENV && this.logger) this.profile(profile);

										//callback(err, resp, body, {options: merged, uri: options.uri, route: route.path });
										callback(err, resp, {uri: options.uri, route: route.path, options: options });

										if(process.env.PROFILING_ENV && this.logger) this.profile(profile);

									}.bind(this))
								}


							}.bind(this);

							var args = [];

							if(options.id)
								args.push(options.id);

							if(options.rev)
								args.push(options.rev);

							if(options.data)
								args.push(options.data);


							var req_func = null;
							var db = keys[0];
							var cache = keys[1];
							var cache_result;

							if(db){
								var name = re.exec(options.uri)[1];
								req_func = this.request['database'](name);
								//console.log('---DB----');
								//console.log(name);
								////console.log(req_func['info'](response));
							}
							else{
								////console.log(this.request);
								req_func = this.request;

							}

							if(cache){
								//console.log('---CACHE----');
								//console.log(options);
								//console.log(args);
								//req_func.get(options.doc, function(err, resp){

									////console.log('--cache result---',cache_result);

								//});
								cache_result = req_func.cache[verb](args);

								//console.log('---CACHE RESULT----');
								//console.log(cache_result);

								if(cache_result || cache.optional == false)
									response(null, cache_result);
							}

							if(!cache || (!cache_result && cache.optional)){

								args.push(response);

								if(args.length == 0)
									args = null;

								if(args.length == 1)
									args = args[0];

								req_func[verb].attempt(args, req_func);



							}

						}

					}.bind(this));

					if(!uri_matched){
						debug_internals('No routes matched for URI: %s', uri+path+options.uri);
						throw new Error('No routes matched for URI: '+uri+path+options.uri);
					}
				}
				else{
					debug_internals('No routes defined for method:  %s', verb.toUpperCase());
					throw new Error('No routes defined for method: '+verb.toUpperCase());

				}

				////console.log('returning...', request);

				//return request;

			}.bind(this, verb, this[verb]);//copy the original function if there are func like this.get, this.post, etc

		}.bind(this));

	},
	use: function(mount, app){
		//console.log('---AppCradleClient----');
		//console.log(instanceOf(app, AppCradleClient));
		debug('use instanceOf(app, AppCradleClient) %o', instanceOf(app, AppCradleClient));

		if(instanceOf(app, AppCradleClient))
			this.parent(mount, app);


	}
	


});

module.exports = AppCradleClient;

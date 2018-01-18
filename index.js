'use strict'

var App = require('node-app'),
		path = require('path'),
		fs = require('fs'),
		cradle = require('cradle-pouchdb-server'),
		//request = require('request'),
		pathToRegexp = require('path-to-regexp');
		//semver = require('semver');
		

//var Logger = require('node-express-logger'),
var Authorization = require('node-express-authorization');
	//Authentication = require('node-express-authentication');



module.exports = new Class({
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
			cache: true,
			raw: false,
			forceSave: true,
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
		
		this.request = new(cradle.Connection)(this.options.host, this.options.port, this.options.cradle);
		
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
				
				authorization = new Authorization(this, 
					JSON.decode(
						rbac
					)
				);
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
		
		if(this.options.api && this.options.api.routes)
			this.apply_routes(this.options.api.routes, true);
		
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
			
			console.log('---VERB---');
			console.log(verb);
			/**
			 * @callback_alt if typeof function, gets executed instead of the method asigned to the matched route (is an alternative callback, instead of the default usage)
			 * */
			instance[verb] = function(verb, original_func, options, callback_alt){
				console.log('---gets called??---')
				console.log(arguments);
				
				var request;//the request object to return
				
				var path = '';
				//if(is_api){
					//path = ((typeof(api.path) !== "undefined") ? this.options.path+api.path : this.options.path).replace('//', '/');
				//}
				//else{
					path = (typeof(this.options.path) !== "undefined") ? this.options.path : '';
				//}
				
				
				options = options || {};
				
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
				
				console.log('---ROUTES---');
				console.log(routes);
				
				if(routes[verb]){
					var uri_matched = false;
					
					Array.each(routes[verb], function(route){
						console.log('---ROUTE PATH---');
						//console.log(route.path);
						
						//content_type = (typeof(route.content_type) !== "undefined") ? route.content_type : content_type;
						//gzip = route.gzip || false;
						
						route.path = route.path || '';
						options.uri = options.uri || '';
						
						var keys = []
						var re = pathToRegexp(route.path, keys);
						
						console.log('route path: '+route.path);
						console.log(re.exec(options.uri));
						console.log('options.uri: '+options.uri);
						console.log(path);
						console.log(keys);
						console.log('--------');
							
						if(options.uri != null && re.test(options.uri) == true){
							uri_matched = true;
							
							var callbacks = [];
							
							/**
							 * if no callbacks defined for a route, you should use callback_alt param
							 * */
							if(route.callbacks && route.callbacks.length > 0){
								route.callbacks.each(function(fn){
									//console.log('route function: ' + fn);
									
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
							
							
								
							////console.log(path+options.uri);
							////console.log('PATH');
							////console.log(options.uri);
							////console.log(options.uri);
							
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
							
							console.log('---MERGED----');
							console.log(merged);
							////console.log(process.env.PROFILING_ENV);
							////console.log(this.logger);
							
							console.log('---VERB----')
							//console.log(this.options.db);
							console.log(verb);
							
							var req_func = null;
							var db = keys[0];
							var cache = keys[1];
							
							if(db){
								var name = re.exec(options.uri)[1];
								req_func = this.request['database'](name);
								
							}
							else{
								req_func = this.request;
							}
							//console.log(req_func);
							//request = this.request.database(this.options.db)[verb](
							
							var response = function(err, resp, body){
								console.log('--response callback---');
								console.log(arguments);
								
								if(err){
									//this.fireEvent(this.ON_CONNECT_ERROR, {options: merged, uri: options.uri, route: route.path, error: err });
									this.fireEvent(this.ON_CONNECT_ERROR, {error: err });
								}
								else{
									//this.fireEvent(this.ON_CONNECT, {options: merged, uri: options.uri, route: route.path, response: resp, body: body });
									this.fireEvent(this.ON_CONNECT, {response: resp });
								}

								
								if(typeof(callback_alt) == 'function' || callback_alt instanceof Function){
									var profile = 'ID['+this.options.id+']:METHOD['+verb+']:PATH['+merged.uri+']:CALLBACK[*callback_alt*]';
									
									if(process.env.PROFILING_ENV && this.logger) this.profile(profile);
									
									callback_alt(err, resp, body, {options: merged, uri: options.uri, route: route.path });
									
									if(process.env.PROFILING_ENV && this.logger) this.profile(profile);
								}
								else{
									Array.each(callbacks, function(fn){
										var callback = fn.func;
										var name = fn.name;
										
										var profile = 'ID['+this.options.id+']:METHOD['+verb+']:PATH['+merged.uri+']:CALLBACK['+name+']';
										
										if(process.env.PROFILING_ENV && this.logger) this.profile(profile);
										
										callback(err, resp, body, {options: merged, uri: options.uri, route: route.path });
										
										if(process.env.PROFILING_ENV && this.logger) this.profile(profile);
										
									}.bind(this))
								}
								
									
							}.bind(this);
							
							var cache_result;
							
							if(cache){
								console.log('---CACHE----');
								console.log(cache);
								//req_func.get(options.id, function(err, resp){
									
									//console.log('--cache result---',result);
								
								//});
								cache_result = req_func.cache[verb](options.doc);
								if(cache_result || cache.optional == false)
									response(null, cache_result);
							}
							
							if(!cache || (!cache_result && cache.optional)){
								console.log('---NO CACHE----');
								
								if(options.doc){
									//request = req_func[verb].pass([options.doc, response], this);
									request = req_func[verb](
										options.doc,
										response
									);
								}
								else{
									//request = req_func[verb].pass(response, this);
									request = req_func[verb](
										response
									);
								}
									
								//request = req_func[verb](
									////options.id,
									//response
								//);
								//request.attempt();
								
							}
							
						}
						
					}.bind(this));
					
					if(!uri_matched)
						throw new Error('No routes matched for URI: '+uri+path+options.uri);
				}
				else{
					//console.log(routes);
					throw new Error('No routes defined for method: '+verb.toUpperCase());
					
				}
				
				//return request;
				
			}.bind(this, verb, this[verb]);//copy the original function if there are func like this.get, this.post, etc
			
		}.bind(this));
		
	},
	load: function(wrk_dir, options){
		options = options || {};
		
		var get_options = function(options){
			options.scheme = options.scheme || this.options.scheme;
			options.url = options.url || this.options.url;
			options.port = options.port || this.options.port;
			options.authentication = options.authentication || this.options.authentication;
			options.jar = options.jar || this.options.jar;
			options.gzip = options.gzip || this.options.gzip;
			
			/**
			 * subapps will re-use main app logger
			 * */
			
			if(this.logger)	
				options.logs = this.logger;
			
			return options;
		
		}.bind(this);
		
		this.parent(wrk_dir, get_options(options));
		
		
	},
  
	
});



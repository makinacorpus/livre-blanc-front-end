(function(self){"use strict";if(self.fetch){return}var support={searchParams:"URLSearchParams"in self,iterable:"Symbol"in self&&"iterator"in Symbol,blob:"FileReader"in self&&"Blob"in self&&function(){try{new Blob;return true}catch(e){return false}}(),formData:"FormData"in self,arrayBuffer:"ArrayBuffer"in self};function normalizeName(name){if(typeof name!=="string"){name=String(name)}if(/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)){throw new TypeError("Invalid character in header field name")}return name.toLowerCase()}function normalizeValue(value){if(typeof value!=="string"){value=String(value)}return value}function iteratorFor(items){var iterator={next:function(){var value=items.shift();return{done:value===undefined,value:value}}};if(support.iterable){iterator[Symbol.iterator]=function(){return iterator}}return iterator}function Headers(headers){this.map={};if(headers instanceof Headers){headers.forEach(function(value,name){this.append(name,value)},this)}else if(headers){Object.getOwnPropertyNames(headers).forEach(function(name){this.append(name,headers[name])},this)}}Headers.prototype.append=function(name,value){name=normalizeName(name);value=normalizeValue(value);var list=this.map[name];if(!list){list=[];this.map[name]=list}list.push(value)};Headers.prototype["delete"]=function(name){delete this.map[normalizeName(name)]};Headers.prototype.get=function(name){var values=this.map[normalizeName(name)];return values?values[0]:null};Headers.prototype.getAll=function(name){return this.map[normalizeName(name)]||[]};Headers.prototype.has=function(name){return this.map.hasOwnProperty(normalizeName(name))};Headers.prototype.set=function(name,value){this.map[normalizeName(name)]=[normalizeValue(value)]};Headers.prototype.forEach=function(callback,thisArg){Object.getOwnPropertyNames(this.map).forEach(function(name){this.map[name].forEach(function(value){callback.call(thisArg,value,name,this)},this)},this)};Headers.prototype.keys=function(){var items=[];this.forEach(function(value,name){items.push(name)});return iteratorFor(items)};Headers.prototype.values=function(){var items=[];this.forEach(function(value){items.push(value)});return iteratorFor(items)};Headers.prototype.entries=function(){var items=[];this.forEach(function(value,name){items.push([name,value])});return iteratorFor(items)};if(support.iterable){Headers.prototype[Symbol.iterator]=Headers.prototype.entries}function consumed(body){if(body.bodyUsed){return Promise.reject(new TypeError("Already read"))}body.bodyUsed=true}function fileReaderReady(reader){return new Promise(function(resolve,reject){reader.onload=function(){resolve(reader.result)};reader.onerror=function(){reject(reader.error)}})}function readBlobAsArrayBuffer(blob){var reader=new FileReader;reader.readAsArrayBuffer(blob);return fileReaderReady(reader)}function readBlobAsText(blob){var reader=new FileReader;reader.readAsText(blob);return fileReaderReady(reader)}function Body(){this.bodyUsed=false;this._initBody=function(body){this._bodyInit=body;if(typeof body==="string"){this._bodyText=body}else if(support.blob&&Blob.prototype.isPrototypeOf(body)){this._bodyBlob=body}else if(support.formData&&FormData.prototype.isPrototypeOf(body)){this._bodyFormData=body}else if(support.searchParams&&URLSearchParams.prototype.isPrototypeOf(body)){this._bodyText=body.toString()}else if(!body){this._bodyText=""}else if(support.arrayBuffer&&ArrayBuffer.prototype.isPrototypeOf(body)){}else{throw new Error("unsupported BodyInit type")}if(!this.headers.get("content-type")){if(typeof body==="string"){this.headers.set("content-type","text/plain;charset=UTF-8")}else if(this._bodyBlob&&this._bodyBlob.type){this.headers.set("content-type",this._bodyBlob.type)}else if(support.searchParams&&URLSearchParams.prototype.isPrototypeOf(body)){this.headers.set("content-type","application/x-www-form-urlencoded;charset=UTF-8")}}};if(support.blob){this.blob=function(){var rejected=consumed(this);if(rejected){return rejected}if(this._bodyBlob){return Promise.resolve(this._bodyBlob)}else if(this._bodyFormData){throw new Error("could not read FormData body as blob")}else{return Promise.resolve(new Blob([this._bodyText]))}};this.arrayBuffer=function(){return this.blob().then(readBlobAsArrayBuffer)};this.text=function(){var rejected=consumed(this);if(rejected){return rejected}if(this._bodyBlob){return readBlobAsText(this._bodyBlob)}else if(this._bodyFormData){throw new Error("could not read FormData body as text")}else{return Promise.resolve(this._bodyText)}}}else{this.text=function(){var rejected=consumed(this);return rejected?rejected:Promise.resolve(this._bodyText)}}if(support.formData){this.formData=function(){return this.text().then(decode)}}this.json=function(){return this.text().then(JSON.parse)};return this}var methods=["DELETE","GET","HEAD","OPTIONS","POST","PUT"];function normalizeMethod(method){var upcased=method.toUpperCase();return methods.indexOf(upcased)>-1?upcased:method}function Request(input,options){options=options||{};var body=options.body;if(Request.prototype.isPrototypeOf(input)){if(input.bodyUsed){throw new TypeError("Already read")}this.url=input.url;this.credentials=input.credentials;if(!options.headers){this.headers=new Headers(input.headers)}this.method=input.method;this.mode=input.mode;if(!body){body=input._bodyInit;input.bodyUsed=true}}else{this.url=input}this.credentials=options.credentials||this.credentials||"omit";if(options.headers||!this.headers){this.headers=new Headers(options.headers)}this.method=normalizeMethod(options.method||this.method||"GET");this.mode=options.mode||this.mode||null;this.referrer=null;if((this.method==="GET"||this.method==="HEAD")&&body){throw new TypeError("Body not allowed for GET or HEAD requests")}this._initBody(body)}Request.prototype.clone=function(){return new Request(this)};function decode(body){var form=new FormData;body.trim().split("&").forEach(function(bytes){if(bytes){var split=bytes.split("=");var name=split.shift().replace(/\+/g," ");var value=split.join("=").replace(/\+/g," ");form.append(decodeURIComponent(name),decodeURIComponent(value))}});return form}function headers(xhr){var head=new Headers;var pairs=(xhr.getAllResponseHeaders()||"").trim().split("\n");pairs.forEach(function(header){var split=header.trim().split(":");var key=split.shift().trim();var value=split.join(":").trim();head.append(key,value)});return head}Body.call(Request.prototype);function Response(bodyInit,options){if(!options){options={}}this.type="default";this.status=options.status;this.ok=this.status>=200&&this.status<300;this.statusText=options.statusText;this.headers=options.headers instanceof Headers?options.headers:new Headers(options.headers);this.url=options.url||"";this._initBody(bodyInit)}Body.call(Response.prototype);Response.prototype.clone=function(){return new Response(this._bodyInit,{status:this.status,statusText:this.statusText,headers:new Headers(this.headers),url:this.url})};Response.error=function(){var response=new Response(null,{status:0,statusText:""});response.type="error";return response};var redirectStatuses=[301,302,303,307,308];Response.redirect=function(url,status){if(redirectStatuses.indexOf(status)===-1){throw new RangeError("Invalid status code")}return new Response(null,{status:status,headers:{location:url}})};self.Headers=Headers;self.Request=Request;self.Response=Response;self.fetch=function(input,init){return new Promise(function(resolve,reject){var request;if(Request.prototype.isPrototypeOf(input)&&!init){request=input}else{request=new Request(input,init)}var xhr=new XMLHttpRequest;function responseURL(){if("responseURL"in xhr){return xhr.responseURL}if(/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())){return xhr.getResponseHeader("X-Request-URL")}return}xhr.onload=function(){var options={status:xhr.status,statusText:xhr.statusText,headers:headers(xhr),url:responseURL()};var body="response"in xhr?xhr.response:xhr.responseText;resolve(new Response(body,options))};xhr.onerror=function(){reject(new TypeError("Network request failed"))};xhr.ontimeout=function(){reject(new TypeError("Network request failed"))};xhr.open(request.method,request.url,true);if(request.credentials==="include"){xhr.withCredentials=true}if("responseType"in xhr&&support.blob){xhr.responseType="blob"}request.headers.forEach(function(value,name){xhr.setRequestHeader(name,value)});xhr.send(typeof request._bodyInit==="undefined"?null:request._bodyInit)})};self.fetch.polyfill=true})(typeof self!=="undefined"?self:this);(function(root,factory){if(typeof exports=="object"){module.exports=factory()}else if(typeof define=="function"&&define.amd){define(factory)}else{root.Spinner=factory()}})(this,function(){"use strict";var prefixes=["webkit","Moz","ms","O"],animations={},useCssAnimations;function createEl(tag,prop){var el=document.createElement(tag||"div"),n;for(n in prop)el[n]=prop[n];return el}function ins(parent){for(var i=1,n=arguments.length;i<n;i++)parent.appendChild(arguments[i]);return parent}var sheet=function(){var el=createEl("style",{type:"text/css"});ins(document.getElementsByTagName("head")[0],el);return el.sheet||el.styleSheet}();function addAnimation(alpha,trail,i,lines){var name=["opacity",trail,~~(alpha*100),i,lines].join("-"),start=.01+i/lines*100,z=Math.max(1-(1-alpha)/trail*(100-start),alpha),prefix=useCssAnimations.substring(0,useCssAnimations.indexOf("Animation")).toLowerCase(),pre=prefix&&"-"+prefix+"-"||"";if(!animations[name]){sheet.insertRule("@"+pre+"keyframes "+name+"{"+"0%{opacity:"+z+"}"+start+"%{opacity:"+alpha+"}"+(start+.01)+"%{opacity:1}"+(start+trail)%100+"%{opacity:"+alpha+"}"+"100%{opacity:"+z+"}"+"}",sheet.cssRules.length);animations[name]=1}return name}function vendor(el,prop){var s=el.style,pp,i;prop=prop.charAt(0).toUpperCase()+prop.slice(1);for(i=0;i<prefixes.length;i++){pp=prefixes[i]+prop;if(s[pp]!==undefined)return pp}if(s[prop]!==undefined)return prop}function css(el,prop){for(var n in prop)el.style[vendor(el,n)||n]=prop[n];return el}function merge(obj){for(var i=1;i<arguments.length;i++){var def=arguments[i];for(var n in def)if(obj[n]===undefined)obj[n]=def[n]}return obj}function pos(el){var o={x:el.offsetLeft,y:el.offsetTop};while(el=el.offsetParent)o.x+=el.offsetLeft,o.y+=el.offsetTop;return o}function getColor(color,idx){return typeof color=="string"?color:color[idx%color.length]}var defaults={lines:12,length:7,width:5,radius:10,rotate:0,corners:1,color:"#000",direction:1,speed:1,trail:100,opacity:1/4,fps:20,zIndex:2e9,className:"spinner",top:"50%",left:"50%",position:"absolute"};function Spinner(o){this.opts=merge(o||{},Spinner.defaults,defaults)}Spinner.defaults={};merge(Spinner.prototype,{spin:function(target){this.stop();var self=this,o=self.opts,el=self.el=css(createEl(0,{className:o.className}),{position:o.position,width:0,zIndex:o.zIndex}),mid=o.radius+o.length+o.width;css(el,{left:o.left,top:o.top});if(target){target.insertBefore(el,target.firstChild||null)}el.setAttribute("role","progressbar");self.lines(el,self.opts);if(!useCssAnimations){var i=0,start=(o.lines-1)*(1-o.direction)/2,alpha,fps=o.fps,f=fps/o.speed,ostep=(1-o.opacity)/(f*o.trail/100),astep=f/o.lines;(function anim(){i++;for(var j=0;j<o.lines;j++){alpha=Math.max(1-(i+(o.lines-j)*astep)%f*ostep,o.opacity);self.opacity(el,j*o.direction+start,alpha,o)}self.timeout=self.el&&setTimeout(anim,~~(1e3/fps))})()}return self},stop:function(){var el=this.el;if(el){clearTimeout(this.timeout);if(el.parentNode)el.parentNode.removeChild(el);this.el=undefined}return this},lines:function(el,o){var i=0,start=(o.lines-1)*(1-o.direction)/2,seg;function fill(color,shadow){return css(createEl(),{position:"absolute",width:o.length+o.width+"px",height:o.width+"px",background:color,boxShadow:shadow,transformOrigin:"left",transform:"rotate("+~~(360/o.lines*i+o.rotate)+"deg) translate("+o.radius+"px"+",0)",borderRadius:(o.corners*o.width>>1)+"px"})}for(;i<o.lines;i++){seg=css(createEl(),{position:"absolute",top:1+~(o.width/2)+"px",transform:o.hwaccel?"translate3d(0,0,0)":"",opacity:o.opacity,animation:useCssAnimations&&addAnimation(o.opacity,o.trail,start+i*o.direction,o.lines)+" "+1/o.speed+"s linear infinite"});if(o.shadow)ins(seg,css(fill("#000","0 0 4px "+"#000"),{top:2+"px"}));ins(el,ins(seg,fill(getColor(o.color,i),"0 0 1px rgba(0,0,0,.1)")))}return el},opacity:function(el,i,val){if(i<el.childNodes.length)el.childNodes[i].style.opacity=val}});function initVML(){function vml(tag,attr){return createEl("<"+tag+' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">',attr)}sheet.addRule(".spin-vml","behavior:url(#default#VML)");Spinner.prototype.lines=function(el,o){var r=o.length+o.width,s=2*r;function grp(){return css(vml("group",{coordsize:s+" "+s,coordorigin:-r+" "+-r}),{width:s,height:s})}var margin=-(o.width+o.length)*2+"px",g=css(grp(),{position:"absolute",top:margin,left:margin}),i;function seg(i,dx,filter){ins(g,ins(css(grp(),{rotation:360/o.lines*i+"deg",left:~~dx}),ins(css(vml("roundrect",{arcsize:o.corners}),{width:r,height:o.width,left:o.radius,top:-o.width>>1,filter:filter}),vml("fill",{color:getColor(o.color,i),opacity:o.opacity}),vml("stroke",{opacity:0}))))}if(o.shadow)for(i=1;i<=o.lines;i++)seg(i,-2,"progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");for(i=1;i<=o.lines;i++)seg(i);return ins(el,g)};Spinner.prototype.opacity=function(el,i,val,o){var c=el.firstChild;o=o.shadow&&o.lines||0;if(c&&i+o<c.childNodes.length){c=c.childNodes[i+o];c=c&&c.firstChild;c=c&&c.firstChild;if(c)c.opacity=val}}}var probe=css(createEl("group"),{behavior:"url(#default#VML)"});if(!vendor(probe,"transform")&&probe.adj)initVML();else useCssAnimations=vendor(probe,"animation");return Spinner});(function(root,factory){if(typeof exports==="object"){module.exports=factory(require("spin.js"))}else if(typeof define==="function"&&define.amd){define(["spin"],factory)}else{root.Ladda=factory(root.Spinner)}})(this,function(Spinner){"use strict";var ALL_INSTANCES=[];function create(button){if(typeof button==="undefined"){console.warn("Ladda button target must be defined.");return}if(!/ladda-button/i.test(button.className)){button.className+=" ladda-button"}if(!button.hasAttribute("data-style")){button.setAttribute("data-style","expand-right")}if(!button.querySelector(".ladda-label")){var laddaLabel=document.createElement("span");laddaLabel.className="ladda-label";wrapContent(button,laddaLabel)}var spinner,spinnerWrapper=button.querySelector(".ladda-spinner");if(!spinnerWrapper){spinnerWrapper=document.createElement("span");spinnerWrapper.className="ladda-spinner"}button.appendChild(spinnerWrapper);var timer;var instance={start:function(){if(!spinner)spinner=createSpinner(button);button.setAttribute("disabled","");button.setAttribute("data-loading","");clearTimeout(timer);spinner.spin(spinnerWrapper);this.setProgress(0);return this},startAfter:function(delay){clearTimeout(timer);timer=setTimeout(function(){instance.start()},delay);return this},stop:function(){button.removeAttribute("disabled");button.removeAttribute("data-loading");clearTimeout(timer);if(spinner){timer=setTimeout(function(){spinner.stop()},1e3)}return this},toggle:function(){if(this.isLoading()){this.stop()}else{this.start()}return this},setProgress:function(progress){progress=Math.max(Math.min(progress,1),0);var progressElement=button.querySelector(".ladda-progress");if(progress===0&&progressElement&&progressElement.parentNode){progressElement.parentNode.removeChild(progressElement)}else{if(!progressElement){progressElement=document.createElement("div");progressElement.className="ladda-progress";button.appendChild(progressElement)}progressElement.style.width=(progress||0)*button.offsetWidth+"px"}},enable:function(){this.stop();return this},disable:function(){this.stop();button.setAttribute("disabled","");return this},isLoading:function(){return button.hasAttribute("data-loading")},remove:function(){clearTimeout(timer);button.removeAttribute("disabled","");button.removeAttribute("data-loading","");if(spinner){spinner.stop();spinner=null}for(var i=0,len=ALL_INSTANCES.length;i<len;i++){if(instance===ALL_INSTANCES[i]){ALL_INSTANCES.splice(i,1);break}}}};ALL_INSTANCES.push(instance);return instance}function getAncestorOfTagType(elem,type){while(elem.parentNode&&elem.tagName!==type){elem=elem.parentNode}return type===elem.tagName?elem:undefined}function getRequiredFields(form){var requirables=["input","textarea","select"];var inputs=[];for(var i=0;i<requirables.length;i++){var candidates=form.getElementsByTagName(requirables[i]);for(var j=0;j<candidates.length;j++){if(candidates[j].hasAttribute("required")){inputs.push(candidates[j])}}}return inputs}function bind(target,options){options=options||{};var targets=[];if(typeof target==="string"){targets=toArray(document.querySelectorAll(target))}else if(typeof target==="object"&&typeof target.nodeName==="string"){targets=[target]}for(var i=0,len=targets.length;i<len;i++){(function(){var element=targets[i];if(typeof element.addEventListener==="function"){var instance=create(element);var timeout=-1;element.addEventListener("click",function(event){var valid=true;var form=getAncestorOfTagType(element,"FORM");if(typeof form!=="undefined"){if(typeof form.checkValidity==="function"){valid=form.checkValidity()}else{var requireds=getRequiredFields(form);for(var i=0;i<requireds.length;i++){if(requireds[i].value.replace(/^\s+|\s+$/g,"")===""){valid=false}if((requireds[i].type==="checkbox"||requireds[i].type==="radio")&&!requireds[i].checked){valid=false}if(requireds[i].type==="email"){valid=/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(requireds[i].value)}}}}if(valid){instance.startAfter(1);if(typeof options.timeout==="number"){clearTimeout(timeout);timeout=setTimeout(instance.stop,options.timeout)}if(typeof options.callback==="function"){options.callback.apply(null,[instance])}}},false)}})()}}function stopAll(){for(var i=0,len=ALL_INSTANCES.length;i<len;i++){ALL_INSTANCES[i].stop()}}function createSpinner(button){var height=button.offsetHeight,spinnerColor,spinnerLines;if(height===0){height=parseFloat(window.getComputedStyle(button).height)}if(height>32){height*=.8}if(button.hasAttribute("data-spinner-size")){height=parseInt(button.getAttribute("data-spinner-size"),10)}if(button.hasAttribute("data-spinner-color")){spinnerColor=button.getAttribute("data-spinner-color")}if(button.hasAttribute("data-spinner-lines")){spinnerLines=parseInt(button.getAttribute("data-spinner-lines"),10)}var radius=height*.2,length=radius*.6,width=radius<7?2:3;return new Spinner({color:spinnerColor||"#fff",lines:spinnerLines||12,radius:radius,length:length,width:width,zIndex:"auto",top:"auto",left:"auto",className:""})}function toArray(nodes){var a=[];for(var i=0;i<nodes.length;i++){a.push(nodes[i])}return a}function wrapContent(node,wrapper){var r=document.createRange();r.selectNodeContents(node);r.surroundContents(wrapper);node.appendChild(wrapper)}return{bind:bind,create:create,stopAll:stopAll}});
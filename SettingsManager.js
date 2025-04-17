mw.loader.impl(function(){return["ext.gadget.SettingsManager@o3evm",function($,jQuery,require,module){(function($,mw){"use strict";var refreshToken=function(cb){var mwa=new mw.Api(),apiDef=mwa.get({action:'query',meta:'tokens',type:'csrf'});apiDef.done(function(result){if(!result.query||!result.query.tokens)return cb(false,'wrong-response');mw.user.tokens.set('csrfToken',result.query.tokens.csrftoken);cb(true);});apiDef.fail(function(code,result){if(!result.query||!result.query.tokens)return cb(false,code);});return apiDef;};var firstItem=function(o){for(var i in o){if(o.hasOwnProperty(i)){return o[i];}}};var valByString=function(identifier){var arr=identifier.split('.'),lenArr=arr.length,i,elemArr,objCurrent=window;for(i=0;i<lenArr;i++){elemArr=arr[i];objCurrent=objCurrent[elemArr];}return objCurrent;};var mwPrefPrefix='userjs-sm-';var sm={version:'0.1.0.1',errorPrefix:"SettingsWizard encountered a problem. We regret the inconvenience. ",option:function(specsIn){var specs={optionName:'',saveAt:false,encloseSignature:false,encloseBlock:false,triggerSaveAt:false,insertBeforeTrigger:false,
	insertAfterTrigger:false,replaceTrigger:false,value:undefined,editSummary:""};if(!specsIn)throw new Error(sm.errorPrefix+"Data to save or retrieve was not supplied by the script using SettingsWizard.");if(!specsIn.optionName&&!specsIn.saveAt)throw new Error(sm.errorPrefix+"The options\'s name was not supplied by the script using SettingsWizard.");$.extend(true,specs,specsIn);var nsUser=mw.config.get('wgFormattedNamespaces')[2],skin=mw.config.get('skin'),user=mw.config.get('wgUserName'),skinJS=[nsUser,':',user,'/',skin,'.js'].join(''),commonJS=[nsUser,':',user,'/','common','.js'].join('');var $el,evt,jsFiles,process,$progress=new $.Deferred(),customJS;var triggerEvt=function(any){return(evt&&$el&&$el instanceof jQuery&&$el.triggerHandler(evt,Array.prototype.slice.call(arguments,0)));};process={updateVars:function(){jsFiles=[];$progress=new $.Deferred();customJS=[nsUser,':',user,'/prefs/',specs.saveAt,'.js'].join('');},start:function(){this.updateVars();$progress.then(triggerEvt,triggerEvt,triggerEvt);
	setTimeout($.proxy(this.getScripts,this),1);return $progress;},getScripts:function(){var i,len;$progress.notify("Preparing",1);if(specs.saveAt){jsFiles.push(sm.script(customJS));}else{jsFiles.push(sm.script(skinJS));jsFiles.push(sm.script(commonJS));}len=jsFiles.length;for(i=0;i<len;i++){var jsFile=jsFiles[i];jsFile.fetchText(process.gotJS,process.gotJSErr);$progress.notify("Requesting "+jsFile.getSource(),Math.round((i+1)*(9/len))+1,jsFile);}return $progress;},gotJS:function(jsFile,r){jsFile.gotContent=true;var i,len=jsFiles.length,pendings=0;for(i=0;i<len;i++){if(!jsFiles[i].gotContent){pendings++;}}$progress.notify("Got "+jsFile.getSource()+'. File length: '+jsFile.get().length+' characters.',Math.round((len-pendings)*(9/len))+10,jsFile);if(pendings)return;process.process();},gotJSErr:function(jsFile){$progress.reject("Failed. Could not retrieve "+jsFile.getSource(),-1,jsFile);},getStartBlock:function(sig){return'//'+sig+new Array(48-2-sig.length+1).join('/');},getEndBlock:function(sig){
	return new Array(48-2-3-sig.length+1).join('/')+sig+'End'+'//';},getBlockRegExp:function(sig){var escSig=process.escapeRE(sig);return new RegExp('\\n?\\n?\\/\\/'+escSig+'(?:.|\\n)*'+escSig+'End\\/\\/','g');},escapeRE:function(string){string=mw.RegExp.escape(string);var specials=['t','n','v','0','f'];$.each(specials,function(i,s){var rx=new RegExp('\\'+s,'g');string=string.replace(rx,'\\'+s);});return string;},getVariableRegExp:function(varName){var escVar=process.escapeRE(varName);return{varRE:new RegExp('\\s*(?:var\\s+|window\\.)?'+escVar+'\\s*=.+','g'),varWarnRE:new RegExp('\\s*(?:var\\s+|window\\.)?'+escVar+'\\s*=.+(?:\\n?\\s*[\\,\\+\\{\\(])\\s*\\n')};},process:function(){var JSONVal=JSON.stringify(specs.value),sig=specs.encloseSignature,tsa=specs.triggerSaveAt,opn=specs.optionName,jsFile,i,len=jsFiles.length,plainJSON=!opn&&!!jsFile,oldText,newText,hadMatch;if(opn){JSONVal='window.'+opn+' = '+JSONVal+';';}if(!plainJSON)JSONVal=((specs.encloseBlock&&('\n'+specs.encloseBlock))||'')+JSONVal;
	if(sig&&!plainJSON)JSONVal=process.getStartBlock(sig)+JSONVal+'\n'+process.getEndBlock(sig);JSONVal='\n\n'+JSONVal;if(sig){var reBl=process.getBlockRegExp(sig);for(i=0;i<len;i++){jsFile=jsFiles[i];oldText=jsFile.get();newText=oldText.replace(reBl,JSONVal);if(reBl.test(oldText)){$progress.notify("Replacing text enclosed by signature "+jsFile.getSource(),25,jsFile);process.save(jsFile.set(newText));hadMatch=true;}}}if(hadMatch)return;if(opn){var vre=process.getVariableRegExp(opn),warnFile;for(i=0;i<len;i++){jsFile=jsFiles[i];oldText=jsFile.get();if(vre.varWarnRE.test(oldText)){$progress.notify("Unable to remove config from "+jsFile.getSource(),-2,jsFile);warnFile=jsFile;}else{newText=oldText.replace(vre.varRE,JSONVal);if(vre.varRE.test(oldText)){$progress.notify("Replacing variable "+jsFile.getSource(),25,jsFile);process.save(jsFile.set(newText));hadMatch=true;}}if(warnFile&&!hadMatch){$progress.notify("Appending variable after warning to "+jsFile.getSource(),25,jsFile);process.save(warnFile.set(oldText+JSONVal));
	hadMatch=true;}}}if(hadMatch)return;if(!opn&&specs.saveAt){jsFile=jsFiles[0];$progress.notify("Replacing whole content of "+jsFile.getSource(),25,jsFile);process.save(jsFile.set(JSONVal));hadMatch=true;}if(hadMatch)return;if(tsa){var searchMatch,triggerLen=0;for(i=0;i<len;i++){jsFile=jsFiles[i];oldText=jsFile.get();searchMatch=oldText.search(tsa);if(-1!==searchMatch){if(specs.insertBeforeTrigger){$progress.notify("Inserting before pattern in "+jsFile.getSource(),25,jsFile);jsFile.set(oldText.slice(0,searchMatch)+JSONVal+oldText.slice(searchMatch));}else if(specs.insertAfterTrigger){triggerLen=oldText.match(tsa)[0].length;$progress.notify("Inserting after pattern in "+jsFile.getSource(),25,jsFile);jsFile.set(oldText.slice(0,searchMatch+triggerLen)+JSONVal+oldText.slice(searchMatch+triggerLen));}else if(specs.replaceTrigger){$progress.notify("Replacing pattern with new content in "+jsFile.getSource(),25,jsFile);jsFile.set(oldText.replace(tsa,JSONVal));}else{$progress.notify("Found pattern, appending to "+jsFile.getSource(),25,jsFile);
	jsFile.set(oldText+'\n//<nowiki>'+JSONVal+'\n//<\/nowiki>');}process.save(jsFile);hadMatch=true;break;}}}if(hadMatch)return;var biggest={size:0,jsFile:null};for(i=0;i<len;i++){jsFile=jsFiles[i];oldText=jsFile.get();var oldTextLen=oldText.length;if(oldTextLen>=biggest.size)biggest={size:oldTextLen,jsFile:jsFile};}$progress.notify("Appending to bigger file: "+biggest.jsFile.getSource(),25,biggest.jsFile);biggest.jsFile.set(biggest.jsFile.get()+'\n//<nowiki>'+JSONVal+'\n//<\/nowiki>');process.save(biggest.jsFile);},save:function(jsFile){jsFile.saving=true;$progress.notify("Saving "+jsFile.getSource(),30,jsFile);jsFile.save(process.saved,process.savedErr,"[[MediaWiki:Gadget-SettingsManager.js|SettingsManager]]: "+specs.editSummary);},saved:function(jsFile){var i,len=jsFiles.length,jsf,waitingFor=[];jsFile.saving=false;for(i=0;i<len;i++){jsf=jsFiles[i];if(jsf.saving){waitingFor.push(jsf.getSource());}}$progress.notify("Saved "+jsFile.getSource()+". Waiting for "+(waitingFor.join(', ')||'-'),Math.round((len-waitingFor.length)*(20/len))+50,jsFile);
	if(waitingFor.length)return;$progress.resolve("Success!",100,jsFile);},savedErr:function(jsFile,code,errObj){$progress.reject("Error saving "+jsFile.getSource()+". Code is "+code+".\n",-1,errObj);}};return{getSpecs:function(){return specs;},setSpecs:function(specsIn){specs=specsIn;return this;},fetchValue:function(cb,errCb){process.updateVars();if(specs.saveAt){var s=sm.script(customJS);if(specs.optionName){s.fetchText(function(){s.doEval();cb(valByString(specs.optionName));},errCb);}else{s.fetchJSON(function(scriptObj,JSON){cb(JSON);},errCb);}return this;}cb(valByString(specs.optionName));return this;},getValue:function(){return specs.value;},setValue:function(val){specs.value=val;return this;},save:function($elem,event){$el=$elem;evt=event;return process.start();},getProgress:function(){return $progress;}};},script:function(source){var content,page,summary="Changing configuration using [[:commons:MediaWiki:Gadget-SettingsManager.js]]",minor=1,exists,fetch,save;fetch=function(){var mwa=new mw.Api();
	return mwa.get({prop:'info|revisions',titles:source,rvprop:'timestamp|content',intoken:'edit'});};save=function(){var mwa=new mw.Api(),edit={action:'edit',title:source,text:'object'===typeof content?JSON.stringify(content):content,summary:summary,watchlist:'nochange',recreate:1};if(minor)edit.minor=1;if(exists){edit.basetimestamp=page.revisions[0].timestamp;}else{edit.starttimestamp=page.starttimestamp;}return mwa.postWithEditToken(edit);};return{get:function(){return content;},getSource:function(){return source;},doEval:function(){return eval(content);},parseJSON:function(){return('string'===typeof content&&content!=='')?JSON.parse(content):'';},fetchText:function(cb,errCb){var pgs,pg,scriptObj=this;fetch().done(function(result){pgs=result.query.pages;page=firstItem(pgs);exists=!!(page.revisions&&page.revisions[0]);content=(exists&&page.revisions[0]['*'])||'';cb(scriptObj,content);}).fail(function(status,errObj){errCb(scriptObj,status,errObj);});return this;},fetchJSON:function(cb,errCb){
	this.fetchText(function(scriptObj,content){cb(scriptObj,scriptObj.parseJSON());},function(scriptObj,status,errObj){errCb(scriptObj,status,errObj);});return this;},set:function(newContent){content=newContent;return this;},setMinor:function(newMinor){minor=!!newMinor;},setSummary:function(newSummary){summary=newSummary;},save:function(cb,errCb,newSummary,newContent,newMinor){var scriptObj=this;if(newContent!==undefined)content=newContent;if(newSummary!==undefined)summary=newSummary;if(newMinor!==undefined)minor=!!newMinor;save().done(function(result){cb(scriptObj,result);}).fail(function(status,errObj){errCb(scriptObj,status,errObj);});return this;}};},switchPref:function(prefName,prefVal,cb,errCb){var mwa=new mw.Api(),args=arguments,prefString=(typeof prefVal==='object')?JSON.stringify(prefVal):prefVal,apiDef=mwa.post({action:'options',token:mw.user.tokens.get('csrfToken'),optionname:prefName,optionvalue:prefString||0});apiDef.done(function(){mw.user.options.set(prefName,prefString);});
	if(cb)apiDef.done(cb);apiDef.fail(function(code,result){switch(code){case'badtoken':refreshToken(function(gotANewToken){if(gotANewToken)return sm.switchPref.apply(sm,Array.prototype.slice.call(args,0));});return false;case'http':case'ok-but-empty':setTimeout(function(){return sm.switchPref.apply(sm,Array.prototype.slice.call(args,0));},2500);return false;default:return(errCb&&errCb(code,result)&&false);}});return apiDef;},switchGadgetPref:function(prefName,prefVal){var $def=$.Deferred();sm.switchPref(mwPrefPrefix+prefName,prefVal,$.proxy($def.resolve,$def),$.proxy($def.reject,$def));return $def;},fetchGadgetSetting:function(prefName,prefSources){var $def=$.Deferred(),requires=[],options={'storage':{requires:['jquery.jStorage'],fetch:function(){var v=$.jStorage.get(prefName);return(null===v||undefined===v)?undefined:v;}},'cookie':{requires:['mediawiki.cookie'],fetch:function(){var v=mw.cookie.get(prefName);try{v=JSON.parse(v);}catch(invalidJSON){}return(null===v||undefined===v)?undefined:v;
	}},'option':{requires:['mediawiki.user','user.options'],fetch:function(){var v=mw.user.options.get(mwPrefPrefix+prefName);try{v=JSON.parse(v);}catch(invalidJSON){}return(null===v||undefined===v)?undefined:v;}},'window':{requires:[],fetch:function(){return window[prefName];}}};if(!prefSources)prefSources=[];if(!prefSources.length)prefSources=['storage','cookie','option','window'];var _fetch=function(s){var so=options[s];if(so){mw.loader.using(so.requires,function(){var v=so.fetch();if(undefined===v){_fetched();}else{$def.resolve(prefName,v);}});}else{if(!/^(?:User\:|MediaWiki\:).+\.js$/.test(s))_fetched();sm.script(s).fetchJSON(function(me,jsonData){if(jsonData){$def.resolve(prefName,jsonData);}else{_fetched();}},$.proxy($def.reject,$def));}},_fetched=function(){prefSources.shift();if(prefSources.length){_fetch(prefSources[0]);}else{$def.resolve(prefName);}};$.each(prefSources,function(i,s){var so=options[s];if(so)requires=requires.concat(options[s].requires);});mw.loader.load(requires);
	setTimeout(function(){_fetch(prefSources[0]);},10);return $def;},gadget:function(gadgetName){var optGadget='gadget-'+gadgetName,rlGadget='ext.gadget.'+gadgetName;return{getName:function(){return gadgetName;},isDefault:function(){var opt=mw.user.options.get(optGadget);return('number'===typeof opt||''===opt);},isEnabled:function(){var opt=mw.user.options.get(optGadget);return!!opt;},getState:function(){return mw.loader.getState(rlGadget);},isLoaded:function(){return('ready'===this.getState());},load:function(cb,errCb){if(this.isLoaded&&cb)return setTimeout(function(){cb(gadgetName,true);},1);mw.loader.using(rlGadget,cb?function(){cb(gadgetName);}:undefined,errCb?function(){errCb(gadgetName);}:undefined);return this;},enable:function(cb,errCb){sm.switchPref(optGadget,this.isDefault()?1:'1',cb,errCb);return this;},disable:function(cb,errCb){sm.switchPref(optGadget,'',cb,errCb);return this;}};}};mw.libs.settingsManager=sm;}(jQuery,mediaWiki));
	}];});
/**
 * Localization required. <span class="signature signature_252699">[[User:Liangent|Liangent]]（[[User talk:Liangent|留言]]）</span> 2013年4月8日 (一) 10:20 (UTC)
 *
 * Simple user interface for managing settings
 * This script only cares for the user interface.
 * It remains your task to save the settings 
 * e.g. using 'ext.gadget.SettingsManager' or 'jquery.jStorage' or 'mediawiki.cookie'
 *
 * @rev 1 (2012-09-19)
 * @author Rillke, 2012
 * @license This software is quadruple-licensed under GFDL, LGPL, GPL and CC-By-SA 3.0
 * Choose the license(s) you like best
 *
 * Usage instructions: See "smMembers = {"
 */
// List the global variables for jsHint-Validation. Please make sure that it passes http://jshint.com/
// Scheme: globalVariable:allowOverwriting[, globalVariable:allowOverwriting][, globalVariable:allowOverwriting]
/*global jQuery:false, mediaWiki:false*/
 
// Set jsHint-options. You should not set forin or undef to false if your script does not validate.
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, curly:false, browser:true*/

 
( function ( $, mw, undefined ) {
	'use strict';
	
	/********************************
	**
	** Translation
	**
	********************************/
	mw.messages.set({
		'sui-button-save':                   "OK",
		'sui-button-save-page':              "Temporarily on this page only",
		'sui-button-save-account-publicly':  "Publicly visible into your account",
		'sui-button-save-account-private':   "Into your account (private memory)",
		'sui-button-save-browser':           "Into your browser (local storage)",
		'sui-button-save-cookie':            "Into your browser (a cookie)",
		'sui-button-cancel':                 "Cancel",
		'sui-button-defaults':               "Fill-in defaults",
		'sui-title':                         "Preferences for $1",
		'sui-intro':                         "Customise $1 according to your wishes",
		'sui-save-location':                 "Where would you like to save the configuration for $1?",
		'sui-save-location-title':           "Location to store the preferences"
	});
	 
	var smMembers, smPrivate, nOEvents = 'input.numbersOnly keyup.numbersOnly';
	
	$('.numbersOnly').off(nOEvents).on(nOEvents, function () {
		var oldVal = this.value,
			newVal = oldVal.replace(/[^0-9]/g,'');
		if (oldVal !== newVal) this.value = newVal;
	});
	
	function SUI(settings, tool, saveoptions, title, intro) {
		// Invoked as a constructor
		if (this.settings) {
			if (settings) this.settings = settings;
			if (tool) this.tool = tool;
			if (saveoptions) this.saveoptions = saveoptions;
			if (title) this.title = title;
			if (intro) this.intro = intro;
			return this;
		// Invoked as a function
		} else {
			return new SUI(settings, tool, saveoptions, title, intro);
		}
	}
	smPrivate = {
		getObjLen: function(obj) {
			var i = 0;
			for (var elem in obj) {
				if (obj.hasOwnProperty(elem)) i++;
			}
			return i;
		},
		each: function(obj, cb) {
			var i = 0;
			for (var elem in obj) {
				if (obj.hasOwnProperty(elem)) {
					if (false === cb(i, elem, obj[elem])) break;
					i++;
				}
			}
			return obj;
		},
		$objToSelect: function(obj) {
			var $sel = $('<select>');
			
			this.each(obj, function(i, k, v) {
				$('<option>').attr({
					value: v
				}).text(k).appendTo($sel);
			});
			return $sel;
		}
	};
	smMembers = {
		constructor: SUI,
		version: '0.0.1.0',
		
		// * - required
		//
		// An array of settings-objects. A settings-object consists of
		// label*, value, select (in case you wish a select, pass an object with caption-value-pairs OR a function that creats a select),
		// name* (must be also valid for a HTML id attribute), min, max, default*
		// e.g. { label: "A sample property description", value: 1, name: 'sample_property', min:0, max:100 }
		settings: {},
		
		// * The tool's name that makes use of settings-UI
		tool: '',
		
		// Which options to show (c.f. "sui-button-save-" at mw.messages.set)
		saveoptions: ['page', 'account-publicly'],
		
		// Title of the settings-UI
		title: "",
		
		// Introductory text on top of the settings
		intro: "",
		
		
		/**
		* Show a dialog that contains controls for adjusting settings.
		*
		* @example
		*  window.mw.libs
			.SettingsUI([
				{ label: "A test setting label", value: 5, name: 'optionName', min:0, max:100, default: 0 },
				{ label: "A second label", value: "cba", name: 'collatingOrder', select: { "Ascending": 'abc', "Descending": 'cba' }, default: "abc" }
			], "MyTool")
			.show().progress(__myProgressCallback).done(function() { console.log("Selected> DONE!") });
		*
		* @context {window.mw.libs.SettingsUI}
		*
		* @return {Object} jQuery Deferred object (http://api.jquery.com/category/deferred-object/)
		*/
		show: function() {
			var sui = this,
				$progress = new $.Deferred();
				
			mw.loader.using([
				'jquery.ui',
				'mediawiki.user'
			], function() {
				sui._show($progress);
			});
			return $progress;
		},
		_show: function($progress) {
			var sui = this,
				$dlg,
				$saveButton;
			
			$dlg = sui.$dlg = $('<div>').attr({
				id: 'sui_' + sui.tool,
				title: sui.title || sui._msg('title')
			});
			$('<p>').attr('class', 'sui-intro').text(sui.intro || sui._msg('intro')).appendTo($dlg);
			$dlg.$c = $('<div>').css('padding', '3px').appendTo($dlg);
			
			smPrivate.each(sui.settings, function(i, c, s) {
				var $sDiv = $('<div>', { id: 'sui_cfg_' + s.name + '_wrap' }).data('cfg', s),
					vl = s.value,
					id = 'sui_cfg_' + s.name,
					$label, $valEl, $valEl2;
			
				$label = $('<label>').attr({ 'for': id }).text(s.label).appendTo($sDiv);
				$('<br>').appendTo($sDiv);
			
				switch (typeof s['default']) {
					case 'number': 
						$valEl = $('<input>').attr({ type: 'text', size: (s.max+'').length, id: id, 'class': 'numbersOnly' })
							.focus(function() { $(this).select(); })
							.keyup(function(e) {
								var val = this.value = this.value.replace(/[^0-9]/g,'');
								if (val) {
									if (val > s.max) {
										this.value = s.max;
									} else if (val < s.min) {
										this.value = s.min;
									}
									$valEl2.slider('option', 'value', this.value);
								}
							}).val(vl).appendTo($sDiv);
						$valEl2 = $('<div>', { style: 'margin-top:5px; margin-bottom:5px;' }).slider({
							min: s.min,
							max: s.max,
							value: vl,
							change: function(e, ui) {
								$valEl.val( ui.value );
							},
							slide: function(e, ui) {
								$valEl.val( ui.value );
							}
						}).appendTo($sDiv);
						break;
					case 'string':
						if ('function' === typeof s.select) {
							$sDiv.append(s.select().attr('id', id).val(vl));
						} else if ('object' === typeof s.select) {
							$sDiv.append(smPrivate.$objToSelect(s.select).attr('id', id).val(vl));
						} else {
							$('<input>', { type: 'text', id: id, style: 'width:99%' }).val(vl).appendTo($sDiv);
						}
						break;
					case 'boolean':
						$valEl = $('<input>', { type: 'checkbox', id: id }).appendTo($sDiv);
						if (vl) $valEl[0].checked = true;
						break;
				}
				$sDiv.find('input,select').keyup(function(e) {
					if (13 === Number(e.which)) {
						$saveButton.click();
					}
				});
				$sDiv.append('<hr/>', '<br/>').appendTo($dlg.$c);
			});
			
			var btns = {},
				_saveSelectionDlg,
				_onSave;
				
			_onSave = function($el) {
				var loc = $el.data('loc');
					
				smPrivate.each(sui.settings, function(i, c, s) {
					var val,
						name = s.name,
						id = '#sui_cfg_' + name,
						$ctrl = $(id);
						
					if ('boolean' === typeof s['default']) {
						val = $ctrl[0].checked;
					} else if ('number' === typeof s['default']) {
						val = Number($ctrl.val());
					} else {
						val = $ctrl.val();
					}
					s.value = val;
				});
				
				$progress.resolve( "save", "User selected save location.", loc, sui.settings, $dlg );
			};
			_saveSelectionDlg = function() {
				var $saveDlg = $('<div>').append($('<p>').text(sui._msg('save-location'))),
					$btnOuter = $('<div>').attr({
						'class': 'sui-cfg-saveselect-buttons'
					}).appendTo($saveDlg),
					$btnInner;
				
				smPrivate.each(sui.saveoptions, function(i, c, o) {
					if (o.indexOf('account') > 0 && mw.user.isAnon()) return;
					
					var $btnInner = $('<div>').css('text-align', 'center').appendTo($btnOuter);
					
					$('<button>', { role: 'button', 'class': 'ui-button-large', data: { loc: o } })
						.text(sui._msg('button-save-' + o))
						.click(function() {
							// First resolve the Deferred
							_onSave($(this));
							// Then, close the dialog
							$saveDlg.dialog('close');
							
						})
						.button()
						.appendTo($btnInner);
				});
				$saveDlg.dialog({
					title: sui._msg('save-location-title'),
					modal: true,
					width: Math.min(670, $(window).width()),
					close: function () {
						$(this).remove();
						$progress.reject( "usercanceled", "User canceled." );
					}
				});
				
				$progress.notify( "savedlg", "Save location select.", $dlg );
			};
				
			btns[sui._msg('button-save')] = _saveSelectionDlg;
			btns[sui._msg('button-cancel')] = function() {
				$(this).dialog('close');
			};
			btns[sui._msg('button-defaults')] = function() {
				smPrivate.each(sui.settings, function(i, c, s) {
					var $ctr = $('#sui_cfg_'+s.name);
					if ('boolean' === typeof s['default']) {
						$ctr[0].checked = s['default'];
					} else {
						$ctr.val(s['default']);
					}
					$ctr.keyup();
				});
				$progress.notify( "defaultsin", "Defaults set.", $dlg );
			};
			$dlg.dialog({
				modal: true,
				resizable: false,
				width: Math.min(670, $(window).width()),
				close: function () {
					$(this).remove();
					$progress.reject( "usercanceled", "User canceled." );
				},
				buttons: btns,
				open: function() {
					var $dlg = $(this),
						$parent = $dlg.dialog('widget'),
						$buttons = $parent.find('.ui-dialog-buttonpane button');
					$saveButton = $buttons.eq(0).specialButton('proceed');
					$buttons.eq(1).specialButton('cancel');
					$buttons.eq(2).button({ icons: { primary: 'ui-icon-refresh' } });
					$dlg.dialog('option', 'height', Math.min($parent.height(), $(window).height()));
					if ($(window).scrollTop() > $parent.position().top) $dlg.dialog('option', 'position', 'top');
				}
			});
			$progress.notify( "dlgup", "Dialog created.", $dlg );
		},
		hide: function() {
			// TODO: Implement
		},
		_msg: function(key) {
			var args = Array.prototype.slice.call(arguments, 0);
			args[0] = 'sui-' + args[0];
			args[args.length] = this.tool;
			return mw.message.apply(this, args).parse();
		}
	};
	// Add members to prototype
	SUI.fn = SUI.prototype = smMembers;
	 
	// Expose globally
	window.mw.libs.SettingsUI = SUI;
	
	}( jQuery, mediaWiki ));

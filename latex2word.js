(function(){
	"use strict";
	var toHex = function(color){
		return Math.round((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2]).toString(16).slice(1);
	};
	var envirn = function(code){
		var o = {full: ""}
		var com = command(code);
		if(com.name != "begin"){return false}
		o.command = com;
		var name = com.args[0];
		o.name = name;
		code = code.substring(com.full.length);
		var content = "", commentmode = false;
		for(var i=0, char, sub;i<code.length;i++){
			var char = code.charAt(i),
			sub = code.substring(i);
			if(commentmode && char != "\n"){
				content += char;continue;
			}
			commentmode = false;
			if(char == "\\"){
				if(sub.lastIndexOf("\\begin{",0)===0){
					var env = envirn(sub);
					content += env.full;
					i += env.full.length - 1;
				}
				else if(sub.lastIndexOf("\\end{"+name+"}",0)===0){
					o.content = content;
					o.full = o.command.full + o.content + "\\end{"+name+"}";
					return o;
				}
				else{
					var com2 = command(sub);
					content += com2.full;
					i += com2.full.length - 1;
				}
			}
			else if(char == "%"){
				content += "%";
				commentmode = true;
			}
			else{
				content += char;
			}
		}
	},
	specialSeparators = {
		cmidrule : ["(", ")"],
		taburulecolor : ["|", "|"],
		Block : ["<",">"]
	},
	commandNumbers = {
		def:3,
		edef:3,
		emph:1,
		gdef:3,
		multicolumn : 3,
		multirow : 3,
		multirowcell : 2,
		multirowthead : 2,
		newcommand:2,
		providecommand:2,
		renewcommand:2,
		tabucline : 1,
		taburowcolors : 2,
		textbf:1,
		textsc:1,
		textit:1,
		textsl:1,
		texttt:1,
		uline:1,
		xdef:3
	},
	definedCommands = {
		"maketitle":{
			name:"maketitle",
			definition:"",
			expansion:"{\\begin{center}\\LARGE\\title\\par\\Large\\author\\par\\Large\\date\\end{center}}"
		}
	},
	command=function(code){
		var o = {
			options : [],
			args : [],
			sp : [],
			full : "",
			asterisk : false
		}
		var name=/^(\\?(?:[a-z]+|.))/i.exec(code)[1],
		realname = name;
		if(realname.charAt(0) == "\\" && realname.length > 1){
			realname = realname.substring(1);
		}
		var nextchar = code.charAt(name.length);
		if(definedCommands[realname]){
			var j = 0;
			var code = code.substring(name.length) + " ";
			o.name = realname;
			var def = definedCommands[realname].definition;
			var actu = "";
			var searchFor = "";
			if(def.indexOf("#")<0){
				o.full = "\\"+realname;
				return o;
			}
			for(;j<code.length;j++){
				var c = code[j];
				if(/\S/.test(c)){
					break;
				}
			}
			for(var i=0;i<def.length;i++){
				var c = def[i];
				if(c == "#" && i+1 == def.length){
					// special case
				}
				else if(c == "#"){
					i++;
					searchFor = (/^[^#]+/.exec(def.substring(i+1))||[])[0] || "";
					i+= searchFor.length+1
					var inArg = 0,
					inComment = false;
					inComm: for(;j<code.length;j++){
						var char = code[j];
						actu += char;
						if(inComment){
							if(char == "\n"){
								inComment = false;
							}
						}
						else if(char == "%"){
							inComment = true;
						}
						else if(char == "\\"){
							var ccom = command(code.substring(j));
							actu += ccom.full.substring(1);
							j += ccom.full.length-1;
						}
						else if(char == "{"){
							inArg++;
						}
						else if(char == "}"){
							inArg--;
						}
						if(!inComment && inArg>=0){
							if(actu.endsWith(searchFor) || !searchFor){
								o.args.push(actu.slice(0,-searchFor.length));
								actu = searchFor = "";
								break inComm;
							}
						}
					}
				}
				else{
					if(code[j] == "%"){
						inComm: for(;j<code.length;j++){
							if(code[j] == "\n"){
								j++;
								break inComm;
							}
						}
					}
					if(c == code[j]){
						j++;
					}
				}
			}
			o.full = "\\"+realname+code.substring(0,j+1);
			return o;
		}
		else if(realname == "verb"){
			code = code.substring(name.length+1);
			var arg = "";
			for(var i=0, char;i<code.length;i++){
				char = code.charAt(i);
				if(char == nextchar){
					o.args.push(arg);
					o.name = realname;
					o.full = "\\verb"+nextchar+arg+nextchar;
					return o;
				}
				else{
					arg += "" + char;
				}
			}
			return false;
		}
		else if(realname == "char"){
			// TODO : Improve `\char` support. Now we just try to prevent bugs
			if(nextchar == "`"){
				var nextchar = code.charAt(name.length+1);
				if(nextchar == "\\"){
					o.args.push("\\"+code.charAt(name.length+2))
					o.name = "char";
					o.full = "\\char`\\"+code.charAt(name.length+2);
					return o;
				}
				else{
					o.name = "char";
					o.sp = "`" + nextchar;
					o.full = "\\char`"+nextchar;
				}
			}

		}
		else if(realname == "\\"){
			o.asterisk = nextchar == "*";
			o.name = realname;
			o.full = "\\\\"+(o.asterisk ? "*" : "");
			return o;
		}
		else if(realname == "$" || realname == "%" || realname == "_" || realname == "&" || realname == "#"){
			o.name = realname;
			o.full = "\\"+realname;
			return o;
		}
		else if(nextchar == "*"){
			o.asterisk = true;
			nextchar = code.charAt(name.length+1);
		}
		if((nextchar == "]" || nextchar == "}" || nextchar == "\\" || nextchar == "&") && !commandNumbers[realname]){
			o.name = realname;
			o.full = "\\" + realname +(o.asterisk ? "*" : "");
			return o;
		}
		if(nextchar!="[" && nextchar!="{" && !/^\s$/.test(nextchar) && !commandNumbers[realname] &&
		  (!specialSeparators[realname] || nextchar != specialSeparators[realname][0])){
			o.name = realname;
			o.args.push(nextchar);
			o.full="\\"+realname+""+(o.asterisk ? "*" : "")+nextchar;
			return o;
		}
		code = code.substring(name.length+(o.asterisk?1:0)) + " ";
		var mode = 0, actu = "", nbofbrack=0;

		/* Modes:
		/*
		/*  0: Looking for the next character
		/*  1: Inside an optional argument ([])
		/*  2: Inside an argument ({})
		/*  3: Inside a special argument
		/*  4: Inside a command definition (i.e. the part after \def) */

		for(var i=0;i<code.length;i++){
			var char = code.charAt(i);
			if(char == "%"){
				var index = code.indexOf("\n", i);
				var toadd = code.substring(i, index);
				actu += toadd;
				i += toadd.length-1;
			}
			else if(mode == 0){
				if(char == "["){
					mode = 1;
					actu = "";
				}
				else if(char == "{"){
					mode = 2;
					nbofbrack = 0;
					actu = "";
				}
				else if(char == "\\" && o.args.length < commandNumbers[realname]){
					var argcom = /^(?:[a-zA-Z@]+|.)/.exec(code.substring(i+1))[0];
					o.args.push(char+argcom);
					i+=argcom.length
					if(realname == "def" || realname == "edef" || realname == "gdef" || realname == "xdef"){
						mode = 4;
						actu = "";
					}
				}
				else if(char == " " && i < code.length - 1){
					continue;
				}
				else if(specialSeparators[realname] && char == specialSeparators[realname][0]){
					mode = 3;
					actu = "";
				}
				else if(commandNumbers[realname] && o.args.length < commandNumbers[realname]){
					o.args.push(char);
				}
				else{
					o.name = realname;
					o.full = ("\\"+realname+code.substring(0,i)).trim();
					return o;
				}
			}
			else if(mode == 4){
				if(char == "{"){
					mode = 2;
					o.args.push(actu);
					actu = "";
				}
				else{
					actu += ""+char;
				}
			}
			else if(char == "\\" && mode != 3){
				var fullcommand = command(code.substring(i)).full;
				actu += fullcommand;
				i+=fullcommand.length-1;
			}
			else if(mode == 1){
				if(char == "]"){
					mode = 0;
					o.options.push(actu);
				}
				else{
					actu += ""+char;
				}
			}
			else if(mode == 3){
				if(char == specialSeparators[realname][1]){
					mode = 0;
					o.sp.push(actu);
				}
				else{
					actu += "" + char;
				}
			}
			else{ // mode 2
				if(char == "}"){
					if(nbofbrack<=0){
						mode = 0;
						o.args.push(actu);
					}
					else{
						nbofbrack--;
						actu += char;
					}
				}
				else if(char == "{"){
					nbofbrack++;
					actu += char;
				}
				else{
					actu += "" + char
				}
			}
		}
	},
	LatexContext = function(parentContext){
		this.call = function(name, args){
		}
		this.parentContext = parentContext || null;
		this.global = function(){
			var ctx = this;
			var gbl = this;
			while(ctx = ctx.parentContext){
				gbl = ctx;
			}
			return gbl;
		}
		var db = {};
		this.getDB = function(){
			return db;
		}
		this.get = function(name){
			var ctx = this;
			do{
				if(ctx.getDB().hasOwnProperty(name)){
					return ctx.getDB()[name];
				}
			}
			while(ctx = ctx.parentContext);
			return null;
		}
		this.set = function(name, value){
			db[name] = value;
		}
	}
	var latex2word = new (function(){
		this.files = [];
		this.texFiles = [];
		this.startFile = function(e){
			this.files = e.target.files;
			this.file = null;
			this.texFiles = [];
			while(document.getElementById("select-files").firstChild){
				document.getElementById("select-files").removeChild(document.getElementById("select-files").firstChild);
			}
			while(document.getElementById("log").firstChild){
				document.getElementById("log").removeChild(document.getElementById("log").firstChild);
			}
			for(var i=0;i<this.files.length;i++){
				console.log(this.files[i].webkitRelativePath);
				if(/^[^\\//]+[\\//][^\\//]+\.tex$/i.test(this.files[i].webkitRelativePath)){
					this.texFiles.push(this.files[i]);
				}
			}
			if(this.texFiles.length === 0){
				document.getElementById("select-files").innerHTML = "No TEX file found. Main TEX file can't be in a subfolder.";
			}
			else if(this.texFiles.length === 1){
				this.selectFile(0);
			}
			else{
				var d = document.createDocumentFragment();
				var ul = document.createElement("ul");
				d.appendChild(ul);
				this.texFiles.sort(function(a,b){
					a.name - b.name
				});
				for(var i=0;i<this.texFiles.length;i++){
					var li = document.createElement("li");
					var a = document.createElement("label");
					a.innerText = this.texFiles[i].name;
					a.innerHTML = "<input type='radio' name='file'> "+ a.innerHTML
					a.href = "#";
					li.appendChild(a);
					ul.appendChild(li);
				}
				document.getElementById("select-files-container").style.display="inline-block";
				document.getElementById("select-files-button").onclick = function(i){
					var radio = document.getElementsByName("file");
					for(var i=0;i<radio.length;i++){
						if(radio[i].checked){
							document.getElementById("select-files-container").style.display="none";
							this.selectFile(i);
							break;
						}
					}
					window.event.preventDefault();
				}.bind(this, i)
				document.getElementById("select-files").appendChild(d);
			}
		}.bind(this)
		this.selectFile = function(n){
			this.file = this.texFiles[n];
			this.file.text().then(function(text){
				this.source = text;
				_text2docx(this.source);
			}.bind(this));
		}
		this.unknownCommands = {}
		this.text2docx = function(source){
			this.files = [];
			this.file = null;
			this.source = source;
			return _text2docx();
		}
		this.getDocument = function(txt){
			var o = {packages:{}};
			var inComment = false,
			makeatletter = false;
			for(var i=0;i<txt.length;i++){
				var c = txt[i];
				var sub = txt.substring(i);
				if(inComment){
					if(c == "\n"){inComment = false;}
					continue;
				}
				if(c == "%"){
					inComment = true;
				}
				else if(c == "\\"){
					if(sub.lastIndexOf("\\begin{",0) === 0){
						var env = envirn(sub);
						i += env.full.length - 1;
						if(env.name == "document"){
							o.document = env.content;
						}
					}
					else{
						var com = command(sub), name = com.name;
						i+=com.full.length-1;
						if(name == "documentclass"){
							o.documentClass = com;
						}
						else if((name == "def" || name == "gdef") && !makeatletter){
							definedCommands[com.args[0].substring(1)] = {
								name: com.args[0].substring(1),
								definition: com.args[1],
								expansion: ""
							}
						}
						else if(name == "makeatletter"){makeatletter = true;}
						else if(name == "makeatother"){makeatletter = false;}
						else if(name == "usepackage"){
							var packages = com.args[0].split(",");
							for(var j=0;j<packages.length;j++){
								o.packages[packages[j].trim()] = com;
							}
						}
						else if(name == "title" || name == "author" || name == "date"){
							o[name] = com.args[0];
						}
					}
				}
				
			}
			return o;
		}
		this.lengthToDXA = function(length){
			var value = parseInt(length, 10);
			var unit = ((/\D+$/.exec(length) || ["pt"])[0]).toLowerCase();
			if(unit == "pt"){return value*20}
			if(unit == "in"){return value*20*72}
			if(unit == "cm"){return value*20*72/2.54}
			else{return value*20}
		}
		this.pushParagraph = function(push){
			if(!this.paragraph || this.paragraph.children.length > 0 || this.textNode.text.length > 0){
				if(this.paragraph && push !== false){
					this.pushText();
					this.section.children.push( new docx.Paragraph(this.paragraph) );
				}
				this.paragraph = {children:[],
				alignment:this.actualContext.get("alignment")};
				this.paragraph.indent = {
					firstLine : this.actualContext.get("indent")
				}
			}
		}
		this.pushText = function(push){
			if(push !== false){
				this.paragraph.children.push( new docx.TextRun(this.textNode) );
			}
			this.textNode = {text:""}
			if(this.actualContext.get("italic")){
				this.textNode.italics = true
			}
			if(this.actualContext.get("bold")){
				this.textNode.bold = true
			}
			if(this.actualContext.get("underline")){
				this.textNode.underline = this.actualContext.get("underline")
			}
			if(this.actualContext.get("smallcaps")){
				this.textNode.smallCaps = true;
			}
			if(this.actualContext.get("fontSize")){
				this.textNode.size = this.actualContext.get("fontSize");
			}
			this.textNode.color = this.actualContext.get("color") || "000000";
		}
		this.pushField = function(code){
			this.pushText();
			this.textNode.children = [
				new docx.SimpleField(code)
			];
			this.pushText();
		}
		this.pushSection = function(){
			if(!this.section || this.section.children.length > 0){
				if(this.section){
					this.pushParagraph();
					this.sections.push(this.section);
				}
				this.section = {children:[],
				properties:{page:{
					size: {
						width: this.actualContext.get("pagewidth"),
						height: this.actualContext.get("pageheight"),
						orientation: docx.PageOrientation.PORTRAIT,
					},
					margin: {
						top: "2in",
						right: this.actualContext.get("rightmargin"),
						bottom: "2in",
						left: this.actualContext.get("leftmargin"),
						header: 808,
						footer: 808,
						gutter: this.actualContext.get("gutter"),
                		    }
				,}}
				}
			}
		}
		this.getLabel = function(txt){
			var inComment = false;
			for(var i=0;i<txt.length;i++){
				var c = txt[i];
				if(inComment){
					if(c == "\n"){inComment = false;}
					continue;
				}
				else if(c == "%"){
					inComment = true;
				}
				else if(c == "\\"){
					var sub = txt.substring(i);
					if(/^\\label ?\{/.test(sub)){
						var label = /^[^\{]+\{\s*([^\s\{\}]+)/.exec(sub);
						if(label){
							return label[1];
						}
						return null;
					}
					i++;
				}
			}
			return null;
		}
		this.loadScript = function loadScript(src) {
    			return new Promise(function (resolve, reject) {
    				var s = document.createElement('script');
    				s.src = src;
    				s.onload = function(){
					resolve();
				};
    				s.onerror = reject;
    				document.head.appendChild(s);
    			});
		}
		this.requestTikz = async function() {
			this.Log("Loading Tikz scripts files...");
			await this.loadScript("js/tikzjax/tikzjax.js?nocache=99");
			await window.tikzLoad();
			this.requestTikz = false;
		}
		this.loadedFont = {}
		this.loadFont = async function(src){
			if(src.indexOf(".")<0){src += ".ttf"}
			var name = /^[a-z0-9]+/i.exec(src)[0];
			var myFont = new FontFace(name, "url(js/tikzjax/ttf/" + src + ")");
			this.loadedFont[src] = true;
			this.loadedFont[name] = true;
			return new Promise(function(resolve, reject){
				myFont.load().then(function(font) {
					document.fonts.add(font);
					resolve();
				}).catch(reject);
			}.bind(this));
		}
		this.getTikz = async function(source){
			if(this.requestTikz){await this.requestTikz()}
			this.Log("Converting Tikz image to SVG");
			this.Log("Running TeX engine...");
			var csl = console.log;
			var log = "";
			window.console.log = function(txt){
				log+= txt+"\n";
			}
			try{
				var svg = await window.getTikzSVG(source);
			}
			catch(e){
				this.Log("Tikz image could not be loaded:\n"+e.message);
				return null;
			}
			var fontsElements = Array.from(svg.getElementsByTagName("svg")[0].querySelectorAll('[style*="font-family"]'));
			for(var i=0;i<fontsElements.length;i++){
				var font = fontsElements[i].style.fontFamily.trim();
				if(!this.loadedFont[font]){
					try{
						this.Log(`Loading font '${font}'...`);
						await this.loadFont(font);
					}
					catch(e){
						this.Log("Font failed.");
					}
				}
			}
			this.Log("TeX log file:");
			this.Log(log);
			window.console.log = csl;
			var res = await this.svg2img(svg.getElementsByTagName("svg")[0]);
			return [res.url, res.width, res.height];			
		}
		this.Log = function(txt){
			console.info(txt);
			window.requestAnimationFrame(function(){
				var li = document.createElement("li");
				li.innerText = txt;
				document.getElementById("log").appendChild(li);
			});
		}
		this.svg2img = async function(svg){
			// Accept SVG string or SVG element
			var canvas = document.getElementById("canvas");
			if(typeof svg != "string"){
				svg = new XMLSerializer().serializeToString(svg)
			}
			var svg64 = btoa(svg);
			var b64Start = 'data:image/svg+xml;base64,';
			var image64 = b64Start + svg64;
			var img = document.createElement("img");
			img.src = image64;
			return new Promise(async function(resolve, reject){
				img.onload = async function(){
					canvas.width = img.width * 300/96
					canvas.height = img.height * 300/96
					var v = Canvg.fromString(canvas.getContext("2d"), svg);
					v.resize(img.width * 300/96,img.height * 300/96,"xMidYMid meet")
					await v.render();
					window.requestAnimationFrame(function(){
						var result = {
							url:canvas.toDataURL(),
							width:canvas.width / 300*96,
							height:canvas.height / 300*96
						};
						var img = document.createElement("img");
						img.onload = function(){
							resolve(result);
						}
						result.img = img;
						img.src = result.url;
					})
				}
			});
		}
/*
		this.svg2img = async function(svg){
			// Accept SVG string or SVG element
			var canvas = document.getElementById("canvas");
			if(typeof svg != "string"){
				svg = new XMLSerializer().serializeToString(svg)
			}
			var svg64 = btoa(svg);
			var b64Start = 'data:image/svg+xml;base64,';
			var image64 = b64Start + svg64;
			var img = document.createElement("img");
			img.src = image64;
			return new Promise(function(resolve, reject){
				img.onload = function(){
					canvas.width = img.width;
					canvas.height = img.height;
					canvas.getContext("2d").imageSmoothingEnabled = false;
					canvas.getContext('2d').drawImage(img, 0, 0);
					window.requestAnimationFrame(function(){
						var result = {url:canvas.toDataURL(),width:img.width,height:img.height};
						var img = document.createElement("img");
						canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
						img.onload = function(){
							resolve(result);
						}
						result.img = img;
						img.src = result.url;
					})
				}
			});
		}
*/
		this.getMath = async function(math, display){
			var res = await MathJax.tex2svgPromise(math, {display:display,scale:2});
			return await this.svg2img(res.getElementsByTagName("svg")[0]);
		}
		this.toImg = async function(url){
			var img = document.createElement("img");
			img.src = url;
			return new Promise(function(resolve, reject){
				img.onload = function(){
					resolve(img);
				}
			});
		}
		this.getMathSplit = async function(math, envname, content, display){
			// This return several SVG image
			var dpi = 300;
			var main = await MathJax.tex2svgPromise(math, {display:display,scale:2});
			var separateEq = [];
			var actualEquation = "";
			var inComment = false,
			inArg = 0;
			for(var i=0;i<content.length;i++){
				var c = content[i];
				if(inComment){
					if(c == "\n"){inComment = false;}
					continue;
				}
				if(c == "%"){
					inComment = true;
				}
				else{
					if(c == "{"){
						inArg++;
					}
					else if(c == "}"){
						inArg--;
					}
					else if(c == "\\"){
						if(inArg <= 0 && content[i+1] == "\\"){
							separateEq.push(actualEquation);
							i++;
							actualEquation = "";
						}
						else if(/^\\\\begin\s*\{/.test(content.substring(i))){
							var env = envirn(content.substring(i));
							i += env.full.length - 1;
						}
						else{
							actualEquation += c + content[i+1];
							i++;
						}
						continue;
					}
					actualEquation += c;
				}
			}
			if(/\S/.test(actualEquation)){separateEq.push(actualEquation);}
			var totalImage = await this.svg2img(main.getElementsByTagName("svg")[0]);
			var totalHeight = 0;
			var results = []
			for(var i=0;i<separateEq.length;i++){
				var label = this.getLabel(separateEq[i]);
				separateEq[i] = await MathJax.tex2svgPromise("\\begin{"+envname+"}\\require{ams}"+separateEq[i]
					+"\\end{"+envname+"}", {display:display});
				var subimg = await this.svg2img(separateEq[i].getElementsByTagName("svg")[0]);
				var subheight = subimg.height;
				var canvas = document.createElement('canvas');
				canvas.width = totalImage.width*dpi/96;
				canvas.height = subheight*dpi/96;
				canvas.getContext("2d").imageSmoothingEnabled = false;
				canvas.getContext('2d').drawImage(
					totalImage.img,
					0,
					totalHeight,
					totalImage.width*dpi/96,
					subheight*dpi/96,
					0,
					0,
					totalImage.width*dpi/96,
					subheight*dpi/96
				);
				var result = canvas.toDataURL();
				results.push({url:result,height:subheight,width:totalImage.width,label:label});
				totalHeight += (subheight + 5) * dpi / 96;
			}
			return results;
		}
		this.NO_BORDER = function(){
			return {
					bottom: {
						style: docx.BorderStyle.NONE,
						size: 0,
						color: "000000",
        				},
					top: {
						style: docx.BorderStyle.NONE,
						size: 0,
						color: "000000",
        				},
					left: {
						style: docx.BorderStyle.NONE,
						size: 0,
						color: "000000",
        				},
					right: {
						style: docx.BorderStyle.NONE,
						size: 0,
						color: "000000",
        				}
			}
		}
		this.pushNumberedEquation = function(obj){
			var identifier;
			var idchild;
			if(obj.label){
				identifier = new docx.Bookmark({
            				id: obj.label,
            				children: [
                				new docx.SequentialIdentifier("Equation"),
        				],
        			});
			}
			else{
				identifier = new docx.SequentialIdentifier("Equation");
			}
			this.pushParagraph();
			this.paragraph.tabStops = [
				{
					type: docx.TabStopType.CENTER,
					position : this.Global.get("textwidth")/2
				},
				{
					type: docx.TabStopType.RIGHT,
					position: this.Global.get("textwidth")
				}
			]
			this.paragraph.children = [
				new docx.TextRun("\t"),
				new docx.ImageRun({
					data: obj.url,
					transformation: {
						width: obj.width,
 						height: obj.height
    					}
				}),
				new docx.TextRun("\t("),
				identifier,
				new docx.TextRun(")")
			]
			this.pushParagraph();
			/*
			this.section.children.push(new docx.Table({
    				alignment: docx.AlignmentType.CENTER,
				rows:[
					new docx.TableRow({
						children:[
							new docx.TableCell({
								width:{
									size:10,
									type:docx.WidthType.PERCENTAGE
								},
								children:[],
								margins: {
									top:"top" in obj ? obj.top : 200,
									bottom:"bottom" in obj ? obj.bottom:200,
									right:0,
									left:0
								},
								borders:this.NO_BORDER()
							}),
							new docx.TableCell({
								children:[
									new docx.Paragraph({
										alignment: docx.AlignmentType.CENTER,
										children:[new docx.ImageRun({
											data: obj.url,
											transformation: {
											       width: obj.width,
 											       height: obj.height
    											}
										})]
									})
								],
								verticalAlign:docx.VerticalAlign.CENTER,
								margins: {
									top:"top" in obj ? obj.top : 200,
									bottom:"bottom" in obj ? obj.bottom:200,
									right:0,
									left:0
								},
								borders:this.NO_BORDER()
							}),
							new docx.TableCell({
								width:{
									size:10,
									type:docx.WidthType.PERCENTAGE
								},
								alignment: docx.AlignmentType.RIGHT,
								children:[new docx.Paragraph({
									alignment: docx.AlignmentType.RIGHT,
									children:[
										new docx.TextRun("("),
										identifier,
										new docx.TextRun(")"),
									]
								})],
								verticalAlign:docx.VerticalAlign.CENTER,
								margins: {
									top:"top" in obj ? obj.top : 200,
									bottom:"bottom" in obj ? obj.bottom:200,
									right:0,
									left:0
								},
								borders:this.NO_BORDER()
							})
						]
					})
				],
				width:{
					size:100,
					type:docx.WidthType.PERCENTAGE
				}
			}));
			*/
		}
		this.firstRun = async function(txt){
			var inComment = false;
			for(var i=0;i<txt.length;i++){
				var c = txt[i];
				if(inComment){
					if(c == "\n"){inComment = false}
					continue;
				}
				else if(c == "%"){inComment = true}
				else if(c == "\\"){
					var com = command(txt.substring(i));
					if(com.name == "footnote"){
						var label = /\\label ?\{/.exec(com.args[0]);
						if(label){
							label = command(com.args[0].substring(label.index))
							this.doc.footnoteLabels[label.args[0]] = true;
						}
					}
					i+=com.full.length-1;
				}
			}
		}
		this.printMath = function(math, display){
			if(display){
				this.pushParagraph();
				this.paragraph.alignment = docx.AlignmentType.CENTER;
				this.paragraph.children.push(new docx.Math({children:[new docx.MathRun(math)]}));
				this.pushParagraph();
			}
			else{
				this.pushText();
				this.paragraph.children.push(new docx.Math({children:[new docx.MathRun(math)]}));
			}
		}
function concatAndResolveUrl(url, concat) {
  var url1 = url.split('/');
  var url2 = concat.split('/');
  var url3 = [ ];
  for (var i = 0, l = url1.length; i < l; i ++) {
    if (url1[i] == '..') {
      url3.pop();
    } else if (url1[i] == '.') {
      continue;
    } else {
      url3.push(url1[i]);
    }
  }
  for (var i = 0, l = url2.length; i < l; i ++) {
    if (url2[i] == '..') {
      url3.pop();
    } else if (url2[i] == '.') {
      continue;
    } else {
      url3.push(url2[i]);
    }
  }
  return url3.join('/');
}
		this.processTable = async function(o){
			// Process a Docx Table Object from an object from latex-tables.com
			var tableO = {rows:[]};
			if(this.actualContext.get("alignment") == docx.AlignmentType.CENTER){
				tableO.alignment = docx.AlignmentType.CENTER
			}
			else if(this.actualContext.get("alignment") == docx.AlignmentType.RIGHT){
				tableO.alignment = docx.AlignmentType.RIGHT
			}
			for(var i=0;i<o.cells.length;i++){
				var rowO = {children:[]}
				var row = o.cells[i];
				for(var j=0;j<row.length;j++){
					var cell = row[j];
					var cellO = {children:[]}
					cellO.columnSpan = cell.colSpan || 1;
					cellO.rowSpan = cell.rowSpan || 1;
					var context = this.actualContext;
					var newContext = new LatexContext(this.actualContext);
					this.actualContext = newContext;
					newContext.set("indent", 0);
					if(cell.dataset.align == "c"){
						newContext.set("alignment", docx.AlignmentType.CENTER);
					}
					else if(cell.dataset.align == "r"){
						newContext.set("alignment", docx.AlignmentType.RIGHT);
					}
					else{
						newContext.set("alignment", docx.AlignmentType.LEFT);
					}
					var res = await this.readSubContext(cell.code, newContext, true);
					var bordersO = this.NO_BORDER();
					if("borderTop" in cell.dataset){
						bordersO.top.style = docx.BorderStyle.SINGLE
						bordersO.top.size = 1
					}
					if(o.autoBooktabs && i === 0){
						bordersO.top.style = docx.BorderStyle.THICK
						bordersO.top.size = 2
					}
					if("borderBottom" in cell.dataset){
						bordersO.bottom.style = docx.BorderStyle.SINGLE
						bordersO.bottom.size = 1
					}
					if(o.autoBooktabs && i === o.cells.length-1){
						bordersO.bottom.style = docx.BorderStyle.THICK
						bordersO.bottom.size = 2
					}
					if("borderLeft" in cell.dataset){
						bordersO.left.style = docx.BorderStyle.SINGLE
						bordersO.left.size = 1
					}
					if("borderRight" in cell.dataset){
						bordersO.right.style = docx.BorderStyle.SINGLE
						bordersO.right.size = 1
					}
					cellO.borders = bordersO;
					Array.prototype.push.apply(cellO.children, res);
					this.actualContext = context;
					rowO.children.push(new docx.TableCell(cellO));
				}
				tableO.rows.push(new docx.TableRow(rowO));
			}
			this.pushParagraph();
			this.section.children.push(new docx.Table(tableO));
		}
		this.getFileByURL = async function(url, ext, other, getFile){
			if(ext){
				url = url + "."+ext;
			}
			var foundfile = null;
			var newurl = concatAndResolveUrl(this.file.webkitRelativePath.replace(/\/.+$/,""),url);
			for(var i=0;i<this.files.length;i++){
				var file = this.files[i];
				if(file.webkitRelativePath == newurl){
					foundfile = file;break;
				}
			}
			if(getFile){return file;}
			if(foundfile){
				var resp = await foundfile.text();
				return resp;
			}
			else if(other){
				var resp = await fetch((other===true?"":other)+url);
				if(resp){resp = await resp.text();}
				return resp;
			}
			return null;
		}
		this.breakLink = function(url){
			var txt = "",
			after = ":/.?#&_,;-!";
			for(var i=0;i<url.length;i++){
				if(url[i] == "%"){
					txt += "\u200B%"
				}
				else if(after.indexOf(url[i]) > -1){
					txt += url[i] + "\u200B";
				}
				else{
					txt += url[i];
				}
			}
			return txt;
		}
		this.readBbl = async function(txt){
			var inComment = false;
			var found = false;
			var inside = "";
			for(var i=0;i<txt.length;i++){
				var c = txt[i];
				if(inComment){
					if(c == "\n"){
						inComment = false;
					}

					continue;
				}
				if(c == "\\"){
					var com = command(txt.substring(i));
					if(com.name == "bibitem"){
						if(found){
							this.doc.bibliography.bbl[this.doc.bibliography.bbl.length-1].content = inside;
							inside = "";
						}
						found = true;
						this.doc.bibliography.bbl.push({
							index:this.doc.bibliography.bbl.length+1,
							label:com.args[0],
							natbib:com.options[0]
						});
					}
					else if(found){
						inside += com.full;
					}
					i += com.full.length - 1;
				}
				else if(c == "%"){
					inComment = true;
				}
				else if(found){
					inside += c;
				}
			}
		}
		this.readSubContext = async function(txt, context, sec){
			var thisSection = this.section;
			var thisParagraph = this.paragraph;
			var thisText = this.textNode;
			this.section = {children:[]};
			this.pushParagraph(false);
			this.pushText(false);
			await this.readContext(txt, context);
			var res = this.paragraph;
			if(sec){
				this.pushParagraph();
				res = this.section.children
			}
			this.section = thisSection;
			this.paragraph = thisParagraph;
			this.textNode = thisText;
			return res;
		}
		this.readContext = async function(txt, context){
			this.actualContext = context;
			var inComment = false;
			var textNode = "",
			inMath = false,
			longMath = false,
			displayMath = false,
			mathRun = "";
			for(var i=0;i<txt.length;i++){
				var c = txt[i];
				var sub = txt.substring(i),
				code = txt.charCodeAt(i);
				if(inComment){
					if(c == "\n"){inComment = false;}
					continue;
				}
				if(c == "%"){
					inComment = true;continue;
				}
				if(inMath){
					if(c == "$"){
						if(sub[1] == "$" && displayMath){
							inMath = false;
							i++
						}
						else if(sub[1] != "$" && !displayMath){
							inMath = false;
						}
						else{mathRun += c;continue;}
					}
					else if(c == "\\"){
						i++;
						if(longMath && displayMath && sub[1] == "]"){
							inMath = false;
						}
						if(longMath && !displayMath && sub[1] == ")"){
							inMath = false;
						}
						else{
							mathRun += c + sub[1];continue;
						}
					}
					if(inMath){
						mathRun += c;
					}
					else{
						this.printMath(mathRun, displayMath);
						mathRun = "";
					}
					continue;
				}
				else if(c == "$"){
					inMath = true;
					longMath = false;
					displayMath = false;
					if(sub[1] == "$"){
						displayMath = true;
						i++;
					}
					continue;
				}
				else if(c == "\\" && (sub[1] == "[" || sub[1] == "(")){
					inMath = true;
					longMath = true;
					displayMath = sub[1] == "[";
					i++;
					continue;
				}
				if(c == "^" && txt[i+1] == "^" && txt[i+2]){
					i+=2;
					c = "^^"+txt[i+2];
					if(c == "^^M"){c = "\n"}
				}
				if(c == "\\"){
					if(sub.lastIndexOf("\\begin{",0) === 0){
						var env = envirn(sub);
						i += env.full.length - 1;
						if(env.name == "tikzpicture"){
							var tikz = await this.getTikz(env.full);
							if(tikz){
								this.pushText();
								this.paragraph.children.push(new docx.ImageRun({
									data: tikz[0],
									transformation: {
									       width: tikz[1],
 									       height: tikz[2]
    									}
								}));
							}
						}
						else if(["table","tabular", "tabular*","longtable","tabularx","tabulary",
							"longtblr","tblr","xtabular","supertabular","NiceTabular","NiceTabular*",
							"NiceTabularX"].indexOf(env.name) > -1){
								await this.processTable(table.latex.importTable(env.full))
						}
						else if(env.name == "align"){
							var eq = await this.getMathSplit("\\require{ams}"+env.full, env.name, env.content, true);
							for(var j=0;j<eq.length;j++){
								if(j > 0){eq[j].top = 0}
								if(j < eq.length - 1){eq[j].bottom = 0}
								this.pushNumberedEquation(eq[j]);
							}
						}
						else if(env.name == "equation"){
							var math = await this.getMath(env.content, true);
							var label = this.getLabel(env.content);
							this.pushNumberedEquation({
								url:math.url,
								height:math.height,
								width:math.width,
								label:label
							});
						}
						else{
							var newContext = new LatexContext(this.actualContext);
							if(env.name == "center"){
								this.actualContext = newContext;
								newContext.set("alignment", docx.AlignmentType.CENTER);
								this.pushParagraph();
							}
							else if(!this.unknownCommands[env.name]){
								this.Log(`Unknow environment '${env.name}'. I continue...`);
								this.unknownCommands[env.name] = true
							}
							await this.readContext(env.content, newContext);
							this.actualContext = this.actualContext;
						}
					}
					else{
						var com = command(sub), name = com.name;
						if(name == "section"){
							this.pushParagraph();
							this.paragraph.heading = docx.HeadingLevel.HEADING_1;
							this.paragraph.keepNext = true;
							await this.readContext(com.args[0], new LatexContext(this.actualContext));
						}
						else if(name == "subsection"){
							this.pushParagraph();
							this.paragraph.heading = docx.HeadingLevel.HEADING_2;
							this.paragraph.keepNext = true;
							await this.readContext(com.args[0], new LatexContext(this.actualContext));
						}
						else if(name == "subsubsection"){
							this.pushParagraph();
							this.paragraph.heading = docx.HeadingLevel.HEADING_3;
							this.paragraph.keepNext = true;
							await this.readContext(com.args[0], new LatexContext(this.actualContext));
						}
						else if(name == "emph"){
							var newContext = new LatexContext(context);
							newContext.set("italic", !this.actualContext.get("italic"));
							this.actualContext = newContext;
							this.pushText();
							await this.readContext(com.args[0], newContext);
							this.actualContext = context;
							this.pushText();
						}
						else if(name == "textit" || name == "textsl"){
							var newContext = new LatexContext(this.actualContext);
							newContext.set("italic", true);
							this.actualContext = newContext;
							this.pushText();
							await this.readContext(com.args[0], newContext);
							this.actualContext = this.actualContext.parentContext;
							this.pushText();
						}
						else if(name == "textbf"){
							var newContext = new LatexContext(context);
							newContext.set("bold", true);
							this.actualContext = newContext;
							this.pushText();
							await this.readContext(com.args[0], newContext);
							this.actualContext = context;
							this.pushText();
						}
						else if(name == "par"){
							this.pushParagraph();
						}
						else if(name == "bfseries"){
							this.actualContext.set("bold", true);
							this.pushText();
						}
						else if(name == "textcolor"){
							var newContext = new LatexContext(context);
							var color = xcolor(com.args[0], com.options[0]) || [0,0,0];
							newContext.set("color", toHex(color));
							this.actualContext = newContext;
							this.pushText();
							await this.readContext(com.args[1], newContext);
							this.actualContext = context;
							this.pushText();
						}
						else if(name == "color"){
							var color = xcolor(com.args[0], com.options[0]) || [0,0,0];
							this.actualContext.set("color", toHex(color));
							this.pushText();
						}
						else if(name == "textsc"){
							var newContext = new LatexContext(context);
							newContext.set("smallcaps", true);
							this.actualContext = newContext;
							this.pushText();
							await this.readContext(com.args[0], newContext);
							this.actualContext = context;
							this.pushText();
						}
						else if(name == "scshape"){
							this.actualContext.set("smallcaps", true);
							this.pushText();
						}
						else if(name == "label"){
							if(!this.actualContext.get("footnote")){
								this.pushText();
								this.paragraph.children.push(new docx.Bookmark({
            								id: com.args[0],
            								children: [
                								new docx.TextRun(""),
        								],
        							}));
							}
						}
						else if(name == "bf"){
							this.actualContext.set("bold", true);
							this.actualContext.set("italic", false);
							this.pushText();
						}
						else if(name == "cite"){
							var split = com.args[0].split(/\s*,\s*/g);
							var cite = "["
							for(var j=0;j<split.length;j++){
								if(j>0){cite+=", "}
								bbl:for(var h=0;h<this.doc.bibliography.bbl.length;h++){
									if(this.doc.bibliography.bbl[h].label == split[j]){
										cite += this.doc.bibliography.bbl[h].index;
										break bbl;
									}
								}
							}
							cite += "]";
							this.textNode.text += cite;
						}
						else if(name == "noindent"){
							this.paragraph.indent.firstLine=0;
						}
						else if(name == "multicolumn"){
							var newContext = new LatexContext(this.actualContext);
							this.actualContext = newContext;
							this.pushText();
							await this.readContext(com.args[2], newContext);
							this.actualContext = this.actualContext.parentContext;
						}
						else if(name == "\\" || name == "newline"){
							this.pushParagraph();
							this.paragraph.indent.firstLine=0;
						}
						else if(name == "uline" || name == "underline"){
							var newContext = new LatexContext(this.actualContext);
							newContext.set("underline", {});
							this.actualContext = newContext;
							this.pushText();
							await this.readContext(com.args[0], newContext);
							this.actualContext = this.actualContext.parentContext;
							this.pushText();
						}
						else if(name == "ul"){
							this.actualContext.set("underline", {});
							this.pushText();
						}
						else if(name == "url"){
							this.pushText();
							this.paragraph.children.push(new docx.ExternalHyperlink({
									children:[
										new docx.TextRun({
											text:this.breakLink(com.args[0]),
											style:"Hyperlink"
										})
									],
									link:com.args[0]
								})
							);
						}
						else if(name == "itshape"){
							this.actualContext.set("italic", true);
							this.pushText();
						}
						else if(name == "it"){
							this.actualContext.set("bold", false);
							this.actualContext.set("italic", true);
							this.pushText();
						}
						else if(this.doc.fontSize[name]){
							this.actualContext.set("fontSize", this.doc.fontSize[name]*2);
							this.pushText();
						}
						else if(name == "ref"){
							this.pushText();
							if(this.doc.footnoteLabels[com.args[0]]){
								this.paragraph.children.push(new docx.SimpleField("NOTEREF "+com.args[0]));
							}
							else{
								this.paragraph.children.push(new docx.SimpleField("REF "+com.args[0]));
							}
						}
						else if(name == "title"){
							this.textNode.text += this.doc.title || "";
						}
						else if(name == "author"){
							this.textNode.text += this.doc.author || "";
						}
						else if(name == "includegraphics"){
							await this.includeGraphic(com);
						}
						else if(name == "date"){
							if(this.doc.date){
								this.textNode.text += this.doc.date;
							}
							else{
								this.pushField("CREATEDATE  \\@ \"MMMM d, yyyy\" \\* MERGEFORMAT");
							}
						}
						else if(name == "pageref"){
							this.pushText();
							this.paragraph.children.push(new docx.PageReference(com.args[0]));
						}
						else if(name == "eqref"){
							this.textNode.text += "(";
							this.pushText();
							this.paragraph.children.push(new docx.SimpleField("REF "+com.args[0]));
							this.textNode.text += ")";
						}
						else if(name == "def" || name == "gdef"){
							definedCommands[com.args[0].substring(1)] = {
								name: com.args[0].substring(1),
								definition: com.args[1],
								expansion: com.args[2]
							}
						}
						else if(name == "," || name == "thinspace"){
							this.textNode.text += "\u202F";
						}
						else if(name == "#" || name == "&" || name == "_" || name == "$" || name == "@" || name == "%"){
							this.textNode.text += name;
						}
						else if(name == "footnote"){
							var newContext = new LatexContext(this.actualContext);
							this.pushText();
							this.actualContext = newContext;
							this.actualContext.set("footnote",true);
							this.actualContext.set("indent",0);
							this.actualContext.set("fontSize", this.doc.fontSize.footnotesize*2);
console.log(com.args[0]);
							this.footnotes[this.footnotesI] = {children:[new docx.Paragraph(
								await this.readSubContext(com.args[0], newContext))]};
							this.actualContext = context;
							var footnote = new docx.FootnoteReferenceRun(this.footnotesI);
							var label = /\\label ?\{/.exec(com.args[0]);
							if(label){
								label = command(com.args[0].substring(label.index))
								if(label && label.args[0]){
									footnote = new docx.Bookmark({
            									id: label.args[0],
            									children: [
                									footnote,
        									],
        								})
								}
							}
							this.paragraph.children.push(footnote);
							this.footnotesI++;
						}
						else if(definedCommands[name]){
							var def = definedCommands[name];
							var exp = "";
							if("expansion" in def){
								var inComment = false
								inDef: for(var j=0;j<def.expansion.length;j++){
									var d = def.expansion[j];
									if(d == "\\"){
										exp += d + def.expansion[j+1];
										j++;
									}
									else if(d == "#"){
										exp += com.args[+def.expansion[j+1]-1];
										j++;
									}
									else{
										exp += d;
									}
								}
								txt = txt.substring(0, i) + exp + txt.substring(i+com.full.length);
								i--;continue;
							}
						}
						else if(name == "marginpar"){
							this.pushParagraph();
							this.paragraph.frame = {
								position: {
							            x: this.lengthToDXA("8.5in") - this.lengthToDXA(this.actualContext.get("rightmargin")),
							            y: 0,
							        },
							        width: this.lengthToDXA(this.actualContext.get("rightmargin")),
							        height: 0,
						        	anchor: {
						        	    horizontal: docx.FrameAnchorType.PAGE,
						        	    vertical: docx.FrameAnchorType.TEXT,
							        },
							        alignment: {
							            x: docx.HorizontalPositionAlign.JUSTIFY,
							            y: docx.VerticalPositionAlign.TOP,
							        }
							}
							this.textNode.text += "Margin note";
							this.pushParagraph();
						}
						else{
							if(!this.unknownCommands[name]){
								this.Log(`Unknown command '${name}'. I continue...`);
								this.unknownCommands[name] = true;
							}
							console.dir(com);
						}
						i+=com.full.length-1;
						this.actualContext = context;
					}
				}
				else if(c == "\n" && txt[i+1] == "\n"){
					// New paragraph;
					this.pushParagraph();
					i++;
				}
				else if(c == "{"){
					this.actualContext = new LatexContext(this.actualContext);
				}
				else if(c == "}"){
					this.pushText();
					this.actualContext = this.actualContext.parentContext;
				}
				else if(/^\s+$/.test(c)){
					if(this.textNode.text.length == 0 || /^\S+$/.test(this.textNode.text[this.textNode.text.length-1])){
						this.textNode.text += c;
					}
				}
				else if((code >= 48 && code <= 57) || (code >= 65 && code <=90) || (code >= 97 && code <= 122)){ //alphanumeric
					this.textNode.text += c;
				}
				else{
					var char = this.convertToChar(c, sub);
					this.textNode.text += char[0];
					i+= char[1]-1;
				}
			}
		}
		this.calc = function(txt){
			// TODO: improve
			if(txt == "\\hsize" || txt == "\\textwidth" || txt == "\\columnwidth" || txt == "\\linewidth"){
				return this.actualContext.get("textwidth");
			}
			return txt;
		}
		this.includeGraphic = async function(com){
			var file = null;
			var ext = "";
			if(/\.[a-zA-Z]+$/.test(com.args[0])){
				file = await this.getFileByURL(com.args[0], false, false, true)
				ext = /[a-zA-Z]+$/.exec(com.args[0])[0].toLowerCase();
			}
			else{
				file = await this.getFileByURL(com.args[0], "png", false, true)
				ext = "png"
				if(!file){
					file = await this.getFileByURL(com.args[0], "jpg", false, true)
					ext = "jpg";
				}
				if(!file){
					file = await this.getFileByURL(com.args[0], "jpeg", false, true)
					ext = "jpg"
				}
			}
			if(!file){
				this.Log(`Can't find file ${com.args[0]}`);return;
			}
			if(ext != "png" && ext != "jpg"){
				this.Log(`File extension ${ext} for images is not supported (yet).`)
			}
			var options = this.keyval(com.options[0]||"");
			var _this = this;
			return new Promise(function(resolve, reject){
				var reader = new FileReader();
				reader.onload = function(){
					var img = document.createElement("img");
					img.onerror = function(e){reject(e)}
					img.onload = function(){
						var width = img.width;	
						var height = img.height
						if("scale" in options){
							width = width * parseFloat(options.scale,10) || width;
							height = height * parseFloat(options.scale,10) || height
						}
						_this.paragraph.children.push(new docx.ImageRun({
									data: reader.result,
									transformation: {
									       width: width,
 									       height: height
    									}
								}));
						resolve();
					}
					img.src = reader.result;
				}
				reader.onerror = function(e){reject(e)}
				reader.readAsDataURL(file);
			});
			
		}
		this.keyval = function(txt){
			var o = {};
			txt += ",";
			var inComment = false, inArg = 0,actual = "",inName=true,name="";
			for(var i=0;i<txt.length;i++){
				var c = txt[i];
				if(inComment){
					if(c == "\n"){inComment = false}
					continue;
				}
				if(c == "\\"){
					actual += c + txt[i+1];i++;
				}
				else if(c == "%"){inComment = true}
				else if(c == "{"){inArg++;actual+=c;}
				else if(c == "}"){inArg--;actual+=c;}
				else if(c == "=" && inName && inArg == 0){inArg = 0,inName = false, name = actual, actual = ""}
				else if(c == "," && inArg == 0){
					if(inName && actual){
						o[actual.trim()] = true;
					}
					else if(name){
						o[name.trim()] = actual.trim();
					}
					actual = "";name = "";
				}
				else{
					actual += c;
				}
			}
			return o;
		}
		this.convertToChar = function(c, sub){
			if(c == "`"){
				if(sub[1] == "`"){
					return ["\u201C",2]
				}
				else{
					return ["\u2018",1]
				}
			}
			else if(c == "'"){
				if(sub[1] == "'"){
					return ["\u201D",2]
				}
				else{
					return ["\u2019",1]
				}
			}
			else if(c == "<" && sub[1] == "<"){
				return ["\u00AB",2]
			}
			else if(c == ">" && sub[1] == ">"){
				return ["\u00BB",2]
			}
			else if(c == "-" && sub[1] == "-" && sub[2] == "-"){
				return ["\u2014",3]
			}
			else if(c == "-" && sub[1] == "-"){
				return ["\u2013",2]
			}
			else if(c == "~"){
				return ["\u00A0",1]
			}
			else{
				return [c,1]
			}
		}
		var paper = {
			"a0paper":["84.1cm","118.9cm"],
			"a1paper":["59.4cm","84.1cm"],
			"a2paper":["42cm","59.4cm"],
			"a3paper":["29.7cm","42cm"],
			"a4paper":["21cm","29.7cm"],
			"a5paper":["14.8cm","21cm"],
			"a6paper":["10.5cm","14.8cm"],
			"b0paper":["100cm","141.4cm"],
			"b1paper":["70.7cm","100cm"],
			"b2paper":["50cm","70.7cm"],
			"b3paper":["35.3cm","50cm"],
			"b4paper":["25cm","35.3cm"],
			"b5paper":["17.6cm","25cm"],
			"b6paper":["12.5cm","17.6cm"],
			"c0paper":["91.7cm","129.7cm"],
			"c1paper":["64.8cm","91.7cm"],
			"c2paper":["45.8cm","64.8cm"],
			"c3paper":["32.4cm","45.8cm"],
			"c4paper":["22.9cm","32.4cm"],
			"c5paper":["16.2cm","22.9cm"],
			"c6paper":["11.4cm","16.2cm"],
			"b0j":["103cm","145.6cm"],
			"b1j":["72.8cm","103cm"],
			"b2j":["51.5cm","72.8cm"],
			"b3j":["36.4cm","51.5cm"],
			"b4j":["25.7cm","36.4cm"],
			"b5j":["18.2cm","25.7cm"],
			"b6j":["12.8cm","18.2cm"],
			"ansiapaper":["8.5in","11in"],
			"ansibpaper":["11in","17in"],
			"ansicpaper":["17in","22in"],
			"ansidpaper":["22in","34in"],
			"ansiepaper":["34in","44in"],
			"letterpaper":["8.5in","11in"],
			"legalpaper":["8.5in","14in"],
			"executivepaper":["7.25in","10.5in"],
			"screen":["22.5cm","18cm"]
		}
		var fontSize = {
			"10pt":{
				"tiny":5,
				"scriptsize":7,
				"footnotesize":8,
				"small":9,
				"normalsize":10,
				"large":12,
				"Large":14.4,
				"LARGE":17.28,
				"huge":20.74,
				"Huge":24.88
			},
			"11pt":{
				"tiny":6,
				"scriptsize":8,
				"footnotesize":9,
				"small":10,
				"normalsize":10.95,
				"large":12,
				"Large":14.4,
				"LARGE":17.28,
				"huge":20.74,
				"Huge":24.88
			},
			"12pt":{
				"tiny":6,
				"scriptsize":8,
				"footnotesize":10,
				"small":10.95,
				"normalsize":12,
				"large":14.4,
				"Large":17.28,
				"LARGE":20.74,
				"huge":24.88,
				"Huge":24.88
			}
		}
		this.version = "0.1a"
		var _text2docx = async function(){
			var txt = this.source;
			this.Log("This is latex2word.js version "+this.version+", processing locally, on your computer '"+
			this.file.name+"'. No data is sent to a server.") 
			var doc = this.getDocument(this.source);
			this.doc = doc;
			this.unknownCommands = {}
			this.doc.footnoteLabels = {};
			this.doc.bibliography = {};
			this.doc.fontSize = fontSize["10pt"];
			this.Global = new LatexContext();
			this.Global.set("indent", this.lengthToDXA("15pt"));
			this.Global.set("alignment", docx.AlignmentType.JUSTIFIED);
			this.Global.set("pagewidth", this.lengthToDXA("8.5in"));
			this.Global.set("pageheight", this.lengthToDXA("11in"));
			this.Global.set("marginparsep", this.lengthToDXA("11pt"));
			this.Global.set("marginparwidth", this.lengthToDXA("11pt"));
			this.Global.set("leftmargin", this.lengthToDXA("1in")+this.lengthToDXA("62pt"));
			this.Global.set("rightmargin", this.lengthToDXA("1in")+this.lengthToDXA("76pt"));

			// Change to default margin
			this.Global.set("leftmargin", this.lengthToDXA("1in"));
			this.Global.set("rightmargin", this.lengthToDXA("1in"));

			this.Global.set("gutter", 10);

			// Analyze documentClass options
			if(this.doc.documentClass.options[0]){
				var opts = this.keyval(this.doc.documentClass.options[0]);
				// paper
				for(var i in opts){
					if(opts.hasOwnProperty(i)){
						if(paper[i]){
							this.Global.set("pagewidth", this.lengthToDXA(paper[i][0]));
							this.Global.set("pageheight", this.lengthToDXA(paper[i][1]));
						}
						else if(fontSize[i]){
							this.doc.fontSize = fontSize[i]
						}
					}
				}
			}
			this.Global.set("fontSize", this.doc.fontSize.normalsize*2);
			this.Global.set("textwidth", this.Global.get("pagewidth")
				-this.Global.get("leftmargin")
				-this.Global.get("rightmargin")
				-2*this.Global.get("gutter")
			);
			this.actualContext = this.Global;
			this.sections = [];
			this.footnotes = {};
			this.footnotesI = 1;
			this.pushSection();
			this.pushParagraph();
			this.textNode = {text:""}

			await this.firstRun(this.doc.document, this.Global) // first run;
	
			// run BibTeX
			this.doc.bibliography.bbl = [];
			var bbl = await this.getFileByURL(this.file.name.replace(/\..+$/,""),"bbl")
			if(bbl){
				this.readBbl(bbl);
				console.log(this.doc.bibliography.bbl);
			}
			await this.readContext(this.doc.document, this.Global);
			this.pushSection();
			console.dir(this.sections);
			var doc = new docx.Document({
				footnotes:this.footnotes,
				sections:this.sections
			});
			docx.Packer.toBase64String(doc).then((str) => {
				document.getElementById("download-link").href = "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,"+ str;
				document.getElementById("download-link").download = this.file.name.replace(/\..+$/,"")+".docx";
				this.Log("Document created successfully");
  			});
		}.bind(this);
	})();
	window.latex2word = latex2word;


})();
(function() {
 
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;
    
    function toAbsURL(url) {
        var a = document.createElement('a');
        a.href = url;
        return a.href;
    }

    function printVideoInfo(config) {
    	//find video in current page
    	var findSource = (printVideoInfoCommon(config) != null);
    	var frames = document.getElementsByTagName("iframe");
    	

    	if(!findSource && frames && config.isOpenTab){
    		var cnt = 0;
    		for(var i = 0; i < frames.length; i++){
    			var url = frames[i].getAttribute("src");
                if(url.substr(0,2) == "//"){
                    url = window.location.protocol + url;
                }
    			if(url.substr(0,4) == "http" ) {
    				cnt ++;
    				browser.runtime.sendMessage({
        	            "action": "openTab",
        	            "value": {
        	                "url": url,
        	                "active": false
        	            }
        	        });
    			}
    			if(cnt >= config.maxTabNum){
    				break;
    			}
    		}
    	}
    	if(!findSource && config.isAlert) {
    		var tips = "Não foi encontrado video!";
    		if(frames && frames.length > 0){
    			tips += "\r\nLocalizando nas páginas internas..."
    		}
    		alert(tips);
    	}
    }
    
    function printVideoInfoCommon(config) {
    	var video = document.getElementsByTagName("video");
    	var urlLink;
    	for (var i = 0; i < video.length; i++) {
    		urlLink = video[i].getAttribute("src");
    		if (urlLink == null) {
    			try {
    				urlLink = video[i].getElementsByTagName("source")[0].getAttribute("src");
    			} catch(err) {}
    			
    		}
    		if (urlLink != null) {
    			urlLink = toAbsURL(urlLink);
    			console.log(urlLink);
    			console.log(config.isCopy);
    			if (config.isCopy) {
    				copyToClipboard(urlLink);
    			}
    			if (config.isAlert) {
    				alert("O download será iniciado, o link é:\r\n" + urlLink);
    			}
    			if (config.isDown) {
    				downloadFile(urlLink);
    			}
    			break;
    		}
    	}
    	return urlLink;
    }

    function downloadFile(url) {
        browser.runtime.sendMessage({
            "action": "download",
            "value": {
                "url": url
            }
        });
    }

    function copyToClipboard(text) {
        var textArea = document.createElement("textarea");
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            var successful = document.execCommand("Copy");
        } catch(err) {
            // alert("Fail to Copy");
        }
        document.body.removeChild(textArea);
    }


    browser.runtime.onMessage.addListener((message) =>{
        if(message.command === "printVideoInfo") {
            // console.log(message.config);
            printVideoInfo(message.config);
        };
    });
    // printVideoInfo();
})();
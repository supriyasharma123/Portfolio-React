const response = [
    {
      status: 'active',
      type: 'editEle',
      selectorPath: '//div[@id=\"root\"]/nav[1]/div[1]/a[1]',
      applicableOnDevice: 'all',
      selectorType: 'fullXPath',
      properties: {
        text: 'DMR',
        media: null,
        href: '/',
        alt: null
      },
      cssProperties: {
        fontSize: '24px',
        fontWeight: '400'
      }
    }
  ]
    
    const currentUrl = window.location.href;
    const currentDomain = window.location.host;
    const currentBaseUrl =
      window.location.origin + "/" + window.location.pathname.split("/")[1];
    const visitorDetails = {};
    const visitCount = {};
    const events = [];
    const campaignDetails = {};
    const sessionDetails = {};
    const experience = {};
    visitorDetails.locationDetails = {};
    let experienceId = null;
    const isRequestFromFibrEditor = determineRequestSourceIsEditor();
    const API_URL = "https://staging-api.fibr.shop";
    
    ///////////// Execution starts here /////////////
    init();
    ///////////// Execution ends here /////////////
    
    function init() {
      applyChanges(1)
      if (isRequestFromFibrEditor) {
        getExperienceData(applyChanges);
      } else {
        getRequestParameters(applyChanges);
      }
    }
    
    function getRequestParameters(applyChanges) {
      /** Reading/Injecting cookies starts here */
      var myCookies = getCookies();
      console.log("Fpt sdk myCookies" + JSON.stringify(myCookies));
    
      visitorDetails.visitorId = myCookies._fibrId;
      if (visitorDetails.visitorId == null) {
        visitorDetails.visitorId = generateFibrId();
        setCookie("_fibrId=" + visitorDetails.visitorId + ";", 20);
      }
      visitCount.domainVisitCount = myCookies["_fibr_" + currentDomain] ?? 0;
      console.log("Fpt sdk domainVisitCount", visitCount.domainVisitCount);
      visitCount.domainVisitCount = parseInt(visitCount.domainVisitCount) + 1;
      setCookie(
        "_fibr_" + currentDomain + "=" + visitCount.domainVisitCount + ";",
        20
      );
    
      visitCount.pageVisitCount = myCookies["_fibr_" + currentUrl] ?? 0;
      console.log("Fpt sdk urlVisitCount", visitCount.pageVisitCount);
      visitCount.pageVisitCount = parseInt(visitCount.pageVisitCount) + 1;
      setCookie("_fibr_" + currentUrl + "=" + visitCount.pageVisitCount + ";", 20);
    
      visitCount.baseUrlVisitCount = myCookies["_fibr_" + currentBaseUrl] ?? 0;
      console.log("Fpt sdk baseUrlVisitCount", visitCount.baseUrlVisitCount);
      visitCount.baseUrlVisitCount = parseInt(visitCount.baseUrlVisitCount) + 1;
      setCookie(
        "_fibr_" + currentBaseUrl + "=" + visitCount.baseUrlVisitCount + ";",
        20
      );
      console.log(
        "Fpt sdk visitCount.baseUrlVisitCount",
        visitCount.baseUrlVisitCount
      );
    
      /** Reading/Injecting cookies ends here */
    
      /** Reading Visitor's Information starts here */
      visitorDetails.os = getOS();
      console.log("Fpt sdk visitorDetails.os", visitorDetails.os);
      visitorDetails.device = getDeviceType();
      getVisitorIp();
      visitorDetails.languages = getLanguages();
      visitorDetails.browser = getBrowser();
      sessionDetails.sessionId = handleSession();
      getGeoLocation();
      console.log("Fpt sdk visitorDetails", visitorDetails);
      console.log("Fpt sdk visitCount", visitCount);
      console.log("Fpt sdk campaignDetails", campaignDetails);
    }
    
    function applyChanges(pages) {
      console.log("Fpt pages ", pages)
      response.map((changeLog) => {
        console.log("changeLog", changeLog);
        var element = getElementByXpath("/html/body/div/div[1]/div/p");
        //console.log("Supriya element", element);
        if (element == null) return;
    
        console.log("element", element);
    
        element.style.fontSize = changeLog.cssProperties.fontSize
        element.style.fontWeight = changeLog.cssProperties.fontWeight
      
      
        if (changeLog.type == "editEle") {
          if(changeLog.properties.text) {
            updateText(element, changeLog.properties.text);
            console.log("text changes", element.textContent)
          }
          if(changeLog.properties.media || changeLog.properties.alt) {
            updateImage(element, changeLog.properties.media, changeLog.properties.alt);
            console.log("src updated", element)
          }
          if(changeLog.properties.href) {
            element.href = changeLog.properties.href;
            console.log("href changes", element)
          }
        }
      
        if (changeLog.type == "hideEle") {
          hideElement(element);
          console.log("hides element", element)
        }
      
        if (changeLog.type == "appendEle") {
          addElement(element, changeLog.html);
          console.log("ele to be added", changeLog.html)
        }
      
        if (changeLog.type == "editHtml") {
          replaceElement(element, changeLog.html);
          console.log("ele to be edited", changeLog.html)
        }
      });
    }
    /** Processing ChangeLogs Starts */
    
    /** Processing ChangeLogs Ends */
    handleEvents();
    
    /*** Helper Functions to read/set cookies starts here*/
    function setCookie(cookie, exdays) {
      const d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      let expires = "expires=" + d.toUTCString();
      document.cookie = cookie + expires + ";path=/";
    }
    
    function getCookies() {
      var pairs = document.cookie.split(";");
      var cookies = {};
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split("=");
        cookies[(pair[0] + "").trim()] = unescape(pair.slice(1).join("="));
      }
      return cookies;
    }
    
    /*** Helper Functions to read/set cookies ends here*/
    
    /** Helper functions to accomodate ChangeLogs/User Actions starts here */
    function getElementByXpath(path) {
      try {
        console.log("selector", document.evaluate(
            "/html/body/div/div[1]/div/p",
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue)
        return document.evaluate(
          path,
          document,
          null,
          XPathResult.ANY_TYPE,
          null
        ).singleNodeValue;
      } catch (ex) {
        console.log(ex)
        return null;
      }
    }
    
    function getElementBySelector(path) {
      try {
        return document.querySelector(path);
      } catch (ex) {
        return null;
      }
    }
    
    function htmlToElements(html) {
      var template = document.createElement("template");
      template.innerHTML = html;
      return template.content.childNodes.length == 1
        ? template.content.firstChild
        : template.content.childNodes;
    }
    
    function updateText(ele, text) {
      //console.log("Supriya updateText", ele, text);
      ele.textContent = text;
    }
    
    function updateImage(ele, url, alt) {
      console.log("Supriya updateImage", ele, url);
      ele.src = url;
      ele.alt = alt;
    }
    
    function hideElement(ele) {
      //console.log("Supriya hideElement", ele);
      ele.style.display = "none";
    }
    
    function addElement(parentEle, config) {
      //console.log("Supriya addElement", parentEle);
    
      if (config.elementType == "p") {
        const newEle = document.createElement("p");
        newEle.textContent = config.text;
        if (config.position == "Before") {
          const aboveEle = getElementBySelector(config.selector);
          if (aboveEle != null) {
            parentEle.insertBefore(newEle, aboveEle);
          }
        } else {
          parentEle.appendChild(newEle);
        }
      }
    }
    
    function replaceElement(ele, html) {
      var newEle = htmlToElements(html);
      //console.log("Supriya replaceElement", ele, newEle);
      ele.replaceWith(newEle);
    }
    /** Helper functions to accomodate ChangeLogs/User Actions ends here */
    
    /** Helper Misc Funcs starts here */
    function generateFibrId() {
      return (
        "FIBR_" +
        "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
          const r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        })
      );
    }
    
    function getOS() {
      var userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"],
        windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
        iosPlatforms = ["iPhone", "iPad", "iPod"],
        os = null;
    
      if (macosPlatforms.indexOf(platform) !== -1) {
        os = "MacOS";
      } else if (iosPlatforms.indexOf(platform) !== -1) {
        os = "iOS";
      } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = "Windows";
      } else if (/Android/.test(userAgent)) {
        os = "Android";
      } else if (!os && /Linux/.test(platform)) {
        os = "Linux";
      }
      return os;
    }
    
    function getDeviceType() {
      const userAgent = navigator.userAgent.toLowerCase();
    
      var isMobile = /iPhone|Android/i.test(navigator.userAgent);
      const isTablet =
        /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(
          userAgent
        );
    
      if (isMobile) {
        console.log("Mobile");
        return "mobile";
      } else if (isTablet) {
        return "tablet";
      }
      return "desktop";
    }
    
    function getVisitorIp() {
      let ip = null;
      fetch("https://api.ipify.org?format=json")
        .then((response) => response.json())
        .then((data) => {
          console.log("Fpt sdk", data.ip);
          visitorDetails.visitorIp = data.ip;
        });
      return ip;
    }
    
    function getLanguages() {
      return navigator.languages; //"en-US"
      //navigator.languages; //["en-US", "zh-CN", "ja-JP"]
    }
    
    function getBrowser() {
      if (
        (navigator.userAgent.indexOf("Opera") ||
          navigator.userAgent.indexOf("OPR")) != -1
      ) {
        return "opera";
      } else if (navigator.userAgent.indexOf("Edg") != -1) {
        return "edge";
      } else if (navigator.userAgent.indexOf("Chrome") != -1) {
        return "chrome";
      } else if (navigator.userAgent.indexOf("Safari") != -1) {
        return "safari";
      } else if (navigator.userAgent.indexOf("Firefox") != -1) {
        return "firefox";
      } else if (
        navigator.userAgent.indexOf("MSIE") != -1 ||
        !!document.documentMode == true
      ) {
        return "ie";
      } else {
        return null;
      }
    }
    
    function handleSession() {
      //TODO: getBrowser
      return "";
    }
    
    async function getGeoLocation() {
      if (navigator.geolocation) {
        console.log("Fpt sdk navigator.geolocation", navigator.geolocation);
        navigator.geolocation.getCurrentPosition(getPosition);
      } else {
        // document.getElementById("demo").innerHTML =
        // "Geolocation is not supported by this browser.";
      }
    
      function getPosition(position) {
        visitorDetails.locationDetails.lat = position.coords.latitude;
        visitorDetails.locationDetails.long = position.coords.longitude;
        getPagesFromResolver(applyChanges);
        // console.log("lat", position.coords.latitude);
        // console.log("long", position.coords.longitude);
      }
    }
    
    async function handleEvents() {
      fetch(
        "https://nq8z0b1nxl.execute-api.us-east-1.amazonaws.com/event-handler/event",
        {
          // Adding method type
          method: "POST",
    
          // Adding body or contents to send
          body: JSON.stringify({
            campaignDetails: campaignDetails,
            visitCount: visitCount,
            sessionDetails: sessionDetails,
            visitorDetails: visitorDetails,
            events: events,
          }),
    
          // Adding headers to the request
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        }
      )
        // Converting to JSON
        .then((response) => response.json())
    
        // Displaying results to console
        .then((json) => console.log(json));
    }
    
    async function getPagesFromResolver(applyChanges) {
      fetch(
        "https://tpyr8vnsx1.execute-api.ap-south-1.amazonaws.com/resolver/experience/page",
        {
          // Adding method type
          method: "POST",
    
          // Adding body or contents to send
          body: JSON.stringify({
            url: currentUrl,
            domain: currentDomain,
            visitCount: visitCount,
            sessionDetails: sessionDetails,
            visitorDetails: visitorDetails,
          }),
    
          // Adding headers to the request
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        }
      )
        .then((response) => response.json())
    
        .then((json) => {
          console.log("Fpt sdk", json);
          response = json.data;
          experience = response.experience;
          enrichLocationDetails(response.locationDetails);
          applyChanges(response.pages);
        });
    }
    
    function enrichLocationDetails(res) {
      visitorDetails.locationDetails.country = res.country;
      visitorDetails.locationDetails.city = res.city;
      visitorDetails.locationDetails.province = res.province;
      visitorDetails.locationDetails.timezone = res.timezone;
    }
    
    function enrichCampaignetails(res) {
      visitorDetails.locationDetails.country = res.country;
      visitorDetails.locationDetails.city = res.city;
      visitorDetails.locationDetails.province = res.province;
      visitorDetails.locationDetails.timezone = res.timezone;
    }
    
    function determineRequestSourceIsEditor() {
      const urlParams = new URLSearchParams(window.location.search);
      experienceId = urlParams.get("expId");
      console.log("Fpt experienceId", experienceId);
      return experienceId != null;
    }
    
    async function getExperienceData() {
      fetch(`${API_URL}/client/changelogs/get/${experienceId}`, {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        .then((response) => response.json())
    
        .then((json) => {
          console.log("Fpt from workflow", json);
          response = json.data;
          applyChanges(response.pages);
        });
    }
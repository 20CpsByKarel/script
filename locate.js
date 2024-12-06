document.addEventListener("DOMContentLoaded", function() {
    const key = 'ipified';
    const val = 'true';
    const ses = sessionStorage.getItem(key);
    console.log('SESH: ' + ses);
    console.log(upgates.language);
    if (!ses) {
        console.log("Running ipify");

        fetch("https://api.ipify.org?format=json")
            .then(response => response.json())
            .then(data => {
                var ipAddress = data.ip;
                console.log('IP Address: ' + ipAddress);

                fetch("https://ipinfo.io/" + ipAddress + "/json")
                    .then(response => response.json())
                    .then(data => {
                        var country = data.country;
                        console.log("Země: " + country);

                        var countryCodes = {
                            CZ: "cz",
                            EN: "en"
                        };

                        var countryCode = countryCodes[country] || "en";
                        if (!countryCode) {
                            countryCode = "en";
                        }

                        if (countryCode === "cz") {
                            const userLang = navigator.language || navigator.userLanguage;
                            console.log('User Language: ' + userLang);
                            if (userLang.startsWith("cs") || userLang.startsWith("sk")) {
                                countryCode = "cz";
                            } else {
                                countryCode = "en";
                            }
                        } else {
                            countryCode = "tl";
                        }
                        const cc = upgates.language;
                        if(cc = "cs"){
                            cc = "cz";
                        }
                        console.log('Country Code: ' + countryCode);

                        // Otevře rozbalovací menu
                        const toggleElement = document.querySelector('.navbar-toggler.dropdown-toggle');
                        if(cc != countryCode)){
                           if (toggleElement) {
                            toggleElement.click();

                            // Zpoždění pro zajištění načtení rozbalovacího menu
                            setTimeout(() => {
                                const dropdownMenu = document.querySelector('.dropdown-menu._hdr_lngl');
                                const aElement = dropdownMenu ? dropdownMenu.querySelector('a.flag-' + countryCode) : null;
                                console.log('aElement: ', aElement);

                                if (aElement) {
                                    aElement.click();
                                    sessionStorage.setItem(key, val);
                                } else {
                                    console.log("Country code not found in dropdown menu");
                                }
                            }, 500); // 500 ms zpoždění
                        } else {
                            console.log("Toggle element not found");
                        }
                        }
                        
                    })
                    .catch(() => {
                        console.log("CHYBA při získávání země");
                    });
            })
            .catch(() => {
                console.log("CHYBA při získávání IP adresy");
            });
    } else {
        console.log("Skipping language auto-selection: already successfully run or not Czech page");
    }
});

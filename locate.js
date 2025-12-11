document.addEventListener("DOMContentLoaded", function() {
    const key = 'ipified';
    const val = 'true';
    const dismissedKey = 'langRedirectDismissed';
    const ses = sessionStorage.getItem(key);
    const dismissed = sessionStorage.getItem(dismissedKey);
    
    console.log('SESH: ' + ses);
    console.log(upgates.language);
    
    if (!ses && !dismissed) {
        console.log("Running ipify");
        fetch("https://api.ipify.org?format=json")
            .then(response => response.json())
            .then(data => {
                var ipAddress = data.ip;
                console.log('IP Address: ' + ipAddress);
                console.log("TEST");
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
                        
                        let cc = upgates.language;
                        if(cc == "cs"){
                            cc = "cz";
                        }
                        
                        console.log("TEST");
                        console.log('Country Code: ' + countryCode);
                        
                        // Pokud se jazyky liší, zobrazíme popup
                        if(cc != countryCode){
                            showLanguagePopup(countryCode, cc, key, val, dismissedKey);
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
        console.log("Skipping language auto-selection: already successfully run or dismissed");
    }
});

function showLanguagePopup(targetLang, currentLang, key, val, dismissedKey) {
    // Texty pro různé jazyky
    const texts = {
        cz: {
            title: "Změna jazyka",
            message: "Zjistili jsme, že preferujete češtinu.<br>Pro správnou funkčnost webu doporučujeme změnit verzi.<br>Přejete si přepnout na českou verzi stránek?",
            confirm: "Ano, přepnout",
            cancel: "Ne, zůstat zde"
        },
        en: {
            title: "Language Change",
            message: "We detected that you prefer English.<br>For proper website functionality, we recommend changing the version.<br>Would you like to switch to the English version?",
            confirm: "Yes, switch",
            cancel: "No, stay here"
        },
        tl: {
            title: "Language Change",
            message: "We detected your language preference.<br>For proper website functionality, we recommend changing the version.<br>Would you like to switch to a different language version?",
            confirm: "Yes, switch",
            cancel: "No, stay here"
        }
    };
    
    const t = texts[targetLang] || texts.en;
    
    // Vytvoření overlay
    const overlay = document.createElement('div');
    overlay.id = 'lang-popup-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    // Vytvoření popup dialogu
    const popup = document.createElement('div');
    popup.id = 'lang-popup';
    popup.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
        text-align: center;
        animation: slideIn 0.3s ease;
    `;
    
    popup.innerHTML = `
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            #lang-popup h3 {
                margin: 0 0 15px 0;
                color: #333;
                font-size: 1.5em;
            }
            #lang-popup p {
                margin: 0 0 25px 0;
                color: #666;
                line-height: 1.5;
            }
            #lang-popup .btn-container {
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: wrap;
            }
            #lang-popup button {
                padding: 12px 24px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 1em;
                transition: all 0.2s ease;
            }
            #lang-popup .btn-confirm {
                background: #007bff;
                color: white;
            }
            #lang-popup .btn-confirm:hover {
                background: #0056b3;
            }
            #lang-popup .btn-cancel {
                background: #e9ecef;
                color: #333;
            }
            #lang-popup .btn-cancel:hover {
                background: #dee2e6;
            }
        </style>
        <h3>🌐 ${t.title}</h3>
        <p>${t.message}</p>
        <div class="btn-container">
            <button class="btn-confirm" id="lang-popup-confirm">${t.confirm}</button>
            <button class="btn-cancel" id="lang-popup-cancel">${t.cancel}</button>
        </div>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Event listener pro potvrzení
    document.getElementById('lang-popup-confirm').addEventListener('click', function() {
        overlay.remove();
        
        // Původní logika pro přepnutí jazyka
        const toggleElement = document.querySelector('.navbar-toggler.dropdown-toggle');
        if (toggleElement) {
            toggleElement.click();
            setTimeout(() => {
                const dropdownMenu = document.querySelector('.dropdown-menu._hdr_lngl');
                const aElement = dropdownMenu ? dropdownMenu.querySelector('a.flag-' + targetLang) : null;
                console.log('aElement: ', aElement);
                if (aElement) {
                    aElement.click();
                    sessionStorage.setItem(key, val);
                } else {
                    console.log("Country code not found in dropdown menu");
                }
            }, 500);
        } else {
            console.log("Toggle element not found");
        }
    });
    
    // Event listener pro zrušení
    document.getElementById('lang-popup-cancel').addEventListener('click', function() {
        overlay.remove();
        sessionStorage.setItem(dismissedKey, 'true');
    });
    
    // Zavření při kliknutí mimo popup
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.remove();
            sessionStorage.setItem(dismissedKey, 'true');
        }
    });
}

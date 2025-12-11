document.addEventListener("DOMContentLoaded", function() {
    const key = 'ipified';
    const val = 'true';
    const dismissedKey = 'langRedirectDismissed';
    const ses = sessionStorage.getItem(key) || localStorage.getItem(key);
    const dismissed = sessionStorage.getItem(dismissedKey) || localStorage.getItem(dismissedKey);
    
    console.log('SESH: ' + ses);
    console.log('Current site language: ' + upgates.language);
    
    if (!ses && !dismissed) {
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
                        
                        // Určení preferovaného jazyka uživatele
                        let preferredLang = null;
                        const userLang = navigator.language || navigator.userLanguage;
                        console.log('User browser language: ' + userLang);
                        
                        // Aktuální jazyk webu
                        let currentSiteLang = upgates.language;
                        if (currentSiteLang === "cs") {
                            currentSiteLang = "cz";
                        }
                        
                        // Logika:
                        // 1. Uživatel je v ČR s českým/slovenským prohlížečem → nabídnout cz
                        // 2. Uživatel je v ČR ale má jiný jazyk prohlížeče → nabídnout en
                        // 3. Uživatel je v cizí zemi → nabídnout tl (obecná změna jazyka)
                        
                        if (country === "CZ") {
                            if (userLang.startsWith("cs") || userLang.startsWith("sk")) {
                                preferredLang = "cz";
                            } else {
                                preferredLang = "en";
                            }
                        } else {
                            // Cizí země - nabídnout změnu jazyka
                            preferredLang = "tl";
                        }
                        
                        console.log('Preferred language: ' + preferredLang);
                        console.log('Current site language (normalized): ' + currentSiteLang);
                        
                        // Zobrazit popup když:
                        // 1. Je to "tl" (cizí země) - vždy nabídnout změnu
                        // 2. Nebo preferovaný jazyk se LIŠÍ od aktuálního jazyka webu
                        if (preferredLang === "tl" || (preferredLang && preferredLang !== currentSiteLang)) {
                            console.log('Showing popup - preferredLang: ' + preferredLang);
                            showLanguagePopup(preferredLang, currentSiteLang, key, val, dismissedKey);
                        } else {
                            console.log('Languages match - no popup needed');
                            // Označit jako zpracované, aby se to znovu nekontrolovalo
                            sessionStorage.setItem(key, val);
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
            message: "Zjistili jsme, že preferujete češtinu.",
            recommendation: "Pro správnou funkčnost webu doporučujeme změnit verzi.",
            question: "Přejete si přepnout na českou verzi stránek?",
            confirm: "Ano, přepnout",
            cancel: "Ne, zůstat zde"
        },
        en: {
            title: "Language Change",
            message: "We detected that you prefer English.",
            recommendation: "For proper website functionality, we recommend changing the version.",
            question: "Would you like to switch to the English version?",
            confirm: "Yes, switch",
            cancel: "No, stay here"
        },
        tl: {
            title: "Language Change",
            message: "You are visiting from a different region.",
            recommendation: "For the best experience, you may want to change the language.",
            question: "Would you like to switch to a different language version?",
            confirm: "Yes, show options",
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
                margin: 0 0 10px 0;
                color: #666;
                line-height: 1.5;
            }
            #lang-popup .recommendation {
                color: #007bff;
                font-weight: 500;
                margin-bottom: 10px;
            }
            #lang-popup .question {
                margin-bottom: 25px;
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
        <p class="recommendation">${t.recommendation}</p>
        <p class="question">${t.question}</p>
        <div class="btn-container">
            <button class="btn-confirm" id="lang-popup-confirm">${t.confirm}</button>
            <button class="btn-cancel" id="lang-popup-cancel">${t.cancel}</button>
        </div>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Event listener pro potvrzení
    document.getElementById('lang-popup-confirm').addEventListener('click', function() {
        // Nastavit PŘED přesměrováním
        sessionStorage.setItem(key, val);
        localStorage.setItem(key, val);
        overlay.remove();
        
        // Logika pro přepnutí jazyka
        const toggleElement = document.querySelector('.navbar-toggler.dropdown-toggle');
        if (toggleElement) {
            toggleElement.click();
            
            // Pro "tl" jen otevřeme dropdown a necháme uživatele vybrat
            if (targetLang === "tl") {
                console.log("Dropdown opened for manual language selection");
                return;
            }
            
            // Pro konkrétní jazyk (cz, en) automaticky klikneme na správnou volbu
            setTimeout(() => {
                const dropdownMenu = document.querySelector('.dropdown-menu._hdr_lngl');
                const aElement = dropdownMenu ? dropdownMenu.querySelector('a.flag-' + targetLang) : null;
                console.log('aElement: ', aElement);
                if (aElement) {
                    aElement.click();
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
        localStorage.setItem(dismissedKey, 'true');
    });
    
    // Zavření při kliknutí mimo popup
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.remove();
            sessionStorage.setItem(dismissedKey, 'true');
            localStorage.setItem(dismissedKey, 'true');
        }
    });
}

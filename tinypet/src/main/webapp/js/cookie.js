// Définition de l'objet User pour stocker les informations de l'utilisateur authentifié
var User = {
    name: "",
    email: "",
    id: "",
    token: "",
    isAuthenticated: false
};

/**
 * Vérifie si un jeton JWT est expiré.
 * @param {string} token - Le jeton JWT à vérifier.
 * @returns {boolean} - Retourne vrai si le jeton est expiré, sinon faux.
 */
function isTokenExpired(token) {
    const decodedToken = jwt_decode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp < currentTime;
}

/**
 * Définit un cookie dans le navigateur de l'utilisateur.
 * @param {string} name - Nom du cookie.
 * @param {string} value - Valeur du cookie.
 * @param {number} days - Nombre de jours avant l'expiration du cookie.
 */
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

/**
 * Récupère la valeur d'un cookie.
 * @param {string} name - Nom du cookie.
 * @returns {string|null} - Valeur du cookie, ou null si non trouvé.
 */
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/**
 * Efface un cookie.
 * @param {string} name - Nom du cookie à effacer.
 */
function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}

/**
 * Gère la réponse après une authentification réussie avec Google Sign-In.
 * @param {Object} response - La réponse contenant les données d'authentification.
 */
function handleCredentialResponse(response) {
    console.log("callback called:", response.credential);
    const data_response = jwt_decode(response.credential);
    console.log("ID: " + data_response.sub);
    console.log('Given Name: ' + data_response.given_name + " " + data_response.family_name);
    console.log("Email: " + data_response.email);

    // Processus pour enregistrer ou connecter l'utilisateur
    if (getCookie('pseudo')) {
        // Vérifier et créer l'utilisateur si nécessaire
        m.request({
            method: "POST",
            url: "https://faculte-tp1.ew.r.appspot.com/ressources/api/tinyPet/1/addUser",
            body: {
                pseudo: getCookie('pseudo') || data_response.given_name + " " + data_response.family_name,
                userId: data_response.sub,
                token: response.credential
            }
        })
        .then(function (result) {
            console.log("Utilisateur ajouté:", result);
            updateUserState(data_response, response.credential);
        })
        .catch(function (error) {
            handleUserAdditionError(error, data_response, response.credential);
        });
    } else {
        updateUserState(data_response, response.credential);
    }
}

/**
 * Met à jour l'état de l'utilisateur dans le système et sauvegarde dans les cookies.
 * @param {Object} userData - Données de l'utilisateur.
 * @param {string} token - Jeton d'authentification de l'utilisateur.
 */
function updateUserState(userData, token) {
    User.isAuthenticated = true;
    User.token = token;
    User.email = userData.email;
    User.name = userData.given_name + " " + userData.family_name;
    User.id = userData.sub;
    setCookie('user', JSON.stringify(User), 1);
    m.route.set("/authenticatedView");
    m.redraw();
}

/**
 * Gère les erreurs lors de l'ajout de l'utilisateur au système.
 * @param {Object} error - Objet d'erreur renvoyé par la requête.
 * @param {Object} userData - Données de l'utilisateur.
 * @param {string} token - Jeton d'authentification de l'utilisateur.
 */
function handleUserAdditionError(error, userData, token) {
    if (error.code === 409) {
        console.log("Utilisateur existe déjà:", error);
        updateUserState(userData, token);
    } else {
        console.error("Erreur lors de l'ajout de l'utilisateur:", error);
        NotificationSystem.createNotification("Erreur lors de l'ajout de l'utilisateur: " + error.message, "error");
    }
}

/**
 * Charge l'utilisateur depuis les cookies au démarrage de l'application.
 */
function loadUserFromCookies() {
    const userCookie = getCookie('user');
    if (userCookie) {
        const user = JSON.parse(userCookie);
        User.name = user.name;
        User.email = user.email;
        User.id = user.id;
        User.token = user.token;
        User.isAuthenticated = user.isAuthenticated;
        if (isTokenExpired(User.token)) {
            logout();
        }
    }
}

/**
 * Déconnecte l'utilisateur et efface les cookies associés.
 */
function logout() {
    User.name = "";
    User.email = "";
    User.id = "";
    User.token = "";
    User.isAuthenticated = false;
    eraseCookie('user');
    window.location.href = "https://faculte-tp1.ew.r.appspot.com/indexTinyPet.html";
    m.redraw();
}

/**
 * Charge dynamiquement le script Google Sign-In.
 * @param {function} callback - Fonction à appeler après le chargement du script.
 */
function loadGoogleScript(callback) {
    var script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = callback;
    document.head.appendChild(script);
}

// Initialisation : Charger l'utilisateur depuis les cookies au démarrage
loadUserFromCookies();

/**
 * Module PetitionTabs gère les affichages des pétitions signées et créées par l'utilisateur.
 * Permet également de visualiser les détails des signataires pour les pétitions créées.
 */
var PetitionTabs = {
    signedPetitions: [],
    createdPetitions: [],
    activeTab: "createdPetitions",
    showModal: false,
    selectedSignataires: [],

    /**
     * Initialisation du module, récupère les pétitions signées et créées à l'initialisation.
     */
    oninit: function() {
        this.fetchCreatedPetitions();
        this.fetchSignedPetitions();
    },

    /**
     * Récupère les pétitions que l'utilisateur a signées.
     */
    fetchSignedPetitions: function() {
        if (isTokenExpired(User.token)) {
            NotificationSystem.createNotification("Votre session a expiré. Veuillez vous reconnecter.", "error");
            logout();
            return;
        }
        m.request({
            method: "GET",
            url: "https://faculte-tp1.ew.r.appspot.com/ressources/api/tinyPet/1/petitionSignedUser/" + User.email
        }).then(this.handlePetitionsResponse.bind(this, 'signedPetitions'))
          .catch(this.handleError);
    },

    /**
     * Récupère les pétitions créées par l'utilisateur.
     */
    fetchCreatedPetitions: function() {
        if (isTokenExpired(User.token)) {
            NotificationSystem.createNotification("Votre session a expiré. Veuillez vous reconnecter.", "error");
            logout();
            return;
        }
        m.request({
            method: "GET",
            url: "https://faculte-tp1.ew.r.appspot.com/ressources/api/tinyPet/1/petitionCreatedUser/" + User.email
        }).then(this.handlePetitionsResponse.bind(this, 'createdPetitions'))
          .catch(this.handleError);
    },

    /**
     * Traite la réponse de l'API pour les pétitions.
     * @param {string} type - Type de pétition ('signedPetitions' ou 'createdPetitions').
     * @param {Object} result - Réponse de l'API.
     */
    handlePetitionsResponse: function(type, result) {
        if (result && result.items) {
            this[type] = result.items.map(petition => ({
                id: petition.id,
                namePetition: petition.namePetition,
                description: petition.description,
                nbsignataires: petition.nbsignataires,
                pseudo: petition.pseudo,
                formattedDate: petition.formattedDate,
                tags: petition.tags || []
            }));
        } else {
            console.error("Format de réponse invalide ou vide:", result);
        }
    },

    /**
     * Gère les erreurs de l'API lors de la récupération des pétitions.
     * @param {Object} error - L'erreur retournée.
     */
    handleError: function(error) {
        console.error("Erreur lors de la récupération des pétitions:", error);
    },

    /**
     * Vue principale du module, affiche les pétitions et gère les interactions utilisateur.
     */
    view: function() {
        return [
            m(Header),
            this.renderPetitionsSection(),
            m(Footer)
        ];
    },

    /**
     * Construit la section contenant les onglets et les pétitions.
     */
    renderPetitionsSection: function() {
        return m("section", { class: "section" }, [
            m("div", { class: "container" }, [
                m("h1", { class: "title" }, "Mes Pétitions"),
                this.renderTabs(),
                this.renderContent()
            ])
        ]);
    },

    /**
     * Génère les onglets pour basculer entre les pétitions signées et créées.
     */
    renderTabs: function() {
        return m("div", { class: "tabs is-boxed" }, [
            m("ul", [
                this.renderTabItem("createdPetitions", "Pétitions Créées"),
                this.renderTabItem("signedPetitions", "Pétitions Signées")
            ])
        ]);
    },

    /**
     * Construit un élément de l'onglet.
     * @param {string} tab - Le nom de l'onglet.
     * @param {string} label - Le label à afficher sur l'onglet.
     */
    renderTabItem: function(tab, label) {
        return m("li", { class: this.activeTab === tab ? "is-active" : "" }, [
            m("a", { onclick: () => { this.activeTab = tab; } }, label)
        ]);
    },

    /**
     * Affiche le contenu de l'onglet actif.
     */
    renderContent: function() {
        return m("div", { class: "content" }, [
            this.activeTab === "signedPetitions" ? this.renderPetitionsList(this.signedPetitions) : this.renderPetitionsList(this.createdPetitions, true)
        ]);
    },

    /**
     * Affiche une liste de pétitions. Permet d'ajouter des actions spécifiques pour les pétitions créées.
     * @param {Array} petitions - Liste des pétitions à afficher.
     * @param {boolean} [allowActions=false] - Indique si des actions supplémentaires sont autorisées (pour les pétitions créées).
     */
    renderPetitionsList: function(petitions, allowActions = false) {
        if (petitions.length === 0) {
            return m("p", "Aucune pétition trouvée");
        }
        return m("div", { class: "petition-grid" }, 
            petitions.map(petition => this.renderPetitionBox(petition, allowActions))
        );
    },

    /**
     * Construit le contenu d'une pétition spécifique, incluant les boutons d'action si nécessaire.
     * @param {Object} petition - La pétition à afficher.
     * @param {boolean} allowActions - Si vrai, ajoute un bouton pour voir les signataires.
     */
    renderPetitionBox: function(petition, allowActions) {
        let elements = [
            m("p", { class: "title" }, `Nom : ${petition.namePetition}`),
            m("p", `Description : ${petition.description}`),
            m("p", `Nombre de signatures : ${petition.nbsignataires}`),
            m("p", `Créateur : ${petition.pseudo}`),
            m("p", `Date de création : ${petition.formattedDate}`),
            m("p", `Tags : ${petition.tags.join(', ')}`)
        ];
        if (allowActions) {
            elements.push(
                m("button", {
                    class: "button is-info",
                    onclick: () => {
                        this.selectedSignataires = petition.signataires;
                        this.showModal = true;
                    }
                }, "Voir les signataires")
            );
        }
        return m("div", { class: "petition-box" }, elements);
    }
};

/**
 * Module pour la création de pétitions.
 * Gère la saisie des informations de la pétition et leur envoi au serveur.
 */
var CreatePetition = {
    // Initialisation des données de la pétition.
    petition: {
        name: "",
        description: "",
        tags: ""
    },

    /**
     * Vérifie les prérequis avant de créer une pétition.
     */
    createPetition: () => {
        // Vérification de l'authentification de l'utilisateur.
        if (User.token === "") {
            console.error("Veuillez vous connecter pour créer une pétition");
            NotificationSystem.createNotification("Veuillez vous connecter pour créer une pétition", "error");
            return;
        }

        // Validation des champs obligatoires.
        if (!CreatePetition.petition.name.trim() || !CreatePetition.petition.description.trim()) {
            NotificationSystem.createNotification("Le nom et la description ne doivent pas être vides.", "error");
            return;
        }

        // Vérification de l'expiration du token.
        if (isTokenExpired(User.token)) {
            NotificationSystem.createNotification("Votre session a expiré. Veuillez vous reconnecter.", "error");
            logout();
            return;
        }

        // Appel à l'API pour la création de la pétition.
        CreatePetition.submitPetition();
    },

    /**
     * Soumet les données de la pétition à l'API.
     */
    submitPetition: () => {
        return m.request({
            method: "POST",
            url: "https://faculte-tp1.ew.r.appspot.com/ressources/api/tinyPet/1/createPetition/",
            body: {
                name: CreatePetition.petition.name,
                description: CreatePetition.petition.description,
                tags: CreatePetition.petition.tags,
                token: User.token,
                userId: User.id,
                email: User.email,
                pseudo: User.name
            }
        }).then(function(result) {
            console.log("Tags", CreatePetition.petition.tags.split(",").map(tag => tag.trim()));
            console.log("Pétition créée:", result);
            CreatePetition.resetForm();
            NotificationSystem.createNotification("Pétition créée avec succès!", "success");
            window.location = "https://faculte-tp1.ew.r.appspot.com/";
        }).catch(function(error) {
            console.error("Erreur pour créer la pétition:", error);
            NotificationSystem.createNotification("Erreur pour créer la pétition: " + error.message, "error");
        });
    },

    /**
     * Réinitialise les champs du formulaire après une création réussie.
     */
    resetForm: () => {
        CreatePetition.petition.name = "";
        CreatePetition.petition.description = "";
        CreatePetition.petition.tags = "";
        m.redraw();
    },

    /**
     * Génère la vue pour la création de pétition.
     */
    view: function() {
        return [
            m(Header),
            m("section", { class: "section" }, [
                m("div", { class: "container" }, [
                    m("h1", { class: "title has-text-centered" }, "Créer une Pétition"),
                    m("div", { class: "box" }, [
                        this.renderInputField("Nom", "text", "Nom", "signature", CreatePetition.petition.name, (e) => { CreatePetition.petition.name = e.target.value; }),
                        this.renderInputField("Description", "text", "Description", "align-left", CreatePetition.petition.description, (e) => { CreatePetition.petition.description = e.target.value; }),
                        this.renderInputField("Tags (séparés par des virgules)", "text", "Tags, séparés par des virgules", "tags", CreatePetition.petition.tags, (e) => { CreatePetition.petition.tags = e.target.value; }),
                        m("div", { class: "field" }, [
                            m("div", { class: "control has-text-centered" }, [
                                m("button.button.is-primary.is-medium", { onclick: CreatePetition.createPetition }, "Soumettre")
                            ])
                        ])
                    ])
                ])
            ]),
            m(Footer)
        ];
    },

    /**
     * Génère les champs de formulaire avec les icônes appropriées.
     */
    renderInputField: (label, type, placeholder, icon, value, oninput) => {
        return m("div", { class: "field" }, [
            m("label", { class: "label" }, label),
            m("div", { class: "control has-icons-left" }, [
                m(`input[type=${type}][placeholder=${placeholder}][maxlength=${type === "text" ? 100 : 10000}]`, {
                    class: "input",
                    oninput: oninput,
                    value: value
                }),
                m("span", { class: "icon is-left" }, m("i", { class: "fas fa-${icon}" }))
            ])
        ]);
    }
};

// Exemple d'utilisation du module pour créer une vue.
m.mount(document.body, CreatePetition);
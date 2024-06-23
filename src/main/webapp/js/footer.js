var Footer = {
    view: function() {
        return m("footer", { class: "footer" }, [
            m("div", { class: "top-bar", style: "height: 5px; background-color: #3273dc;" }), // Barre bleue
            m("div", { class: "content has-text-centered" }, [
                m("div", { class: "social-links" }, [
                    m("a", { href: "https://www.facebook.com", target: "_blank", class: "icon" }, [
                        m("i", { class: "fab fa-facebook-f" })
                    ]),
                    m("a", { href: "https://www.twitter.com", target: "_blank", class: "icon" }, [
                        m("i", { class: "fab fa-twitter" })
                    ]),
                    m("a", { href: "https://www.instagram.com", target: "_blank", class: "icon" }, [
                        m("i", { class: "fab fa-instagram" })
                    ]),
                    m("a", { href: "https://www.linkedin.com/in/pascalmolli/", target: "_blank", class: "icon" }, [
                        m("i", { class: "fab fa-linkedin-in" })
                    ])
                ]),
                m("address", "sud-est de Tatooine "),
                m("p", "© 2024 Empire galactique. Tous droits réservés.")
            ])
        ]);
    }
};

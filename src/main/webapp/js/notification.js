/**
 * NotificationSystem gère l'affichage et la suppression de notifications sur la page.
 */
var NotificationSystem = {
    notifications: [],
    container: null,
    maxNotifications: 5,

    /**
     * Initialise le conteneur de notifications et l'attache au corps du document.
     */
    init: function() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    },

    /**
     * Crée une notification avec un message spécifique, un type et une durée d'affichage.
     * @param {string} message - Le message à afficher dans la notification.
     * @param {string} [type='success'] - Le type de notification ('success', 'error', etc.).
     * @param {number} [duration=2500] - Durée d'affichage de la notification en millisecondes.
     */
    createNotification: function(message, type = 'success', duration = 2500) {
        if (this.notifications.length >= this.maxNotifications) {
            this.removeOldestNotification();
        }

        var notification = this.buildNotificationElement(message, type);
        this.addProgressBar(notification, duration);
        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Suppression automatique après la durée spécifiée
        setTimeout(() => this.removeNotification(notification), duration);
    },

    /**
     * Construit l'élément HTML pour une notification.
     * @param {string} message - Le message de la notification.
     * @param {string} type - Le type de notification.
     * @returns {HTMLElement} - L'élément de notification créé.
     */
    buildNotificationElement: function(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `<span>${message}</span><button class="close-btn">&times;</button>`;
        notification.querySelector('button').addEventListener('click', (event) => {
            event.stopPropagation();
            this.removeNotification(notification);
        });
        return notification;
    },

    /**
     * Ajoute une barre de progression à la notification qui s'anime sur la durée spécifiée.
     * @param {HTMLElement} notification - L'élément de notification à modifier.
     * @param {number} duration - La durée de l'animation en millisecondes.
     */
    addProgressBar: function(notification, duration) {
        var progressBar = document.createElement('div');
        progressBar.className = 'progress';
        progressBar.style.animationDuration = duration + 'ms';
        notification.appendChild(progressBar);
    },

    /**
     * Supprime la notification la plus ancienne lorsque la limite maximale est atteinte.
     */
    removeOldestNotification: function() {
        const oldest = this.notifications.shift();
        if (oldest && oldest.parentNode) {
            oldest.parentNode.removeChild(oldest);
        }
    },

    /**
     * Supprime une notification spécifique de l'affichage et du tableau de suivi.
     * @param {HTMLElement} notification - L'élément de notification à supprimer.
     */
    removeNotification: function(notification) {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications = this.notifications.filter(n => n !== notification);
        }, 300); // Délai pour permettre l'animation de disparition
    }
};

// Initialisation du système de notifications une fois que le DOM est complètement chargé
document.addEventListener('DOMContentLoaded', () => NotificationSystem.init());

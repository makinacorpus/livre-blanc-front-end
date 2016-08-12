var API_URL = 'http://127.0.0.1:5000';
// var API_URL = 'https://mails-livre-blanc.herokuapp.com';

// Create a new instance of ladda for the specified button
var buttonD = window.Ladda.create(document.getElementById('download-button'));
var buttonN = window.Ladda.create(document.getElementById('newsletter-button'));

function showResponse(element, type, text) {
  document.getElementById(element).innerHTML = text;
  document.getElementById(element).classList = 'form-response ' + type;
}

function download(e) {
  e.preventDefault(e);
  buttonD.start();
  window.ga('send', {
    hitType: 'event',
    eventCategory: 'Button',
    eventAction: 'download',
    eventLabel: 'Téléchargement livre blanc'
  });

  var email = e.target[0].value;
  var url = API_URL + '/predownload?email=' + email;

  fetch(url)
  .then(function(response) {
    buttonD.stop();
    if (response.status !== 200) {
      showResponse('download-response', 'error', 'Une erreur est survenue. Veuillez réessayer. Status Code: ' + response.status);
      return;
    }

    response.json().then(function() {
      showResponse('download-response', 'success', 'Votre email a bien été enregistré. Vous recevrez le livre blanc prochainement. Merci');
    });
  })
  .catch(function(error) {
    buttonD.stop();
    showResponse('download-response', 'error', 'Erreur serveur : ' + error);
  });
}

function subscribe(e) {
  e.preventDefault(e);
  buttonN.start();

  window.ga('send', {
    hitType: 'event',
    eventCategory: 'Button',
    eventAction: 'subscribe',
    eventLabel: 'Inscription newsletter'
  });

  var email = e.target[0].value;
  var url = API_URL + '/subscribe?email=' + email;

  fetch(url)
  .then(function(response) {
    buttonN.stop();
    if (response.status !== 200) {
      showResponse('newsletter-response', 'error', 'Une erreur est survenue. Veuillez réessayer. Status Code: ' + response.status);
      return;
    }

    response.json().then(function(contact) {
      if (!contact.new) {
        showResponse('newsletter-response', 'warning', 'Vous êtes déjà inscrit ! Merci :)');
      } else {
        showResponse('newsletter-response', 'success', 'Félicitation, vous êtes inscrit avec succès !');
      }
    });
  })
  .catch(function(error) {
    buttonN.stop();
    showResponse('newsletter-response', 'error', 'Erreur serveur : ' + error);
  });
}

document.getElementById('download').addEventListener('submit', download, false);
document.getElementById('newsletter').addEventListener('submit', subscribe, false);

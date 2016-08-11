// var API_URL = 'http://127.0.0.1:5000';
var API_URL = 'https://mails-livre-blanc.herokuapp.com';

function showResponse(element, type, text) {
  document.getElementById(element).innerHTML = text;
  document.getElementById(element).classList = 'form-response ' + type;
}

function download(e) {
  e.preventDefault(e);
  var email = e.target[0].value;
  var url = API_URL + '/download/' + email;

  fetch(url)
  .then(function(response) {
    if (response.status !== 200) {
      showResponse('download-response', 'error', 'Une erreur est survenue. Veuillez réessayer. Status Code: ' + response.status);
      return;
    }

    response.json().then(function() {
      showResponse('download-response', 'success', 'Un email contenant un lien vers le Livre Blanc vous a été envoyé avec succès.');
    });
  })
  .catch(function(error) {
    showResponse('download-response', 'error', 'Erreur serveur : ' + error);
  });
}

function sendmail(e) {
  e.preventDefault(e);
  var email = e.target[0].value;
  var url = API_URL + '/contactslist/' + email;

  fetch(url)
  .then(function(response) {
    if (response.status !== 200) {
      showResponse('newsletter-response', 'error', 'Une erreur est survenue. Veuillez réessayer. Status Code: ' + response.status);
      return;
    }

    response.json().then(function(contact) {
      console.log(contact);
      if (!contact.new) {
        showResponse('newsletter-response', 'warning', 'Vous êtes déjà inscrit ! Merci :)');
      } else {
        showResponse('newsletter-response', 'success', 'Félicitation, vous êtes inscrit avec succès !');
      }
    });
  })
  .catch(function(error) {
    showResponse('newsletter-response', 'error', 'Erreur serveur : ' + error);
  });
}

document.getElementById('download').addEventListener('submit', download, false);
document.getElementById('newsletter').addEventListener('submit', sendmail, false);

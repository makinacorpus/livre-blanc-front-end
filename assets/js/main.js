(function() {

'use strict';


/******************************************************
API URLs
******************************************************/

// var API_URL = 'http://127.0.0.1:4000';
var API_URL = 'https://mails-livre-blanc.herokuapp.com';


/******************************************************
Loading buttons
******************************************************/

// Create a new instance of ladda for the specified button
var buttonD = window.Ladda.create(document.getElementById('download-button'));


/******************************************************
Form response
******************************************************/

function showResponse(element, type, text) {
  if (document.getElementById(element)) {
    document.getElementById(element).innerHTML = text;
    document.getElementById(element).classList = 'form-response ' + type;
  }
}


/******************************************************
Animate the scroll
******************************************************/

var smoothScroll = function (anchor, duration) {

    // Calculate how far and how fast to scroll
    var startLocation = window.pageYOffset;
    var endLocation = anchor.offsetTop + 20;
    var distance = endLocation - startLocation;
    var increments = distance/(duration/16);
    var stopAnimation;

    // Scroll the page by an increment, and check if it's time to stop
    var animateScroll = function () {
        window.scrollBy(0, increments);
        stopAnimation();
    };

    // If scrolling down
    if ( increments >= 0 ) {
        // Stop animation when you reach the anchor OR the bottom of the page
        stopAnimation = function () {
            var travelled = window.pageYOffset;
            if ( (travelled >= (endLocation - increments)) || ((window.innerHeight + travelled) >= document.body.offsetHeight) ) {
                clearInterval(runAnimation);
            }
        };
    }
    // If scrolling up
    else {
        // Stop animation when you reach the anchor OR the top of the page
        stopAnimation = function () {
            var travelled = window.pageYOffset;
            if ( travelled <= (endLocation || 0) ) {
                clearInterval(runAnimation);
            }
        };
    }

    // Loop the animation function
    var runAnimation = setInterval(animateScroll, 16);
};


/******************************************************
Open form after enter email
******************************************************/

function openForm(e) {
    e.preventDefault(e);
    var downloadSection = document.getElementById('download-section');

    document.getElementById('download').classList.remove('close');
    document.getElementById('downloadBook').classList.add('close');
    downloadSection.classList.toggle('open');
    smoothScroll(downloadSection, 500 || 500);
}


/******************************************************
Download after completing form
******************************************************/

function download(e) {
  e.preventDefault(e);

  var data = new FormData();

  var email = document.getElementById('email').value;
  data.append('email', email);

  for (var i = 0; i < e.target.length; i++) {
    var el = e.target[i];

    if (el.type === 'text') {
      data.append(el.id, el.value);
    }
  }

  buttonD.start();
  window.ga('send', {
    hitType: 'event',
    eventCategory: 'Button',
    eventAction: 'download',
    eventLabel: 'Téléchargement livre blanc'
  });
  
  // Subscribe newsletter
  if (document.getElementById('chk_newsletter').checked) {
    subscribe(e);
  }

  fetch(API_URL + '/download', {
    method: 'POST',
    body: data
  })
  .then(function(response) {
    buttonD.stop();
    if (response.status !== 200) {
      showResponse('download-response', 'error', 'Une erreur est survenue. Veuillez réessayer. Status Code: ' + response.status);
      return;
    }

    response.json().then(function(response) {
      document.getElementById('download-section').classList.add('close');
      showResponse('download-response', 'success', 'Un email contenant un lien vers le livre blanc vous a été envoyé avec succès.');
    });
  })
  .catch(function(error) {
    buttonD.stop();
    showResponse('download-response', 'error', 'Erreur serveur : ' + error);
  });

}


/******************************************************
Subscribe newsletter
******************************************************/

function subscribe(e) {
  e.preventDefault(e);

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
    showResponse('newsletter-response', 'error', 'Erreur serveur : ' + error);
  });
}


/******************************************************
Close form
******************************************************/

function closeForm(e) {
  e.preventDefault(e);
  document.getElementById("download").reset();
  document.getElementById('download-section').classList.remove('open');
  document.getElementById('download-section').classList.remove('close');
  var response = document.getElementById('download-response');
  response.classList.remove('success');
  response.classList.remove('error');
  response.innerHTML = '';
}


/******************************************************
Events
******************************************************/

document.getElementById('getemail').addEventListener('submit', openForm, false);
document.getElementById('download').addEventListener('submit', download, false);
document.getElementById('close').addEventListener('click', closeForm, false);

})();

/***************** Waypoints ******************/

$(document).ready(function() {

	$('.wp1').waypoint(function() {
		$('.wp1').addClass('animated fadeInLeft');
	}, {
		offset: '75%'
	});
	$('.wp2').waypoint(function() {
		$('.wp2').addClass('animated fadeInUp');
	}, {
		offset: '75%'
	});
	$('.wp3').waypoint(function() {
		$('.wp3').addClass('animated fadeInDown');
	}, {
		offset: '55%'
	});
	$('.wp4').waypoint(function() {
		$('.wp4').addClass('animated fadeInDown');
	}, {
		offset: '75%'
	});
	$('.wp5').waypoint(function() {
		$('.wp5').addClass('animated fadeInUp');
	}, {
		offset: '75%'
	});
	$('.wp6').waypoint(function() {
		$('.wp6').addClass('animated fadeInDown');
	}, {
		offset: '75%'
	});

});

/***************** Slide-In Nav ******************/

$(window).load(function() {

	$('.nav_slide_button').click(function() {
		$('.pull').slideToggle();
	});

});

/***************** Smooth Scrolling ******************/

$(function() {

	$('a[href*=#]:not([href=#])').click(function() {
		if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
			if (target.length) {
				$('html,body').animate({
					scrollTop: target.offset().top
				}, 2000);
				return false;
			}
		}
	});

});

/***************** Nav Transformicon ******************/
document.addEventListener('DOMContentLoaded', function() {
	// Fonction pour ouvrir le menu
	function openMenu() {
		document.body.style.overflow = 'hidden'; // Empêcher le défilement de la page lorsque le menu est ouvert
		document.getElementById('nav-toggle').classList.add('active'); // Ajouter la classe active pour l'icône du menu
		document.querySelector('nav.pull').classList.add('open'); // Ajouter la classe open pour le menu
	}

	// Fonction pour fermer le menu
	function closeMenu() {
		document.body.style.overflow = ''; // Rétablir le défilement de la page lorsque le menu est fermé
		document.getElementById('nav-toggle').classList.remove('active'); // Supprimer la classe active pour l'icône du menu
		document.querySelector('nav.pull').classList.remove('open'); // Supprimer la classe open pour le menu
	}

	// Ajouter un écouteur d'événements au bouton de menu
	document.getElementById('nav-toggle').addEventListener('click', function(event) {
		event.preventDefault(); // Empêche le comportement par défaut du lien
		var isActive = this.classList.contains('active'); // Vérifier si le menu est actif
		if (!isActive) {
			openMenu(); // Appeler la fonction pour ouvrir le menu
		} else {
			closeMenu(); // Appeler la fonction pour fermer le menu
		}
	});

	// Ajouter des écouteurs d'événements à chaque élément du menu pour fermer le menu lorsqu'il est cliqué
	var menuItems = document.querySelectorAll('nav.pull a');
	menuItems.forEach(function(item) {
		item.addEventListener('click', function() {
			closeMenu(); // Appeler la fonction pour fermer le menu
		});
	});
});

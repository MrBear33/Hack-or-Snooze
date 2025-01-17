'use strict'

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */
function navAllStories(evt) {
	console.debug('navAllStories', evt)
	hidePageComponents()
	hideError()
	putStoriesOnPage()
}

$body.on('click', '#nav-all', navAllStories)

/** Show login/signup on click on "login" */
function navLoginClick(evt) {
	console.debug('navLoginClick', evt)
	hidePageComponents()
	hideError()
	$loginForm.show()
	$signupForm.show()
}

$navLogin.on('click', navLoginClick)

/** Show new story form on click on "submit" */
function navSubmitClick(evt) {
	console.debug('navSubmitClick', evt)
	hidePageComponents()
	hideError()
	$newStoryForm.show()
}

$navSubmit.on('click', navSubmitClick)

/** Show favorites on click on "favorites" */
function navFavoritesClick(evt) {
	console.debug('navFavoritesClick', evt)
	hidePageComponents()
	hideError()
	putFavoritesListOnPage()
}

$body.on('click', '#nav-favorites', navFavoritesClick)

/** When a user first logins in, update the navbar to reflect that. */
function updateNavOnLogin() {
	console.debug('updateNavOnLogin')
	$('.main-nav-links').show()
	$navLogin.hide()
	$navLogOut.show()
	$navUserProfile.text(`${currentUser.username}`).show()
}

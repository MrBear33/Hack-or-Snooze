'use strict'

// So we don't have to keep re-finding things on page, find DOM elements once:
const $body = $('body')
const $storiesLoadingMsg = $('#stories-loading-msg')
const $allStoriesList = $('#all-stories-list')
const $loginForm = $('#login-form')
const $signupForm = $('#signup-form')
const $newStoryForm = $('#new-story-form')
const $navLogin = $('#nav-login')
const $navUserProfile = $('#nav-user-profile')
const $navLogOut = $('#nav-logout')
const $navSubmit = $('#nav-submit')
const $navFavorites = $('#nav-favorites')
const $favoritesList = $('#favorites-list')
const $errorMessage = $('#error-message') // Error message container

/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */
function hidePageComponents() {
	const components = [
		$allStoriesList,
		$loginForm,
		$signupForm,
		$newStoryForm,
		$favoritesList,
		$errorMessage, // Hide error message as well
	]
	components.forEach((c) => c.hide())
}

/** Display error message */
function showError(message) {
	$errorMessage.text(message).removeClass('hidden').show()
}

/** Hide error message */
function hideError() {
	$errorMessage.text('').addClass('hidden').hide()
}

/** Overall function to kick off the app. */
async function start() {
	console.debug('start')

	// "Remember logged-in user" and log in, if credentials in localStorage
	try {
		await checkForRememberedUser()
		await getAndShowStoriesOnStart()
	} catch (error) {
		console.error('Error during app initialization:', error)
		showError('Error during app initialization. Please try again.')
	}

	// if we got a logged-in user
	if (currentUser) updateUIOnUserLogin()
}

// Once the DOM is entirely loaded, begin the app
console.warn(
	'HEY STUDENT: This program sends many debug messages to' +
		" the console. If you don't see the message 'start' below this, you're not" +
		' seeing those helpful debug messages. In your browser console, click on' +
		" menu 'Default Levels' and add Verbose"
)
$(start)
